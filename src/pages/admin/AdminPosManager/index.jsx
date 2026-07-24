import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, Plus, Trash2, Edit2, X, Search, RefreshCw,
  UserCheck, History, ArrowRightLeft,
  Phone, Download, Loader2, MoreVertical, RotateCcw
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import axiosInstance from '../../../utils/axios';
import Select from 'react-select';



import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import {
  useGetPosDevices, useAddPosDevice, useUpdatePosDevice,
  useDeletePosDevice, useAssignPosDevice, useUnassignPosDevice,
  useBorrowPosDevice, useReturnBorrowPosDevice, useGetPosHistory
} from '../../../apis/pos';
import { useGetEmployees } from '../../../apis/employee';
import { useGetDepartments } from '../../../apis/department';

const STATUS_LABELS = {
  in_stock: { label: 'Kho / Dự phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_use: { label: 'Đang cấp phát', bg: 'bg-green-100 text-green-800 border-green-200' },
  borrowed: { label: 'Đang mượn', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  broken: { label: 'Đang hỏng', bg: 'bg-red-100 text-red-800 border-red-200' },
  retired: { label: 'Thanh lý', bg: 'bg-gray-100 text-gray-800 border-gray-200' }
};

const ENTERPRISE_LABELS = {
  BSH: { label: 'Bắc Sông Hương (BSH)', badge: 'bg-emerald-600 text-white' },
  NSH: { label: 'Nam Sông Hương (NSH)', badge: 'bg-indigo-600 text-white' }
};

const AdminPosManager = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'borrowed'
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');


  const [isExporting, setIsExporting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningDevice, setAssigningDevice] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [borrowingDevice, setBorrowingDevice] = useState(null);
  const [historyPosId, setHistoryPosId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Form inputs
  const [formValues, setFormValues] = useState({
    serial_number: '',
    imei: '',
    sim_number: '',
    sim_imei: '',
    telecom_plan: 'Gói ezCom90',
    enterprise: 'BSH',
    region: '',
    status: 'in_stock',
    notes: ''
  });

  const [assignValues, setAssignValues] = useState({
    employee_id: '',
    employee_name: '',
    region: '',
    assigned_by: 'Admin',
    note: ''
  });

  const [borrowValues, setBorrowValues] = useState({
    borrower_name: '',
    employee_id: '',
    expected_return_date: '',
    purpose: 'Mượn kho dự phòng / Tăng cường đợt thu',
    note: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Queries & Mutations
  const { data: posRes, isLoading } = useGetPosDevices({
    search: debouncedSearch,
    status: activeTab === 'assigned' ? 'in_use' : activeTab === 'borrowed' ? 'in_stock,borrowed' : (status || undefined),
    department_id: departmentId || undefined,
    page,
    limit: 20
  });


  const { data: deptsRes } = useGetDepartments({ type: 'xi_nghiep', limit: 1000 });
  const departments = deptsRes?.data || [];

  const { data: employeesRes } = useGetEmployees({ dept_type: 'xi_nghiep', limit: 1000 });
  const employees = employeesRes?.data || employeesRes || [];



  const addPosMutation = useAddPosDevice();
  const updatePosMutation = useUpdatePosDevice();
  const deletePosMutation = useDeletePosDevice();
  const assignPosMutation = useAssignPosDevice();
  const unassignPosMutation = useUnassignPosDevice();
  const borrowPosMutation = useBorrowPosDevice();
  const returnBorrowPosMutation = useReturnBorrowPosDevice();

  const { data: historyData, isLoading: isLoadingHistory } = useGetPosHistory(historyPosId);

  const posDevices = posRes?.data || [];
  const meta = posRes?.meta;
  const stats = meta?.stats || { total: 0, BSH: 0, NSH: 0, in_stock: 0, in_use: 0, borrowed: 0, broken: 0 };

  // Handlers
  const handleOpenCreateForm = () => {
    setEditingDevice(null);
    setFormValues({
      serial_number: '',
      imei: '',
      sim_number: '',
      sim_imei: '',
      telecom_plan: 'Gói ezCom90',
      enterprise: 'BSH',
      region: '',
      status: 'in_stock',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (device) => {
    setEditingDevice(device);
    setFormValues({
      serial_number: device.serial_number || '',
      imei: device.imei || '',
      sim_number: device.sim_number || '',
      sim_imei: device.sim_imei || '',
      telecom_plan: device.telecom_plan || 'Gói ezCom90',
      enterprise: device.enterprise || 'BSH',
      region: device.region || '',
      status: device.status || 'in_stock',
      notes: device.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.serial_number.trim()) {
      toast.error('Vui lòng nhập Serial POS');
      return;
    }

    try {
      if (editingDevice) {
        await updatePosMutation.mutateAsync({ id: editingDevice.id, ...formValues });
        toast.success('Cập nhật máy POS thành công!');
      } else {
        await addPosMutation.mutateAsync(formValues);
        toast.success('Thêm mới máy POS thành công!');
      }
      setIsFormOpen(false);
      queryClient.invalidateQueries(['posDevices']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu máy POS');
    }
  };

  const handleDelete = (device) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa máy POS',
      message: `Bạn có chắc chắn muốn xóa máy POS Serial: ${device.serial_number}?`,
      onConfirm: async () => {
        try {
          await deletePosMutation.mutateAsync(device.id);
          toast.success('Đã xóa máy POS');
          queryClient.invalidateQueries(['posDevices']);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Không thể xóa máy POS này');
        }
      }
    });
  };

  // Assign Handler
  const handleOpenAssignModal = (device) => {
    setAssigningDevice(device);
    const activeAss = device.assignments && device.assignments[0];
    setAssignValues({
      employee_id: activeAss?.employee_id || '',
      employee_name: activeAss?.employee_name || '',
      region: device.region || '',
      assigned_by: 'Admin',
      note: ''
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignValues.employee_id) {
      toast.error('Vui lòng chọn nhân viên thu tiền từ danh sách');
      return;
    }


    try {
      await assignPosMutation.mutateAsync({
        id: assigningDevice.id,
        ...assignValues
      });
      toast.success(`Cấp phát máy POS cho ${assignValues.employee_name} thành công!`);
      setIsAssignModalOpen(false);
      queryClient.invalidateQueries(['posDevices']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cấp phát');
    }
  };

  const handleUnassign = (device) => {
    const empName = device.assignments?.[0]?.employee_name || 'Nhân viên';
    setConfirmConfig({
      isOpen: true,
      title: 'Thu hồi máy POS',
      message: `Xác nhận thu hồi máy POS (Serial: ${device.serial_number}) từ ${empName} về Kho?`,
      onConfirm: async () => {
        try {
          await unassignPosMutation.mutateAsync({ id: device.id });
          toast.success('Đã thu hồi máy POS về kho');
          queryClient.invalidateQueries(['posDevices']);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Không thể thu hồi POS');
        }
      }
    });
  };

  // Borrow Handler
  const handleOpenBorrowModal = (device) => {
    setBorrowingDevice(device);
    setBorrowValues({
      borrower_name: '',
      employee_id: '',
      expected_return_date: '',
      purpose: 'Mượn kho dự phòng / Tăng cường đợt thu',
      note: ''
    });
    setIsBorrowModalOpen(true);
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    if (!borrowValues.borrower_name.trim()) {
      toast.error('Vui lòng nhập tên người hoặc khu vực mượn');
      return;
    }

    try {
      await borrowPosMutation.mutateAsync({
        id: borrowingDevice.id,
        ...borrowValues
      });
      toast.success(`Đã lập phiếu cho mượn POS thành công!`);
      setIsBorrowModalOpen(false);
      queryClient.invalidateQueries(['posDevices']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lập phiếu cho mượn');
    }
  };

  const handleReturnBorrow = (device) => {
    const borrower = device.borrowings?.[0]?.borrower_name || 'Người mượn';
    setConfirmConfig({
      isOpen: true,
      title: 'Nhận trả máy POS mượn',
      message: `Xác nhận nhận lại máy POS (Serial: ${device.serial_number}) do ${borrower} trả về Kho dự phòng?`,
      onConfirm: async () => {
        try {
          await returnBorrowPosMutation.mutateAsync({ id: device.id });
          toast.success('Đã nhận trả máy POS về Kho dự phòng!');
          queryClient.invalidateQueries(['posDevices']);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Không thể nhận trả máy POS');
        }
      }
    });
  };

  // Export Excel - Mỗi Phòng Ban Cha 1 Sheet, các khu vực con nằm trong Sheet của phòng ban cha
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const res = await axiosInstance.get('/api/pos', { params: { limit: 5000 } });
      const allDevices = res.data?.data || [];

      if (allDevices.length === 0) {
        toast.error('Không có dữ liệu máy POS để xuất Excel!');
        return;
      }

      // Hàm tìm tên phòng ban cha động từ CSDL theo mã xí nghiệp / mã phòng ban
      const findParentDeptName = (entCode) => {
        if (!entCode) return 'Kho Dự Phòng Chung';
        const match = departments.find(d => (!d.parent_id || !d.parent) && (d.code === entCode || (d.code && d.code.includes(entCode))));
        return match?.name || entCode;
      };

      // Nhóm thiết bị theo Phòng Ban Cha (Sheet Name) và Khu Vực Con (Section Name)
      const parentGroups = {};

      allDevices.forEach((dev) => {


        const activeAss = dev.assignments?.[0];
        const activeBor = dev.borrowings?.[0];
        const dept = activeAss?.employee?.department;

        let sheetName;
        let sectionName;

        if (dept) {

          if (dept.parent) {
            sheetName = dept.parent.name;
            sectionName = dept.name;
          } else {
            sheetName = dept.name;
            sectionName = `${dept.name} (Khối Chính)`;
          }
        } else {
          // Lấy động tên phòng ban cha từ danh sách departments trong CSDL
          const dynamicParentName = findParentDeptName(dev.enterprise);
          sheetName = dynamicParentName;

          if (dev.status === 'borrowed') {
            sectionName = `Kho Mượn Tạm (${activeBor?.borrower_name || 'Khác'})`;
          } else {
            sectionName = dev.region ? `Khu Vực ${dev.region}` : `Kho Dự Phòng (${dev.enterprise || 'Chung'})`;
          }
        }

        if (!parentGroups[sheetName]) parentGroups[sheetName] = {};
        if (!parentGroups[sheetName][sectionName]) parentGroups[sheetName][sectionName] = [];
        parentGroups[sheetName][sectionName].push(dev);
      });


      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Hệ thống Quản trị HEPCO';
      workbook.created = new Date();

      Object.keys(parentGroups).sort().forEach((parentName) => {
        const safeSheetName = parentName.replace(/[:\\/?*[\]]/g, ' ').substring(0, 31);
        const sheet = workbook.addWorksheet(safeSheetName);

        // Dòng Tiêu Đề Chính của Sheet
        sheet.addRow([`DANH SÁCH MÁY POS CHO NHÂN VIÊN ${parentName.toUpperCase()}`]);
        sheet.mergeCells('A1:J1');
        const titleCell = sheet.getCell('A1');
        titleCell.font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } }; // Hepco Green
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 35;

        sheet.addRow([]); // Dòng trống

        const sections = parentGroups[parentName];

        Object.keys(sections).sort().forEach((secName) => {
          const devList = sections[secName];
          if (devList.length === 0) return;

          // Dòng tiêu đề Khu Vực Con (Sub-section Header)
          const secRow = sheet.addRow([secName.toUpperCase()]);
          const currentSecRowIdx = secRow.number;
          sheet.mergeCells(`A${currentSecRowIdx}:J${currentSecRowIdx}`);
          const secCell = sheet.getCell(`A${currentSecRowIdx}`);
          secCell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FF0F172A' } };
          secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; // Slate Gray Accent
          secCell.alignment = { vertical: 'middle', horizontal: 'left' };
          secRow.height = 24;

          // Dòng Tiêu Đề Cột cho Khu Vực
          const headerRow = sheet.addRow([
            'STT',
            'Họ và Tên Nhân Viên / Người Mượn',
            'Địa Bàn Phụ Trách',
            'Serial POS',
            'IMEI POS',
            'Số Điện Thoại SIM',
            'IMEI SIM',
            'Gói Cước',
            'Trạng Thái',
            'Ghi Chú'
          ]);
          headerRow.height = 24;
          for (let c = 1; c <= 10; c++) {
            const cell = headerRow.getCell(c);
            cell.font = { name: 'Times New Roman', bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          }

          // Dòng dữ liệu Nhân viên / POS trong Khu vực
          devList.forEach((dev, idx) => {
            const activeAss = dev.assignments?.[0];
            const activeBor = dev.borrowings?.[0];
            const userStr = dev.status === 'in_use'
              ? (activeAss?.employee_name || 'Đã cấp phát')
              : (dev.status === 'borrowed' ? (activeBor?.borrower_name || 'Đang mượn') : 'Kho / Sẵn sàng');

            const statusLabel = STATUS_LABELS[dev.status]?.label || dev.status;

            const dataRow = sheet.addRow([
              idx + 1,
              userStr,
              dev.region || '-',
              dev.serial_number || '-',
              dev.imei || '-',
              dev.sim_number || '-',
              dev.sim_imei || '-',
              dev.telecom_plan || 'Gói ezCom90',
              statusLabel,
              dev.notes || '-'
            ]);

            dataRow.height = 22;
            const isEven = idx % 2 === 0;
            const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

            for (let c = 1; c <= 10; c++) {
              const cell = dataRow.getCell(c);
              cell.font = { name: 'Times New Roman', size: 10, color: { argb: 'FF1F2937' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
              };

              if (c === 1 || c === 4 || c === 5 || c === 6 || c === 7 || c === 9) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
              } else {
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
              }
            }
          });

          sheet.addRow([]); // Dòng trống giữa các khu vực
        });

        // Độ rộng các cột
        const colWidths = [6, 26, 28, 18, 20, 16, 22, 16, 16, 22];
        colWidths.forEach((w, colIdx) => {
          sheet.getColumn(colIdx + 1).width = w;
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Danh_Sach_May_POS_HEPCO_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Xuất file Excel thành công theo Phòng Ban Cha & Khu Vực Con!');
    } catch (err) {
      console.error('Lỗi khi xuất Excel:', err);
      toast.error('Có lỗi xảy ra khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-hepco-green" />
            Quản Lý Thiết Bị POS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý cấp phát, cho mượn kho dự phòng và theo dõi thiết bị POS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1D6F42] text-white hover:bg-[#155231] rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Đang Xuất Excel...' : 'Xuất Excel'}
          </button>

          <button
            onClick={handleOpenCreateForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-hepco-green text-white hover:bg-green-700 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Máy POS
          </button>
        </div>
      </div>

      {/* Main Filter & Tabs Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-4 gap-6 bg-gray-50/50">
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'all' ? 'border-hepco-green text-hepco-green' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <CreditCard className="w-4 h-4" />
            Tất Cả Máy POS ({stats.total})
          </button>
          <button
            onClick={() => { setActiveTab('assigned'); setPage(1); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'assigned' ? 'border-hepco-green text-hepco-green' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <UserCheck className="w-4 h-4" />
            Đang Cấp Phát ({stats.in_use})
          </button>
          <button
            onClick={() => { setActiveTab('borrowed'); setPage(1); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'borrowed' ? 'border-hepco-green text-hepco-green' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Kho Dự Phòng & Mượn ({stats.in_stock + stats.borrowed})
          </button>

        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo Serial, IMEI, SIM, Nhân viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
            />

          </div>

          <div className="flex items-center gap-3">
            {/* Sub-Department Filter */}
            <select
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-hepco-green bg-white text-gray-700 max-w-[260px]"
            >
              <option value="">Tất cả Phòng Ban / Xí Nghiệp / Khu Vực</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.parent ? `↳ ${d.name}` : `🏢 ${d.name}`}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            {activeTab === 'all' && (
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-hepco-green bg-white text-gray-700"
              >
                <option value="">Tất cả Trạng thái</option>
                <option value="in_stock">Kho / Dự phòng</option>
                <option value="in_use">Đang cấp phát</option>
                <option value="borrowed">Đang mượn</option>
                <option value="broken">Đang hỏng</option>
                <option value="retired">Thanh lý</option>
              </select>
            )}

            {(search || status || departmentId) && (
              <button
                onClick={() => { setSearch(''); setStatus(''); setDepartmentId(''); setPage(1); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Xóa bộ lọc"
              >


                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* POS Devices Table */}
        {isLoading ? (
          <div className="py-12"><Loading /></div>
        ) : posDevices.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Không tìm thấy máy POS nào phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Xí Nghiệp & Khu Vực</th>
                  <th className="py-3.5 px-4">Serial / IMEI POS</th>
                  <th className="py-3.5 px-4">Thông Tin SIM</th>
                  <th className="py-3.5 px-4">Địa Bàn Phụ Trách</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Người Sử Dụng / Mượn</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posDevices.map((device) => {
                  const activeAss = device.assignments?.[0];
                  const activeBor = device.borrowings?.[0];
                  const stLabel = STATUS_LABELS[device.status] || { label: device.status, bg: 'bg-gray-100' };
                  const entLabel = ENTERPRISE_LABELS[device.enterprise] || { label: device.enterprise, badge: 'bg-gray-600 text-white' };

                  return (
                    <tr key={device.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Enterprise & Sub-Enterprise */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${entLabel.badge}`}>
                            {device.enterprise}
                          </span>
                          {activeAss?.employee?.department ? (
                            activeAss.employee.department.parent ? (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded border border-purple-200 text-xs flex items-center gap-1">
                                ↳ {activeAss.employee.department.name}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-semibold rounded border border-blue-100 text-xs">
                                {activeAss.employee.department.name}
                              </span>
                            )
                          ) : device.region && (device.region.includes('Quảng Điền') || device.region.includes('Hương Trà') || device.region.includes('Hương Thủy') || device.region.includes('Phong Điền') || device.region.includes('Lăng Cô')) ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-medium rounded border border-amber-200 text-xs">
                              ↳ {device.region.includes('Quảng Điền') ? 'Khu vực Quảng Điền' :
                                device.region.includes('Hương Trà') ? 'Khu vực Hương Trà' :
                                  device.region.includes('Hương Thủy') ? 'Khu vực Hương Thủy' :
                                    device.region.includes('Phong Điền') ? 'Khu vực Phong Điền' :
                                      device.region.includes('Lăng Cô') ? 'Khu vực Lăng Cô' : device.region}
                            </span>
                          ) : null}
                        </div>
                      </td>


                      {/* Serial / IMEI */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          {device.serial_number}
                        </div>
                        {device.imei && (
                          <div className="text-xs text-gray-500 mt-0.5">IMEI: {device.imei}</div>
                        )}
                      </td>

                      {/* SIM info */}
                      <td className="py-3.5 px-4">
                        {device.sim_number ? (
                          <div>
                            <div className="font-medium text-gray-800 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-green-600" />
                              {device.sim_number}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {device.telecom_plan || 'Gói cước ezCom90'}
                              {device.sim_imei ? ` (${device.sim_imei})` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Chưa gắn SIM</span>
                        )}
                      </td>

                      {/* Region */}
                      <td className="py-3.5 px-4">
                        <div className="text-gray-800 text-xs max-w-xs line-clamp-2">
                          {device.region || 'Chưa phân vùng'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${stLabel.bg}`}>
                          {stLabel.label}
                        </span>
                      </td>

                      {/* User / Borrower */}
                      <td className="py-3.5 px-4">
                        {device.status === 'in_use' && activeAss ? (
                          <div>
                            <div className="font-semibold text-green-800 text-xs flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-green-600" />
                              {activeAss.employee_name}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              Cấp ngày: {new Date(activeAss.assigned_date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        ) : device.status === 'borrowed' && activeBor ? (

                          <div>
                            <div className="font-semibold text-amber-800 text-xs flex items-center gap-1">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                              {activeBor.borrower_name}
                            </div>
                            <div className="text-[11px] text-amber-600 font-medium">
                              {activeBor.purpose || 'Mượn tạm'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-- Sẵn sàng --</span>
                        )}
                      </td>

                      {/* Actions Popup Menu */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === device.id ? null : device.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                          title="Thao tác"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openDropdownId === device.id && (
                          <div className="absolute right-4 top-10 bg-white border border-gray-100 shadow-xl rounded-xl w-48 z-20 flex flex-col overflow-hidden py-1 text-left">
                            {device.status === 'in_stock' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleOpenAssignModal(device); }}
                                className="w-full px-4 py-2.5 text-xs font-medium text-green-700 hover:bg-green-50 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4 text-green-600" />
                                Cấp phát POS
                              </button>
                            )}

                            {device.status === 'in_use' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleUnassign(device); }}
                                className="w-full px-4 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4 text-amber-600" />
                                Thu hồi về kho
                              </button>
                            )}

                            {device.status === 'in_stock' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleOpenBorrowModal(device); }}
                                className="w-full px-4 py-2.5 text-xs font-medium text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                                Cho mượn dự phòng
                              </button>
                            )}

                            {device.status === 'borrowed' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleReturnBorrow(device); }}
                                className="w-full px-4 py-2.5 text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4 text-purple-600" />
                                Nhận trả máy mượn
                              </button>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setHistoryPosId(device.id); }}
                              className="w-full px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <History className="w-4 h-4 text-gray-500" />
                              Xem lịch sử
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleOpenEditForm(device); }}
                              className="w-full px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                              Chỉnh sửa thông tin
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>

                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDelete(device); }}
                              className="w-full px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              Xóa máy POS
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}

      </div>

      {/* Modal Add/Edit POS */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="p-5 bg-hepco-green text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {editingDevice ? 'Chỉnh Sửa Thiết Bị POS' : 'Thêm Máy POS Mới'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Xí Nghiệp Quản Lý *</label>
                  <select
                    value={formValues.enterprise}
                    onChange={(e) => setFormValues({ ...formValues, enterprise: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                  >
                    <option value="BSH">Bắc Sông Hương (BSH)</option>
                    <option value="NSH">Nam Sông Hương (NSH)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Serial POS *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: V302243D21357"
                    value={formValues.serial_number}
                    onChange={(e) => setFormValues({ ...formValues, serial_number: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">IMEI Máy POS</label>
                  <input
                    type="text"
                    placeholder="VD: 865817064620504"
                    value={formValues.imei}
                    onChange={(e) => setFormValues({ ...formValues, imei: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Số Điên Thoại SIM</label>
                  <input
                    type="text"
                    placeholder="VD: 0845471011"
                    value={formValues.sim_number}
                    onChange={(e) => setFormValues({ ...formValues, sim_number: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gói Cước Viễn Thông</label>
                  <input
                    type="text"
                    placeholder="VD: Gói ezCom90, U1500"
                    value={formValues.telecom_plan}
                    onChange={(e) => setFormValues({ ...formValues, telecom_plan: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">IMEI SIM</label>
                  <input
                    type="text"
                    placeholder="VD: 89840200011707..."
                    value={formValues.sim_imei}
                    onChange={(e) => setFormValues({ ...formValues, sim_imei: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Địa Bàn Phụ Trách</label>
                <input
                  type="text"
                  placeholder="VD: Hương Long, Đông Ba - Thuận Thành"
                  value={formValues.region}
                  onChange={(e) => setFormValues({ ...formValues, region: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Trạng Thái Ban Đầu</label>
                  <select
                    value={formValues.status}
                    onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                  >
                    <option value="in_stock">Kho / Dự phòng</option>
                    <option value="in_use">Đang cấp phát</option>
                    <option value="borrowed">Đang mượn</option>
                    <option value="broken">Hỏng / Sửa chữa</option>
                    <option value="retired">Thanh lý</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi Chú</label>
                <textarea
                  rows="2"
                  placeholder="Ghi chú chi tiết về máy..."
                  value={formValues.notes}
                  onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-hepco-green text-white hover:bg-green-700 rounded-lg text-sm font-medium"
                >
                  {editingDevice ? 'Lưu Cập Nhật' : 'Tạo Máy POS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assign POS */}
      {isAssignModalOpen && assigningDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-green-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Cấp Phát Máy POS ({assigningDevice.serial_number})
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn Nhân Viên Thu Tiền (Khối Xí Nghiệp) *</label>
                <Select
                  options={(employees || []).map(emp => ({
                    value: emp.id,
                    label: `${emp.full_name} (${emp.employee_code || 'NV'}) - ${emp.department?.name || 'Xí nghiệp'}`,
                    empName: emp.full_name
                  }))}
                  value={(employees || [])
                    .map(emp => ({ value: emp.id, label: `${emp.full_name} (${emp.employee_code || 'NV'}) - ${emp.department?.name || 'Xí nghiệp'}`, empName: emp.full_name }))
                    .find(o => String(o.value) === String(assignValues.employee_id)) || null
                  }
                  onChange={(option) => {
                    setAssignValues({
                      ...assignValues,
                      employee_id: option ? option.value : '',
                      employee_name: option ? option.empName : ''
                    });
                  }}
                  placeholder="-- Gõ để tìm kiếm và chọn nhân viên thu tiền --"
                  isSearchable
                  isClearable
                  noOptionsMessage={() => "Không tìm thấy nhân viên Xí nghiệp nào"}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#D1D5DB',
                      borderRadius: '0.5rem',
                      padding: '2px',
                      outline: 'none',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#10B981' }
                    })
                  }}
                />
              </div>



              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Địa Bàn Giao Cấp Phát</label>
                <input
                  type="text"
                  placeholder="Địa bàn nhân viên thu tiền phụ trách..."
                  value={assignValues.region}
                  onChange={(e) => setAssignValues({ ...assignValues, region: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                />
              </div>


              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi Chú Cấp Phát</label>
                <textarea
                  rows="2"
                  placeholder="Ghi chú thêm khi bàn giao máy POS..."
                  value={assignValues.note}
                  onChange={(e) => setAssignValues({ ...assignValues, note: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-hepco-green"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white hover:bg-green-800 rounded-lg text-sm font-medium"
                >
                  Xác Nhận Cấp Phát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Borrow POS */}
      {isBorrowModalOpen && borrowingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-amber-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Cho Mượn POS Kho Dự Phòng ({borrowingDevice.serial_number})
              </h3>
              <button onClick={() => setIsBorrowModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBorrowSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Người / Khu Vực Mượn *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tứ Hạ mượn, Nguyễn Văn A..."
                  value={borrowValues.borrower_name}
                  onChange={(e) => setBorrowValues({ ...borrowValues, borrower_name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Hẹn Trả (nếu có)</label>
                <input
                  type="date"
                  value={borrowValues.expected_return_date}
                  onChange={(e) => setBorrowValues({ ...borrowValues, expected_return_date: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mục Đích / Lý Do Mượn</label>
                <input
                  type="text"
                  placeholder="VD: Máy chính hỏng / Tăng cường đợt thu tháng"
                  value={borrowValues.purpose}
                  onChange={(e) => setBorrowValues({ ...borrowValues, purpose: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi Chú</label>
                <textarea
                  rows="2"
                  placeholder="Ghi chú tình trạng máy khi cho mượn..."
                  value={borrowValues.note}
                  onChange={(e) => setBorrowValues({ ...borrowValues, note: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-medium"
                >
                  Lập Phiếu Cho Mượn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View History */}
      {historyPosId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-5 bg-gray-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Lịch Sử Cấp Phát & Cho Mượn Máy POS
              </h3>
              <button onClick={() => setHistoryPosId(null)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {isLoadingHistory ? (
                <Loading />
              ) : (
                <>
                  {/* Assignments */}
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      Lịch Sử Cấp Phát Nhân Viên
                    </h4>
                    {historyData?.assignments?.length > 0 ? (
                      <div className="space-y-2">
                        {historyData.assignments.map(ass => (
                          <div key={ass.id} className="p-3 bg-green-50/50 border border-green-100 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between font-semibold text-green-900">
                              <span>Nhân viên: {ass.employee_name || 'N/A'}</span>
                              <span className="text-gray-500">
                                {new Date(ass.assigned_date).toLocaleDateString('vi-VN')}
                                {ass.returned_date ? ` - ${new Date(ass.returned_date).toLocaleDateString('vi-VN')} (Đã thu hồi)` : ' (Đang dùng)'}
                              </span>
                            </div>
                            <div className="text-gray-600">Địa bàn: {ass.region || 'N/A'}</div>
                            {ass.note && <div className="text-gray-500 italic">Ghi chú: {ass.note}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">Chưa có lịch sử cấp phát</div>
                    )}
                  </div>

                  {/* Borrowings */}
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                      Lịch Sử Mượn Kho Dự Phòng
                    </h4>
                    {historyData?.borrowings?.length > 0 ? (
                      <div className="space-y-2">
                        {historyData.borrowings.map(bor => (
                          <div key={bor.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between font-semibold text-amber-900">
                              <span>Người/Khu vực mượn: {bor.borrower_name}</span>
                              <span className="text-gray-500">
                                {new Date(bor.borrow_date).toLocaleDateString('vi-VN')}
                                {bor.returned_date ? ` - ${new Date(bor.returned_date).toLocaleDateString('vi-VN')} (Đã trả kho)` : ' (Đang mượn)'}
                              </span>
                            </div>
                            <div className="text-gray-600">Mục đích: {bor.purpose || 'Mượn kho'}</div>
                            {bor.note && <div className="text-gray-500 italic">Ghi chú: {bor.note}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">Chưa có lịch sử cho mượn kho dự phòng</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

export default AdminPosManager;
