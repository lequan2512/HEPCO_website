import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, RotateCcw, X, Search, Package, Download, Loader2, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import { useGetAssignments, useAddAssignment, useReturnAssignment, useUpdateAssignment, useDeleteAssignment } from '../../../apis/assignment';
import { useGetCategories } from '../../../apis/device';
import { useGetDepartments } from '../../../apis/department';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import { DEVICE_CATEGORY_CODES, DEVICE_STATUS, ASSIGNMENT_STATUS } from '../../../constants/device';
import AssembleDeviceModal from '../../../components/AssembleDeviceModal';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import AsyncSelect from 'react-select/async';
import axiosInstance from '../../../utils/axios';

const AdminAssignmentManager = () => {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [assembleDevice, setAssembleDevice] = useState(null);
  const [returnItem, setReturnItem] = useState(null);
  const [viewAssignmentDetail, setViewAssignmentDetail] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', department_id: '', category_id: '', start_date: '', end_date: '', status: '' });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [isExporting, setIsExporting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);



  const { data: assignmentsRes = {}, isLoading: isLoadingAssignments } = useGetAssignments({ ...debouncedFilters, page, limit: 20 });
  const assignments = assignmentsRes?.data || [];
  const meta = assignmentsRes?.meta;
  const { data: departmentsRes = {}, isLoading: isLoadingDept } = useGetDepartments({ limit: 1000 });
  const departments = departmentsRes?.data || [];
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories();



  const isLoading = isLoadingAssignments || isLoadingDept || isLoadingCategories;

  const loadDevices = async (inputValue) => {
    try {
      const res = await axiosInstance.get('/api/devices', {
        params: { search: inputValue, limit: 20, status: DEVICE_STATUS.IN_STOCK }
      });
      const filtered = (res.data.data || []).filter(d => !d.parent_device_id && d.category?.parent_id === null);
      return filtered.map(d => ({ value: d.id, label: `${d.asset_code} - ${d.name}` }));
    } catch {
      return [];
    }
  };

  const loadEmployees = async (inputValue) => {
    try {
      const res = await axiosInstance.get('/api/employees', {
        params: { search: inputValue, limit: 25, dept_type: 'van_phong' }
      });
      return (res.data.data || []).map(e => ({
        value: e.id,
        label: `${e.full_name || e.name} (${e.employee_code}) - ${e.position ? `${e.position} ` : ''}${e.department?.name || 'Không có PB'}`
      }));
    } catch {
      return [];
    }
  };


  const addAssignment = useAddAssignment();
  const returnAssignment = useReturnAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const calculateTimeAssigned = (assignedDate) => {
    const start = new Date(assignedDate);
    const end = new Date();
    if (start > end) return 'Chưa đến hạn';
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0 && months === 0) return 'Dưới 1 tháng';
    if (years === 0) return `${months} tháng`;
    if (months === 0) return `${years} năm`;
    return `${years} năm ${months} tháng`;
  };

  const handleError = (error) => {
    const errorCode = error?.response?.data?.errorCode;
    toast.error(errorCode ? getErrorMessage(errorCode) : (error?.response?.data?.message || 'Có lỗi xảy ra'));
  };

  const formik = useFormik({
    initialValues: { device_id: '', employee_id: '', assigned_date: new Date().toISOString().split('T')[0], assigned_by: 'Admin', note: '' },
    validationSchema: Yup.object({ device_id: Yup.number().required('Bắt buộc'), employee_id: Yup.number().required('Bắt buộc'), assigned_date: Yup.date().required('Bắt buộc') }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await addAssignment.mutateAsync(values);
        toast.success('Cấp phát thành công');
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        setIsFormOpen(false); formik.resetForm();
      } catch (error) { handleError(error); }
      finally { setSubmitting(false); }
    }
  });

  const returnFormik = useFormik({
    initialValues: { returned_date: new Date().toISOString().split('T')[0], note: '', return_status: 'in_stock' },
    validationSchema: Yup.object({
      returned_date: Yup.date().required('Bắt buộc'),
      return_status: Yup.string().required('Bắt buộc')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!returnItem) return;
      try {
        await returnAssignment.mutateAsync({ id: returnItem.id, data: values });
        toast.success('Đã thu hồi thiết bị thành công');
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        setReturnItem(null);
      } catch (error) { handleError(error); }
      finally { setSubmitting(false); }
    }
  });

  const handleReturn = (item) => {
    setReturnItem(item);
    returnFormik.resetForm();
    returnFormik.setValues({ returned_date: new Date().toISOString().split('T')[0], note: 'Đã thu hồi', return_status: DEVICE_STATUS.IN_STOCK });
  };

  const editFormik = useFormik({
    initialValues: { assigned_date: '', returned_date: '', assigned_by: '', note: '' },
    validationSchema: Yup.object({
      assigned_date: Yup.date().required('Bắt buộc')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!editItem) return;
      try {
        await updateAssignment.mutateAsync({
          id: editItem.id,
          data: {
            ...values,
            returned_date: values.returned_date || null
          }
        });
        toast.success('Cập nhật thành công');
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        setIsEditModalOpen(false);
      } catch (error) { handleError(error); }
      finally { setSubmitting(false); }
    }
  });

  const handleEdit = (item) => {
    setEditItem(item);
    editFormik.setValues({
      assigned_date: item.assigned_date ? new Date(item.assigned_date).toISOString().split('T')[0] : '',
      returned_date: item.returned_date ? new Date(item.returned_date).toISOString().split('T')[0] : '',
      assigned_by: item.assigned_by || '',
      note: item.note || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Cấp Phát',
      message: 'Bạn có chắc chắn muốn xóa bản cấp phát này?',
      onConfirm: async () => {
        try {
          await deleteAssignment.mutateAsync(item.id);
          toast.success('Xóa cấp phát thành công');
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          queryClient.invalidateQueries({ queryKey: ['devices'] });
        } catch (error) {
          handleError(error);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const response = await axiosInstance.get('/api/assignments/export', {
        params: { ...debouncedFilters, status: ASSIGNMENT_STATUS.ACTIVE }
      });
      const grouped = response.data || {};

      const getComponent = (device, code) => {
        if (!device?.child_devices) return '-';
        const comps = device.child_devices.filter(c => c.category?.code === code);
        return comps.length > 0 ? comps.map(c => c.name).join('\n') : '-';
      };

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Cấp Phát Thiết Bị');

      sheet.columns = [
        { key: 'employee_code', width: 15 },
        { key: 'employee', width: 20 },
        { key: 'position', width: 18 },
        { key: 'cpu', width: 12 },
        { key: 'ram', width: 12 },
        { key: 'drive', width: 12 },
        { key: 'vga', width: 12 },
        { key: 'monitor', width: 12 },
        { key: 'keyboard', width: 12 },
        { key: 'mouse', width: 12 },
        { key: 'assigned_date', width: 15 },
      ];

      // Row 1: Title
      const titleRow = sheet.addRow({ employee_code: 'BẢNG TỔNG HỢP CẤP PHÁT' });
      sheet.mergeCells(titleRow.number, 1, titleRow.number, 11);

      // Row 2: Main Headers
      sheet.addRow({
        employee_code: 'Mã NV',
        employee: 'Nhân Viên',
        position: 'Chức Vụ',
        cpu: 'Máy tính bộ',
        assigned_date: 'Ngày Cấp'
      });

      // Row 3: Sub Headers
      sheet.addRow({
        cpu: 'CPU',
        ram: 'RAM',
        drive: 'Ổ Cứng',
        vga: 'VGA',
        monitor: 'Màn Hình',
        keyboard: 'Bàn Phím',
        mouse: 'Chuột'
      });

      // Perform merges after adding all header rows to prevent auto-increment issues
      sheet.mergeCells('A2:A3');
      sheet.mergeCells('B2:B3');
      sheet.mergeCells('C2:C3');
      sheet.mergeCells('D2:J2');
      sheet.mergeCells('K2:K3');

      // Style row 1
      const titleCell = sheet.getRow(1).getCell(1);
      titleCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FF1F497D' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getRow(1).height = 35;

      // Style headers (row 2 and 3)
      for (let i = 2; i <= 3; i++) {
        sheet.getRow(i).height = 25;
        for (let c = 1; c <= 11; c++) {
          const cell = sheet.getRow(i).getCell(c);
          cell.font = { name: 'Times New Roman', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F497D' } }; // Popular dark blue UI
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        }
      }

      Object.keys(grouped).sort().forEach((dept) => {
        // Department Header Row
        const deptRow = sheet.addRow({ employee_code: dept });
        sheet.mergeCells(deptRow.number, 1, deptRow.number, 11);
        deptRow.height = 30; // Chiếm 1 dòng rõ ràng

        const deptCell = deptRow.getCell(1);
        deptCell.font = { name: 'Times New Roman', bold: true, italic: true, size: 11, color: { argb: 'FF000000' } };
        deptCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        deptCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };

        for (let c = 1; c <= 11; c++) {
          deptRow.getCell(c).border = { top: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };
        }

        const items = grouped[dept];
        items.forEach((item, i) => {
          const isAlternate = i % 2 !== 0;
          const color = isAlternate ? 'FFF2F2F2' : 'FFFFFFFF'; // Alternate rows within department

          const row = sheet.addRow({
            employee_code: item.employee?.employee_code || '-',
            employee: item.employee?.full_name || item.employee?.name || '-',
            position: item.employee?.position || '-',
            cpu: getComponent(item.device, DEVICE_CATEGORY_CODES.CPU),
            ram: getComponent(item.device, DEVICE_CATEGORY_CODES.RAM),
            drive: getComponent(item.device, DEVICE_CATEGORY_CODES.DRIVE),
            vga: getComponent(item.device, DEVICE_CATEGORY_CODES.VGA),
            monitor: getComponent(item.device, DEVICE_CATEGORY_CODES.MONITOR),
            keyboard: getComponent(item.device, DEVICE_CATEGORY_CODES.KEYBOARD),
            mouse: getComponent(item.device, DEVICE_CATEGORY_CODES.MOUSE),
            assigned_date: item.assigned_date ? new Date(item.assigned_date).toLocaleDateString('vi-VN') : '-'
          });

          // Set a minimum reasonable height for data rows with wrapped text
          row.height = 40;

          for (let c = 1; c <= 11; c++) {
            const cell = row.getCell(c);
            cell.font = { name: 'Times New Roman', size: 11, color: { argb: 'FF000000' } };
            if (c >= 4) {
              cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            } else {
              cell.alignment = { vertical: 'middle', wrapText: true };
            }
            cell.border = { top: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `ThongKe_ThietBi_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Xuất file Excel thành công');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xuất Excel');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <Loading />;

  const filteredAssignments = assignments;

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6 text-hepco-green" /> Cấp Phát Thiết Bị</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleExportExcel} disabled={isExporting} className="flex items-center whitespace-nowrap gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-75">
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : <Download className="w-5 h-5 text-gray-500" />}
            <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>
          <button onClick={() => setIsFormOpen(true)} className="flex items-center whitespace-nowrap gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center cursor-pointer disabled:cursor-not-allowed"><Plus className="w-5 h-5" /> <span>Cấp Phát Mới</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm thiết bị, nhân viên..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(f => ({ ...f, search: '' }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
          value={filters.category_id}
          onChange={(e) => setFilters(f => ({ ...f, category_id: e.target.value }))}
        >
          <option value="">Tất cả danh mục</option>
          {categories.filter(c => c.parent_id === null).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
          value={filters.department_id}
          onChange={(e) => setFilters(f => ({ ...f, department_id: e.target.value }))}
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
            value={filters.start_date}
            onChange={(e) => setFilters(f => ({ ...f, start_date: e.target.value }))}
            title="Từ ngày"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
            value={filters.end_date}
            onChange={(e) => setFilters(f => ({ ...f, end_date: e.target.value }))}
            title="Đến ngày"
          />
        </div>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">Tất cả trạng thái</option>
          <option value={ASSIGNMENT_STATUS.IN_USE}>Đang sử dụng</option>
          <option value={ASSIGNMENT_STATUS.RETURNED}>Đã trả</option>
        </select>
      </div>

      {(addAssignment.isPending || returnAssignment.isPending || updateAssignment.isPending || deleteAssignment.isPending) && <Loading fullScreen message="Đang xử lý..." />}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <form onSubmit={formik.handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-hepco-green" /> Cấp Phát Thiết Bị Mới
                </h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thiết Bị <span className="text-red-500">*</span></label>
                  <AsyncSelect
                    key={isFormOpen ? 'device-open' : 'device-closed'}
                    cacheOptions
                    defaultOptions
                    loadOptions={loadDevices}
                    onChange={(option) => formik.setFieldValue('device_id', option ? option.value : '')}
                    placeholder="-- Tìm kiếm thiết bị --"
                    isClearable
                    noOptionsMessage={() => "Không tìm thấy thiết bị"}
                    styles={{
                      control: (base) => ({ ...base, borderColor: '#D1D5DB', borderRadius: '0.5rem', padding: '2px', outline: 'none', boxShadow: 'none', '&:hover': { borderColor: '#10B981' } })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân Viên <span className="text-red-500">*</span></label>
                  <AsyncSelect
                    key={isFormOpen ? 'employee-open' : 'employee-closed'}
                    cacheOptions
                    defaultOptions
                    loadOptions={loadEmployees}
                    onChange={(option) => formik.setFieldValue('employee_id', option ? option.value : '')}
                    placeholder="-- Tìm kiếm nhân viên --"
                    isClearable
                    noOptionsMessage={() => "Không tìm thấy nhân viên"}
                    styles={{
                      control: (base) => ({ ...base, borderColor: '#D1D5DB', borderRadius: '0.5rem', padding: '2px', outline: 'none', boxShadow: 'none', '&:hover': { borderColor: '#10B981' } })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bàn giao <span className="text-red-500">*</span></label>
                  <input type="date" name="assigned_date" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.assigned_date} onChange={formik.handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người bàn giao</label>
                  <input name="assigned_by" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.assigned_by} onChange={formik.handleChange} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <input name="note" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.note} onChange={formik.handleChange} />
                </div>
              </div>
              <div className="mt-8 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsFormOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Hủy Bỏ</button>
                <button type="submit" disabled={formik.isSubmitting} className="py-2.5 px-6 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 text-white bg-hepco-green hover:bg-green-700">Ghi Nhận Cấp Phát</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <form onSubmit={editFormik.handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-500" /> Cập Nhật Cấp Phát
                </h2>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bàn giao <span className="text-red-500">*</span></label>
                  <input type="date" name="assigned_date" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" value={editFormik.values.assigned_date} onChange={editFormik.handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người bàn giao</label>
                  <input name="assigned_by" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" value={editFormik.values.assigned_by} onChange={editFormik.handleChange} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <input name="note" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" value={editFormik.values.note} onChange={editFormik.handleChange} />
                </div>
              </div>
              <div className="mt-8 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Hủy Bỏ</button>
                <button type="submit" disabled={editFormik.isSubmitting} className="py-2.5 px-6 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Ngày Cấp</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Mã NV</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Nhân Viên</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Chức Vụ</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignments.map(a => (
                  <tr key={a.id} onClick={() => setViewAssignmentDetail(a)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">{new Date(a.assigned_date).toLocaleDateString('vi-VN')}</div>
                      <div className="text-xs text-hepco-green font-medium mt-1">{!a.returned_date && calculateTimeAssigned(a.assigned_date)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{a.employee?.employee_code || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{a.employee?.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{a.employee?.position || '-'}</td>
                    <td className="px-6 py-4">
                      {a.returned_date ?
                        <span className="inline-flex items-center text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap">Đã trả</span> :
                        <span className="inline-flex items-center text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap">Đang sử dụng</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === a.id ? null : a.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === a.id && (
                        <div className="absolute right-8 top-10 bg-white border border-gray-100 shadow-xl rounded-xl w-40 z-10 flex flex-col overflow-hidden py-1">
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleEdit(a); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Edit2 className="w-4 h-4 text-blue-500" /> Sửa thông tin
                          </button>
                          {!a.returned_date && (
                            <>
                              {a.device?.category?.parent_id === null && (
                                <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setAssembleDevice(a.device); setIsAssembleModalOpen(true); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                  <Package className="w-4 h-4 text-gray-500" /> Cấu hình
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleReturn(a); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-yellow-500" /> Thu hồi
                              </button>
                            </>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDelete(a); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                            <Trash2 className="w-4 h-4" /> Xóa
                          </button>
                        </div>
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
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Không có dữ liệu cấp phát</h3>
            <p className="text-gray-500 mt-1">Chưa có thiết bị nào được cấp phát hoặc không khớp với tìm kiếm.</p>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {viewAssignmentDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Chi tiết thiết bị sử dụng</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Nhân viên: <span className="font-semibold">{viewAssignmentDetail.employee?.full_name}</span> - {viewAssignmentDetail.employee?.employee_code}
                </p>
              </div>
              <button onClick={() => setViewAssignmentDetail(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1 bg-white">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">Mã TS</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">Tên Thiết Bị</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">Danh Mục</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Parent Device (Highlighted) */}
                    <tr className="bg-blue-50/40">
                      <td className="px-4 py-3 font-mono text-sm text-blue-800 font-semibold">{viewAssignmentDetail.device?.asset_code}</td>
                      <td className="px-4 py-3 text-sm text-blue-900 font-bold">
                        {viewAssignmentDetail.device?.name}
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold">Thiết bị chính</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-800 font-semibold">{viewAssignmentDetail.device?.category?.name}</td>
                    </tr>
                    {/* Child Devices */}
                    {(viewAssignmentDetail.device?.child_devices || []).map(child => (
                      <tr key={child.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm text-gray-600 pl-8 relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-px bg-gray-300"></div>
                          <div className="absolute left-4 top-0 h-1/2 w-px bg-gray-300"></div>
                          {child.asset_code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{child.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{child.category?.name}</td>
                      </tr>
                    ))}
                    {(viewAssignmentDetail.device?.child_devices || []).length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-6 text-center text-gray-500 text-sm">Không có linh kiện đi kèm</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {returnItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><RotateCcw className="w-5 h-5 text-yellow-600" /> Thu hồi thiết bị</h3>
              <button onClick={() => setReturnItem(null)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={returnFormik.handleSubmit} className="p-4">
              <p className="text-sm text-gray-600 mb-4">Bạn đang thu hồi <span className="font-semibold">{returnItem.device?.name}</span> từ <span className="font-semibold">{returnItem.employee?.full_name}</span></p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thiết bị sau khi thu hồi <span className="text-red-500">*</span></label>
                  <select
                    name="return_status"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                    value={returnFormik.values.return_status}
                    onChange={returnFormik.handleChange}
                  >
                    <option value={DEVICE_STATUS.IN_STOCK}>Tồn kho (Bình thường)</option>
                    <option value={DEVICE_STATUS.BROKEN}>Hỏng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thu hồi <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="returned_date"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                    value={returnFormik.values.returned_date}
                    onChange={returnFormik.handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    name="note"
                    rows={2}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                    value={returnFormik.values.note}
                    onChange={returnFormik.handleChange}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setReturnItem(null)} className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={returnFormik.isSubmitting} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium">Xác nhận Thu Hồi</button>
              </div>
            </form>
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

export default AdminAssignmentManager;
