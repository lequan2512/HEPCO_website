import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Laptop, Plus, Trash2, ShieldAlert, Edit2, X, Search, Package, AlertTriangle, Filter, Box, CheckCircle, Wrench, Copy } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import { useGetDevices, useAddDevice, useUpdateDevice, useDeleteDevice, useGetCategories, useDeleteMultipleDevices } from '../../../apis/device';
import { useGetSuppliers } from '../../../apis/supplier';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import { DEVICE_CATEGORY_CODES, DEVICE_STATUS } from '../../../constants/device';
import AssembleDeviceModal from '../../../components/AssembleDeviceModal';

const AdminDeviceManager = () => {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [cloneDevice, setCloneDevice] = useState(null);
  const [cloneQuantity, setCloneQuantity] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    brand: '',
    serial_number: '',
    status: '',
    supplier_id: '',
    min_price: '',
    max_price: ''
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [hideAssembled, setHideAssembled] = useState(true);
  const [isGrouped, setIsGrouped] = useState(true);
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [assembleDevice, setAssembleDevice] = useState(null);
  const [viewGroup, setViewGroup] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isDefaultSet, setIsDefaultSet] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const { data: devicesRes, isLoading: isLoadingDevices } = useGetDevices(
    { ...debouncedFilters, hide_assembled: hideAssembled, group_by: isGrouped, page, limit: 20 },
    { enabled: isDefaultSet }
  );
  const devices = devicesRes?.data || [];
  const meta = devicesRes?.meta;

  const { data: groupedDevicesRes, isLoading: isLoadingGroupedDevices } = useGetDevices(
    {
      exact_name: viewGroup?.name,
      exact_model: viewGroup?.model || 'null',
      exact_spec_detail: viewGroup?.spec_detail || 'null',
      category_id: viewGroup?.category_id,
      brand: viewGroup?.brand || '',
      limit: 1000
    },
    { enabled: !!viewGroup }
  );
  const groupedDevicesList = groupedDevicesRes?.data || [];
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories();
  const { data: suppliersRes = {}, isLoading: isLoadingSuppliers } = useGetSuppliers({ limit: 1000 });
  const suppliers = suppliersRes?.data || [];

  const isLoading = isLoadingDevices || isLoadingCategories || isLoadingSuppliers || !isDefaultSet;

  const addDeviceMutation = useAddDevice();
  const updateDeviceMutation = useUpdateDevice();
  const deleteDeviceMutation = useDeleteDevice();
  const deleteMultipleMutation = useDeleteMultipleDevices();

  useEffect(() => {
    if (!isLoadingCategories && !isDefaultSet) {
      Promise.resolve().then(() => {
        if (categories.length > 0) {
          const pcCategory = categories.find(c => c.code === DEVICE_CATEGORY_CODES.PC);
          if (pcCategory) {
            setFilters(prev => ({ ...prev, category_id: pcCategory.id }));
            setDebouncedFilters(prev => ({ ...prev, category_id: pcCategory.id }));
          }
        }
        setIsDefaultSet(true);
      });
    }
  }, [categories, isLoadingCategories, isDefaultSet]);


  useEffect(() => {
    Promise.resolve().then(() => {
      setSelectedIds([]); // Clear selection when page or filters change
    });
  }, [page, debouncedFilters, isGrouped]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setSelectedGroupIds([]);
    });
  }, [viewGroup]);


  const handleAddSuccess = () => {
    toast.success('Thêm thiết bị thành công');
    queryClient.invalidateQueries({ queryKey: ['devices'] });
    setIsFormOpen(false);
    formik.resetForm();
  };

  const handleUpdateSuccess = () => {
    toast.success('Cập nhật thiết bị thành công');
    queryClient.invalidateQueries({ queryKey: ['devices'] });
    setEditingId(null);
    setIsFormOpen(false);
    formik.resetForm();
  };

  const handleDeleteSuccess = () => {
    toast.success('Xóa thiết bị thành công');
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  };

  const handleError = (error, defaultMsg) => {
    const errorCode = error.response?.data?.errorCode;
    toast.error(getErrorMessage(errorCode) || error?.response?.data?.message || defaultMsg);
  };

  const formik = useFormik({
    initialValues: {
      asset_code: '',
      name: '',
      category_id: 1, // Defaulting to 1 for simplicity
      brand: '',
      purchase_price: '',
      serial_number: '',
      supplier_id: '',
      quantity: 1
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập tên thiết bị'),
      category_id: Yup.number().required('Vui lòng nhập ID danh mục'),
      purchase_price: Yup.number().nullable().typeError('Giá nhập phải là số'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingId) {
          await updateDeviceMutation.mutateAsync({ id: editingId, ...values });
          handleUpdateSuccess();
        } else {
          await addDeviceMutation.mutateAsync(values);
          handleAddSuccess();
        }
      } catch (error) {
        handleError(error, editingId ? 'Có lỗi xảy ra khi cập nhật thiết bị' : 'Có lỗi xảy ra khi thêm thiết bị');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEdit = (item) => {
    setEditingId(item.id);
    formik.setValues({
      asset_code: item.asset_code,
      name: item.name,
      category_id: item.category_id,
      brand: item.brand || '',
      purchase_price: item.purchase_price || '',
      serial_number: item.serial_number || '',
      supplier_id: item.supplier_id || '',
      child_devices: item.child_devices || []
    });
    setIsFormOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsFormOpen(false);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Thiết Bị',
      message: 'Bạn có chắc chắn muốn xóa thiết bị này khỏi hệ thống? Các bản ghi bảo trì và cấp phát liên quan cũng có thể bị ảnh hưởng.',
      onConfirm: async () => {
        try {
          await deleteDeviceMutation.mutateAsync(id);
          handleDeleteSuccess();
        } catch (error) {
          handleError(error, 'Có lỗi xảy ra khi xóa thiết bị');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Nhiều Thiết Bị',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} thiết bị đã chọn?`,
      onConfirm: async () => {
        try {
          await deleteMultipleMutation.mutateAsync(selectedIds);
          handleDeleteSuccess();
          setSelectedIds([]);
        } catch (error) {
          handleError(error, 'Có lỗi xảy ra khi xóa các thiết bị');
        }
      }
    });
  };

  const handleGroupBulkDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Nhiều Thiết Bị (Trong Nhóm)',
      message: `Bạn có chắc chắn muốn xóa ${selectedGroupIds.length} thiết bị đã chọn?`,
      onConfirm: async () => {
        try {
          await deleteMultipleMutation.mutateAsync(selectedGroupIds);
          handleDeleteSuccess();
          setSelectedGroupIds([]);
        } catch (error) {
          handleError(error, 'Có lỗi xảy ra khi xóa các thiết bị');
        }
      }
    });
  };

  const isDeletable = (item) => {
    if (item.is_grouped) return false;
    if (item.status === DEVICE_STATUS.IN_USE) return false;
    if (item.child_devices && item.child_devices.length > 0) return false;
    if (item._count && item._count.assignments > 0) return false;
    return true;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      [DEVICE_STATUS.IN_STOCK]: { label: 'Tồn kho', color: 'bg-green-100 text-green-700' },
      [DEVICE_STATUS.IN_USE]: { label: 'Đang sử dụng', color: 'bg-blue-100 text-blue-700' },
      [DEVICE_STATUS.BROKEN]: { label: 'Hỏng', color: 'bg-red-100 text-red-700' },
      [DEVICE_STATUS.RETIRED]: { label: 'Đã thanh lý', color: 'bg-gray-100 text-gray-700' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${s.color}`}>{s.label}</span>;
  };

  const stats = {
    total: meta?.stats?.total || 0,
    inStock: meta?.stats?.in_stock || 0,
    inUse: meta?.stats?.in_use || 0,
    broken: meta?.stats?.broken || 0,
  };

  const selectedCategoryName = filters.category_id
    ? categories.find(c => c.id === Number(filters.category_id))?.name || ''
    : '';
  const suffix = selectedCategoryName ? ` ${selectedCategoryName}` : '';

  const handleConfirmClone = async () => {
    if (!cloneDevice) return;
    try {
      const payload = {
        ...cloneDevice,
        quantity: parseInt(cloneQuantity, 10),
        child_devices: cloneDevice.child_devices || []
      };

      delete payload.id;
      delete payload.asset_code;
      delete payload.serial_number;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.category;
      delete payload.parent_device;
      delete payload.type;
      delete payload.supplier;

      await addDeviceMutation.mutateAsync(payload);
      toast.success('Nhân bản thiết bị thành công');
      setCloneDevice(null);
      setCloneQuantity(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi nhân bản');
    }
  };

  const handleOpenAssemble = (device) => {
    setAssembleDevice(device);
    setIsAssembleModalOpen(true);
  };



  return (
    <div className="w-full relative">
      {(addDeviceMutation.isPending || deleteDeviceMutation.isPending || deleteMultipleMutation.isPending || updateDeviceMutation.isPending) && <Loading fullScreen message="Đang xử lý..." />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Laptop className="w-6 h-6 text-hepco-green" /> Quản Lý Thiết Bị
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-3 sm:gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm thiết bị, S/N..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showAdvancedFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" /> <span>Bộ Lọc Nâng Cao</span>
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            >
              <Trash2 className="w-5 h-5" /> <span>Xóa đã chọn ({selectedIds.length})</span>
            </button>
          )}
          <button
            onClick={() => { setIsFormOpen(true); setEditingId(null); formik.resetForm(); }}
            className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Danh mục</label>
            <select
              value={filters.category_id}
              onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Thương hiệu</label>
            <input
              type="text" placeholder="Nhập thương hiệu"
              value={filters.brand} onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={DEVICE_STATUS.IN_STOCK}>Tồn kho</option>
              <option value={DEVICE_STATUS.IN_USE}>Đang sử dụng</option>
              <option value={DEVICE_STATUS.BROKEN}>Hỏng</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nhà cung cấp</label>
            <select
              value={filters.supplier_id}
              onChange={(e) => setFilters(prev => ({ ...prev, supplier_id: e.target.value }))}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả NCC</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Số Serial</label>
            <input
              type="text" placeholder="Nhập Serial"
              value={filters.serial_number} onChange={(e) => setFilters(prev => ({ ...prev, serial_number: e.target.value }))}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 col-span-1 sm:col-span-2">
            <div className="w-1/2">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Giá từ (VNĐ)</label>
              <input
                type="number" placeholder="Từ"
                value={filters.min_price} onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Đến giá (VNĐ)</label>
              <input
                type="number" placeholder="Đến"
                value={filters.max_price} onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={() => setFilters({ search: filters.search, category_id: '', brand: '', serial_number: '', status: '', supplier_id: '', min_price: '', max_price: '' })}
              className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Box className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Thiết Bị<br />{suffix}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tồn Kho (Rảnh)<br />{suffix}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.inStock}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Laptop className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Đang Sử Dụng<br />{suffix}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.inUse}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Wrench className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Đang Hỏng / Bảo Trì<br />{suffix}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.broken}</p>
          </div>
        </div>
      </div>

      {/* Hide Assembled Toggle */}
      <div className="flex justify-end mb-4 gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={isGrouped}
            onChange={(e) => { setIsGrouped(e.target.checked); setPage(1); }}
            className="w-4 h-4 text-hepco-green focus:ring-hepco-green rounded"
          />
          Gom nhóm thiết bị giống nhau
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={hideAssembled}
            onChange={(e) => setHideAssembled(e.target.checked)}
            className="w-4 h-4 text-hepco-green focus:ring-hepco-green rounded"
          />
          Ẩn linh kiện đã lắp ráp
        </label>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <form onSubmit={formik.handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-hepco-green" />}
                  {editingId ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
                </h2>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                  title="Đóng"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã Tài Sản</label>
                    <input
                      type="text"
                      name="asset_code"
                      disabled
                      className="w-full p-2.5 border rounded-lg bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                      value={devices.find(d => d.id === editingId)?.asset_code || ''}
                    />
                  </div>
                )}

                <div className={!editingId ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Thiết Bị <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ví dụ: PC Dell Optiplex 3090"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                  />
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                      value={formik.values.quantity}
                      onChange={formik.handleChange}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh Mục<span className="text-red-500">*</span></label>
                  <select
                    name="category_id"
                    disabled={devices.find(d => d.id === editingId)?.child_devices?.length > 0}
                    className={`w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 ${devices.find(d => d.id === editingId)?.child_devices?.length > 0 ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}`}
                    value={formik.values.category_id}
                    onChange={formik.handleChange}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {devices.find(d => d.id === editingId)?.child_devices?.length > 0 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Không thể đổi vì thiết bị đang chứa linh kiện.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thương Hiệu</label>
                  <input
                    type="text"
                    name="brand"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá Nhập (VNĐ)</label>
                  <input
                    type="number"
                    name="purchase_price"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.purchase_price}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.purchase_price && formik.errors.purchase_price && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.purchase_price}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số Serial</label>
                  <input
                    type="text"
                    name="serial_number"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.serial_number}
                    onChange={formik.handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà Cung Cấp (Supplier)</label>
                  <select
                    name="supplier_id"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white"
                    value={formik.values.supplier_id}
                    onChange={formik.handleChange}
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>



              </div>

              <div className="mt-8 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className={`py-2.5 px-6 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 text-white ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-hepco-green hover:bg-green-700'
                    }`}
                >
                  {editingId ? 'Cập Nhật Thiết Bị' : 'Thêm Thiết Bị'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : devices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-hepco-green focus:ring-hepco-green rounded border-gray-300"
                      checked={devices.length > 0 && devices.filter(isDeletable).length > 0 && devices.filter(isDeletable).every(d => selectedIds.includes(d.id))}
                      onChange={(e) => {
                        const deletableIds = devices.filter(isDeletable).map(d => d.id);
                        if (e.target.checked) {
                          setSelectedIds(prev => [...new Set([...prev, ...deletableIds])]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => !deletableIds.includes(id)));
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Mã TS</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Thiết Bị</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Thương Hiệu</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Trạng Thái</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {devices.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/50 transition-colors ${item.is_grouped ? 'cursor-pointer' : ''}`}
                    onClick={() => item.is_grouped ? setViewGroup(item) : undefined}
                  >
                    <td className="px-6 py-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        disabled={!isDeletable(item)}
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, item.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        className={`w-4 h-4 rounded border-gray-300 ${isDeletable(item) ? 'text-hepco-green focus:ring-hepco-green cursor-pointer' : 'text-gray-300 bg-gray-100 cursor-not-allowed'}`}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-800 font-bold">
                      {item.is_grouped ? (
                        <div className="flex flex-col">
                          <span className="text-gray-500 italic font-normal">Nhiều mã TS</span>
                          <span className="text-hepco-green bg-green-50 px-2 py-0.5 rounded text-xs mt-1 w-fit border border-green-100">
                            Số lượng: {item.quantity}
                          </span>
                        </div>
                      ) : (
                        item.asset_code
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <p className="font-semibold truncate max-w-[200px] sm:max-w-[300px]" title={item.name}>{item.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.category && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-medium">{item.category.name}</span>}
                        {item.parent_device_id && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-medium" title={`ID: ${item.parent_device_id}`}>
                            Gắn trong: {item.parent_device?.name || `ID ${item.parent_device_id}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <p className="font-medium text-gray-700 truncate max-w-[150px]" title={item.brand || ''}>{item.brand || '-'}</p>
                      {item.supplier && <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={item.supplier.name}>{item.supplier.name}</p>}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => { if (!item.is_grouped) e.stopPropagation(); }}>
                      {item.status ? getStatusLabel(item.status) : ''}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {!item.is_grouped ? (
                        <div className="flex items-center justify-end gap-2">
                          {!item.parent_device_id && item.category?.parent_id === null && categories.some(c => c.parent_id === item.category?.id) && (
                            <button
                              onClick={() => handleOpenAssemble(item)}
                              className="p-2 text-hepco-green hover:bg-green-50 rounded-lg transition-colors"
                              title="Lắp ráp linh kiện"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { setCloneDevice(item); setCloneQuantity(1); }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Nhân bản Thiết Bị"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa Thiết Bị"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={!isDeletable(item)}
                            className={`p-2 rounded-lg transition-colors ${isDeletable(item) ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-200 cursor-not-allowed'}`}
                            title={isDeletable(item) ? "Xóa Thiết Bị" : "Không thể xóa"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chế độ xem nhóm</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <ShieldAlert className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Không có thiết bị nào</h3>
            <p className="text-gray-500 mt-1">Hệ thống chưa có thiết bị phần cứng nào. Vui lòng thêm mới!</p>
          </div>
        )}
      </div>

      {/* Grouped Devices Modal */}
      {viewGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Chi tiết nhóm thiết bị</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {viewGroup.name} - {viewGroup.category?.name} - {viewGroup.quantity} thiết bị
                </p>
              </div>
              <div className="flex items-center gap-4">
                {selectedGroupIds.length > 0 && (
                  <button
                    onClick={handleGroupBulkDelete}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa đã chọn ({selectedGroupIds.length})
                  </button>
                )}
                <button onClick={() => setViewGroup(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 flex-1 bg-white">
              {isLoadingGroupedDevices ? (
                <div className="py-12"><Loading /></div>
              ) : groupedDevicesList.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 w-10 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-hepco-green focus:ring-hepco-green rounded border-gray-300"
                            checked={groupedDevicesList.length > 0 && groupedDevicesList.filter(isDeletable).length > 0 && groupedDevicesList.filter(isDeletable).every(d => selectedGroupIds.includes(d.id))}
                            onChange={(e) => {
                              const deletableIds = groupedDevicesList.filter(isDeletable).map(d => d.id);
                              if (e.target.checked) {
                                setSelectedGroupIds(prev => [...new Set([...prev, ...deletableIds])]);
                              } else {
                                setSelectedGroupIds(prev => prev.filter(id => !deletableIds.includes(id)));
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-gray-700">Mã TS</th>
                        <th className="px-4 py-3 text-sm font-bold text-gray-700">Tên Thiết Bị</th>
                        <th className="px-4 py-3 text-sm font-bold text-gray-700">Trạng Thái</th>
                        <th className="px-4 py-3 text-sm font-bold text-gray-700 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {groupedDevicesList.map(dev => (
                        <tr key={dev.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 w-10 text-center">
                            <input
                              type="checkbox"
                              disabled={!isDeletable(dev)}
                              checked={selectedGroupIds.includes(dev.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGroupIds(prev => [...prev, dev.id]);
                                } else {
                                  setSelectedGroupIds(prev => prev.filter(id => id !== dev.id));
                                }
                              }}
                              className={`w-4 h-4 rounded border-gray-300 ${isDeletable(dev) ? 'text-hepco-green focus:ring-hepco-green cursor-pointer' : 'text-gray-300 bg-gray-100 cursor-not-allowed'}`}
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-gray-800">{dev.asset_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 font-semibold truncate max-w-[200px]" title={dev.name}>{dev.name}</td>
                          <td className="px-4 py-3">{getStatusLabel(dev.status)}</td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {!dev.parent_device_id && dev.category?.parent_id === null && categories.some(c => c.parent_id === dev.category?.id) && (
                                <button
                                  onClick={() => handleOpenAssemble(dev)}
                                  className="p-2 text-hepco-green hover:bg-green-50 rounded-lg transition-colors"
                                  title="Lắp ráp linh kiện"
                                >
                                  <Package className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => { setCloneDevice(dev); setCloneQuantity(1); }}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Nhân bản Thiết Bị"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setViewGroup(null); handleEdit(dev); }}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Sửa Thiết Bị"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                disabled={!isDeletable(dev)}
                                onClick={() => { handleDelete(dev.id); }}
                                className={`p-2 rounded-lg transition-colors ${isDeletable(dev) ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-200 cursor-not-allowed'}`}
                                title={!isDeletable(dev) ? "Không thể xóa" : "Xóa Thiết Bị"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 italic py-8">Không tìm thấy thiết bị nào.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {cloneDevice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Copy className="w-5 h-5 text-blue-500" /> Nhân bản thiết bị</h3>
              <button onClick={() => setCloneDevice(null)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Bạn đang nhân bản thiết bị <span className="font-semibold text-gray-800">{cloneDevice.name}</span>. Vui lòng chọn số lượng bản sao muốn tạo:</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                value={cloneQuantity}
                onChange={(e) => setCloneQuantity(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setCloneDevice(null)} className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-50">Hủy</button>
              <button onClick={handleConfirmClone} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Nhân bản</button>
            </div>
          </div>
        </div>
      )}

      <AssembleDeviceModal
        isOpen={isAssembleModalOpen}
        onClose={() => { setIsAssembleModalOpen(false); setAssembleDevice(null); }}
        assembleDevice={assembleDevice}
        setAssembleDevice={setAssembleDevice}
        categories={categories}
      />
    </div>
  );
};

export default AdminDeviceManager;
