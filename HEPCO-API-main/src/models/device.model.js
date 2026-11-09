const { prisma } = require('../db');
const { DEVICE_STATUS } = require('../constants/device');

class DeviceModel {
  static async getAll(params) {
    const { search, category_id, category_code, brand, min_price, max_price, serial_number, status, supplier_id, is_component, hide_assembled, exact_name, exact_model, exact_spec_detail, sort, page = 1, limit = 20 } = params;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { asset_code: { contains: search } },
        { serial_number: { contains: search } }
      ];
    }
    
    if (category_id) where.category_id = Number(category_id);
    if (category_code) where.category = { code: category_code };
    if (brand) where.brand = { contains: brand };
    if (serial_number) where.serial_number = { contains: serial_number };
    if (status) where.status = status;
    if (supplier_id) where.supplier_id = Number(supplier_id);
    if (is_component !== undefined) {
      if (is_component === 'true') {
        where.category = { ...where.category, parent_id: { not: null } };
      } else {
        where.category = { ...where.category, parent_id: null };
      }
    }
    if (exact_name) where.name = exact_name;
    if (exact_model) {
      where.model = exact_model === 'null' ? null : exact_model;
    }
    if (exact_spec_detail) {
      where.spec_detail = exact_spec_detail === 'null' ? null : exact_spec_detail;
    }
    if (hide_assembled === 'true') {
      where.parent_device_id = null;
    }
    
    if (min_price || max_price) {
      where.purchase_price = {};
      if (min_price) where.purchase_price.gte = Number(min_price);
      if (max_price) where.purchase_price.lte = Number(max_price);
    }

    const offset = (Number(page) - 1) * Number(limit);

    // Compute stats based on the same filters but ignoring the status filter itself
    const statsWhere = { ...where };
    delete statsWhere.status;

    const statsGroup = await prisma.device.groupBy({
      by: ['status'],
      where: statsWhere,
      _count: { id: true }
    });

    const stats = {
      total: 0,
      in_stock: 0,
      in_use: 0,
      broken: 0
    };

    statsGroup.forEach(g => {
      stats.total += g._count.id;
      if (g.status === 'in_stock') stats.in_stock = g._count.id;
      if (g.status === 'in_use') stats.in_use = g._count.id;
      if (g.status === 'broken') stats.broken = g._count.id;
    });

    if (params.group_by === 'true') {
      const groups = await prisma.device.groupBy({
        by: ['name', 'category_id', 'spec_detail', 'brand', 'model'],
        where,
        _count: { id: true },
        orderBy: { name: 'asc' }
      });

      const paginatedGroups = groups.slice(offset, offset + Number(limit));
      
      const categories = await prisma.deviceCategory.findMany();
      const categoryMap = categories.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
      
      const data = paginatedGroups.map(g => ({
        ...g,
        quantity: g._count.id,
        category: categoryMap[g.category_id],
        is_grouped: true,
        id: `${g.name}-${g.category_id}-${g.status}-${g.spec_detail || ''}`
      }));
      
      return {
        data,
        meta: {
          total: groups.length,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(groups.length / Number(limit)) || 1,
          stats
        }
      };
    }

    let orderBy = { created_at: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'name_desc') orderBy = { name: 'desc' };
    else if (sort === 'code_asc') orderBy = { asset_code: 'asc' };
    else if (sort === 'code_desc') orderBy = { asset_code: 'desc' };
    else if (sort === 'price_asc') orderBy = { purchase_price: 'asc' };
    else if (sort === 'price_desc') orderBy = { purchase_price: 'desc' };
    else if (sort === 'created_at_asc') orderBy = { created_at: 'asc' };

    const [total, data] = await Promise.all([
      prisma.device.count({ where }),
      prisma.device.findMany({
        where,
        skip: offset,
        take: Number(limit),
        orderBy,
        include: {
          category: true,
          supplier: true,
          parent_device: true,
          child_devices: {
            include: { category: true }
          },
          _count: {
            select: { assignments: true }
          }
        }
      })
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        stats
      }
    };
  }

  static async getAllCategories() {
    return prisma.deviceCategory.findMany();
  }

  static async getById(id) {
    return prisma.device.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        supplier: true,
        parent_device: true,
        child_devices: true,
        assignments: {
          include: { employee: true }
        }
      }
    });
  }

  static async create(payload) {
    const { name, category_id, parent_device_id, brand, model, serial_number, spec_detail, manufacture_year, purchase_date, purchase_price, warranty_expiry, supplier_id, location, notes, quantity, child_devices } = payload;
    const qty = Math.max(1, parseInt(quantity) || 1);
    
    const getSeqInfo = async (cat_id) => {
      let pfx = 'DEV';
      let mx = 0;
      if (!cat_id) return { prefix: pfx, maxSeq: Math.floor(Date.now() / 1000) };
      
      const cat = await prisma.deviceCategory.findUnique({ where: { id: Number(cat_id) } });
      if (cat) {
        pfx = cat.code || 'DEV';
        if (!cat.code) {
          const match = cat.name.match(/\(([^)]+)\)/);
          if (match && match[1]) {
            pfx = match[1].toUpperCase();
          } else {
            pfx = cat.name.split(' ')[0].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
          }
        }
        const devs = await prisma.device.findMany({
          where: { asset_code: { startsWith: `${pfx}-` } },
          select: { asset_code: true }
        });
        devs.forEach(d => {
          const parts = d.asset_code.split('-');
          if (parts.length > 1) {
            const num = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(num) && num > mx) mx = num;
          }
        });
      }
      return { prefix: pfx, maxSeq: mx };
    };

    const parentSeq = await getSeqInfo(category_id);
    let childCategorySeqs = {};
    if (child_devices && Array.isArray(child_devices)) {
      const childCategoryIds = [...new Set(child_devices.map(c => c.category_id))];
      for (const cid of childCategoryIds) {
        childCategorySeqs[cid] = await getSeqInfo(cid);
      }
    }

    const devicesToCreate = [];
    for (let i = 0; i < qty; i++) {
      let code;
      if (category_id) {
        parentSeq.maxSeq++;
        code = `${parentSeq.prefix}-${String(parentSeq.maxSeq).padStart(5, '0')}`;
      } else {
        parentSeq.maxSeq++;
        code = `DEV-${parentSeq.maxSeq}`;
      }

      const sn = i === 0 ? (serial_number === '' ? null : serial_number) : null;
      let childrenToCreate = undefined;
      
      if (child_devices && Array.isArray(child_devices) && child_devices.length > 0) {
        childrenToCreate = child_devices.map(child => {
          const seqData = childCategorySeqs[child.category_id];
          seqData.maxSeq++;
          const childCode = `${seqData.prefix}-${String(seqData.maxSeq).padStart(5, '0')}`;
          return {
            asset_code: childCode,
            name: child.name,
            category_id: Number(child.category_id),
            brand: child.brand === '' ? null : child.brand,
            model: child.model === '' ? null : child.model,
            spec_detail: child.spec_detail,
            purchase_price: child.purchase_price ? Number(child.purchase_price) : undefined,
            supplier_id: child.supplier_id === null ? null : (child.supplier_id ? Number(child.supplier_id) : undefined),
            status: DEVICE_STATUS.IN_STOCK
          };
        });
      }

      const createData = {
        asset_code: code, 
        name, 
        category_id: Number(category_id),
        parent_device_id: parent_device_id === null ? null : (parent_device_id ? Number(parent_device_id) : undefined),
        brand: brand === '' ? null : brand, 
        model: model === '' ? null : model, 
        serial_number: sn, 
        spec_detail,
        manufacture_year: manufacture_year ? Number(manufacture_year) : undefined,
        purchase_date: purchase_date ? new Date(purchase_date) : undefined,
        purchase_price: purchase_price ? Number(purchase_price) : undefined,
        warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : undefined,
        supplier_id: supplier_id === null ? null : (supplier_id ? Number(supplier_id) : undefined),
        status: DEVICE_STATUS.IN_STOCK, 
        location: location === '' ? null : location, 
        notes: notes === '' ? null : notes
      };

      if (childrenToCreate) {
        createData.child_devices = { create: childrenToCreate };
      }
      
      devicesToCreate.push(createData);
    }

    if (qty === 1) {
      return prisma.device.create({ data: devicesToCreate[0] });
    } else {
      return prisma.$transaction(
        devicesToCreate.map(data => prisma.device.create({ data }))
      );
    }
  }

  static async update(id, updateData) {
    if (updateData.category_id) updateData.category_id = Number(updateData.category_id);
    if (updateData.parent_device_id) updateData.parent_device_id = Number(updateData.parent_device_id);
    if (updateData.supplier_id) updateData.supplier_id = Number(updateData.supplier_id);
    if (updateData.manufacture_year) updateData.manufacture_year = Number(updateData.manufacture_year);
    if (updateData.purchase_date) updateData.purchase_date = new Date(updateData.purchase_date);
    if (updateData.warranty_expiry) updateData.warranty_expiry = new Date(updateData.warranty_expiry);
    if (updateData.purchase_price) {
      updateData.purchase_price = Number(updateData.purchase_price);
    } else if (updateData.purchase_price === '') {
      updateData.purchase_price = null;
    }

    if (updateData.serial_number === '') updateData.serial_number = null;

    if (updateData.category_id) {
      const currentDevice = await prisma.device.findUnique({
        where: { id: Number(id) },
        include: { child_devices: true }
      });
      if (!currentDevice) throw new Error('NOT_FOUND');

      if (currentDevice.child_devices.length > 0 && currentDevice.category_id !== updateData.category_id) {
        throw new Error('HAS_CHILDREN');
      }
    }

    const device = await prisma.device.update({
      where: { id: Number(id) },
      data: updateData
    });

    if (updateData.status) {
      await prisma.device.updateMany({
        where: { parent_device_id: Number(id) },
        data: { status: updateData.status }
      });
    }
    return device;
  }

  static async delete(id) {
    const device = await prisma.device.findUnique({
      where: { id: Number(id) },
      include: { child_devices: true, assignments: true }
    });

    if (!device) throw new Error('NOT_FOUND');
    if (device.status === DEVICE_STATUS.IN_USE) throw new Error('IN_USE');
    if (device.child_devices && device.child_devices.length > 0) throw new Error('HAS_CHILDREN_DELETE');
    if (device.assignments.length > 0) throw new Error('HAS_HISTORY');

    await prisma.$transaction(async (tx) => {
      await tx.device.delete({ where: { id: Number(id) } });
    });
    return true;
  }

  static async deleteMultiple(ids) {
    const devices = await prisma.device.findMany({
      where: { id: { in: ids.map(id => Number(id)) } },
      include: { child_devices: true, assignments: true }
    });

    const invalidDevice = devices.find(device => 
      device.status === DEVICE_STATUS.IN_USE || 
      (device.child_devices && device.child_devices.length > 0) || 
      (device.assignments && device.assignments.length > 0)
    );

    if (invalidDevice) {
      if (invalidDevice.status === DEVICE_STATUS.IN_USE) throw new Error('IN_USE');
      if (invalidDevice.child_devices && invalidDevice.child_devices.length > 0) throw new Error('HAS_CHILDREN_DELETE');
      if (invalidDevice.assignments.length > 0) throw new Error('HAS_HISTORY');
    }

    await prisma.$transaction(async (tx) => {
      await tx.device.deleteMany({
        where: { id: { in: ids.map(id => Number(id)) } }
      });
    });
    return true;
  }
}

module.exports = DeviceModel;
