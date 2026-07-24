import { useState, useEffect } from 'react';
import { Printer, Plus, Trash2, Edit2, X, Search, Send, PackageCheck, History, UserCheck, MoreVertical, Package, CheckCircle2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import {
  useGetPosPapers, useAddPosPaper, useUpdatePosPaper,
  useDeletePosPaper, useIssuePosPaper, useGetPosPaperIssues
} from '../../../apis/posPaper';
import { useGetEmployees } from '../../../apis/employee';
import Select from 'react-select';


const AdminPosPaperManager = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'issues'
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const { data: papersRes, isLoading } = useGetPosPapers({
    search: debouncedSearch,
    page,
    limit: 20
  });

  const { data: issuesRes } = useGetPosPaperIssues({
    page,
    limit: 20
  });

  const { data: employeesRes } = useGetEmployees({ dept_type: 'xi_nghiep', limit: 500 });
  const collectorEmployees = employeesRes?.data || (Array.isArray(employeesRes) ? employeesRes : []);

  const papers = Array.isArray(papersRes?.data) ? papersRes.data : (Array.isArray(papersRes) ? papersRes : []);
  const meta = papersRes?.meta;

  const issues = Array.isArray(issuesRes?.data) ? issuesRes.data : (Array.isArray(issuesRes) ? issuesRes : []);
  const issuesMeta = issuesRes?.meta;

  const addMutation = useAddPosPaper();
  const updateMutation = useUpdatePosPaper();
  const deleteMutation = useDeletePosPaper();
  const issueMutation = useIssuePosPaper();

  // Compute paper inventory statistics safely
  const totalImportedRolls = papers.reduce((sum, p) => sum + Number(p.total_quantity || 0), 0);
  const totalStockRolls = papers.reduce((sum, p) => sum + Number(p.in_stock_quantity || 0), 0);
  const totalIssuedRolls = papers.reduce((sum, p) => sum + Number(p.issued_quantity || 0), 0);

  const formik = useFormik({
    initialValues: {
      paper_name: '',
      code: '',
      total_quantity: 100,
      unit_price: '',
      supplier_name: '',
      notes: ''
    },
    validationSchema: Yup.object({
      paper_name: Yup.string().required('Vui lòng nhập tên loại giấy in'),
      total_quantity: Yup.number().min(1, 'Số lượng phải lớn hơn 0').required('Vui lòng nhập số lượng'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingId) {
          await updateMutation.mutateAsync({ id: editingId, ...values });
          toast.success('Cập nhật thông tin giấy in thành công');
        } else {
          await addMutation.mutateAsync(values);
          toast.success('Thêm mới loại giấy in thành công');
        }
        setIsFormOpen(false);
        setEditingId(null);
        formik.resetForm();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu giấy in');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const issueFormik = useFormik({
    initialValues: {
      paper_id: '',
      employee_id: '',
      quantity: 10,
      issue_date: new Date().toISOString().split('T')[0],
      note: ''
    },
    validationSchema: Yup.object({
      employee_id: Yup.string().required('Vui lòng chọn nhân viên thu phí'),
      quantity: Yup.number().min(1, 'Số lượng cấp phát tối thiểu là 1 cuộn').required('Vui lòng nhập số lượng cuộn'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const emp = collectorEmployees.find(e => String(e.id) === String(values.employee_id));
        await issueMutation.mutateAsync({
          ...values,
          paper_id: selectedPaper?.id || values.paper_id,
          employee_name: emp ? emp.full_name : 'Nhân viên thu phí'
        });
        toast.success(`Cấp phát thành công ${values.quantity} cuộn giấy in cho ${emp?.full_name || 'Nhân viên'}`);
        setIsIssueModalOpen(false);
        issueFormik.resetForm();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cấp phát giấy in');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEdit = (item) => {
    setEditingId(item.id);
    formik.setValues({
      paper_name: item.paper_name || '',
      code: item.code || '',
      total_quantity: item.total_quantity || 0,
      unit_price: item.unit_price || '',
      supplier_name: item.supplier_name || '',
      notes: item.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleOpenIssueModal = (item) => {
    setSelectedPaper(item);
    issueFormik.setFieldValue('paper_id', item.id);
    setIsIssueModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Loại Giấy In',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm giấy in này khỏi kho?',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success('Đã xóa loại giấy in');
        } catch {
          toast.error('Không thể xóa loại giấy in này');
        }
      }
    });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="w-full relative space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Printer className="w-7 h-7 text-hepco-green" /> Quản Lý Kho Giấy In POS
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý tồn kho cuộn giấy in nhiệt (K57 / K80) và cấp phát giấy in cho nhân viên thu phí
          </p>
        </div>

        <button
          onClick={() => { setIsFormOpen(true); setEditingId(null); formik.resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> <span>Nhập Kho Giấy In</span>
        </button>
      </div>

      {/* Summary Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalImportedRolls} <span className="text-xs font-normal text-gray-500">cuộn</span></div>
            <div className="text-xs text-gray-500 font-medium">Tổng Giấy In Nhập Kho</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-800">{totalStockRolls} <span className="text-xs font-normal text-gray-500">cuộn</span></div>
            <div className="text-xs text-gray-500 font-medium">Tồn Kho Sẵn Có</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-900">{totalIssuedRolls} <span className="text-xs font-normal text-gray-500">cuộn</span></div>
            <div className="text-xs text-gray-500 font-medium">Đã Cấp Cho NV Thu Phí</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 border-b sm:border-b-0 border-gray-100 w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2 sm:pb-0 text-sm font-semibold flex items-center gap-2 border-b-2 sm:border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-hepco-green text-hepco-green' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <PackageCheck className="w-4 h-4" /> Kho Giấy In ({papers.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`pb-2 sm:pb-0 text-sm font-semibold flex items-center gap-2 border-b-2 sm:border-b-2 transition-colors ${activeTab === 'issues' ? 'border-hepco-green text-hepco-green' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <History className="w-4 h-4" /> Lịch Sử Cấp Phát ({issues.length})
          </button>
        </div>

        {activeTab === 'inventory' && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo tên giấy, mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab === 'inventory' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {papers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <th className="px-6 py-4">Mã Ký Hiệu</th>
                    <th className="px-6 py-4">Tên Loại Giấy In POS</th>
                    <th className="px-6 py-4">Tổng Nhập</th>
                    <th className="px-6 py-4">Tồn Kho</th>
                    <th className="px-6 py-4">Đã Phát</th>
                    <th className="px-6 py-4">Nhà Cung Cấp</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {papers.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-800">{p.code || 'PAP-01'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                        <Printer className="w-4 h-4 text-hepco-green" />
                        {p.paper_name}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-bold">{p.total_quantity} cuộn</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                          {p.in_stock_quantity} cuộn sẵn có
                        </span>
                      </td>
                      <td className="px-6 py-4 text-purple-700 font-medium">{p.issued_quantity} cuộn</td>
                      <td className="px-6 py-4 text-gray-500">{p.supplier_name || '-'}</td>
                      <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === p.id ? null : p.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                          title="Thao tác"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openDropdownId === p.id && (
                          <div className="absolute right-6 top-10 bg-white border border-gray-100 shadow-xl rounded-xl w-48 z-20 flex flex-col overflow-hidden py-1 text-left">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleOpenIssueModal(p); }}
                              disabled={p.in_stock_quantity <= 0}
                              className="w-full px-4 py-2.5 text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2 disabled:opacity-40"
                            >
                              <Send className="w-4 h-4 text-purple-600" />
                              Phát giấy cho NV
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleEdit(p); }}
                              className="w-full px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                              Sửa thông tin
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>

                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDelete(p.id); }}
                              className="w-full px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              Xóa khỏi kho
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
              <Printer className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">Kho giấy in đang trống</h3>
              <p className="text-gray-500 text-sm mt-1">Chưa có thông tin nhập kho giấy in nhiệt POS.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {issues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Ngày Phát</th>
                    <th className="px-6 py-4">NV Nhận Giấy</th>
                    <th className="px-6 py-4">Xí Nghiệp</th>
                    <th className="px-6 py-4">Loại Giấy In</th>
                    <th className="px-6 py-4">Số Cuộn Cấp</th>
                    <th className="px-6 py-4">Người Phát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {issues.map((is) => (
                    <tr key={is.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {new Date(is.issue_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-purple-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        {is.employee_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {is.employee?.department?.name || 'Xí nghiệp môi trường'}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{is.paper?.paper_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md font-bold text-xs">
                          +{is.quantity} cuộn
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{is.issued_by || 'Admin'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination meta={issuesMeta} onPageChange={setPage} />
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <History className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">Chưa có lịch sử cấp phát giấy in</h3>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Modal Add/Edit Paper */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative">
            <form onSubmit={formik.handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-hepco-green" />
                  {editingId ? 'Cập Nhật Giấy In POS' : 'Nhập Kho Giấy In POS'}
                </h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Loại Giấy In POS <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="paper_name"
                    placeholder="VD: Giấy in nhiệt K57 x 45mm"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.paper_name}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.paper_name && formik.errors.paper_name && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.paper_name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã Loại Giấy</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="VD: K57-45"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng Nhập (Cuộn) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="total_quantity"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.total_quantity}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.total_quantity && formik.errors.total_quantity && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.total_quantity}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà Cung Cấp</label>
                  <input
                    type="text"
                    name="supplier_name"
                    placeholder="Nhập tên nhà cung cấp..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.supplier_name}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100">
                  Hủy Bỏ
                </button>
                <button type="submit" disabled={formik.isSubmitting} className="py-2.5 px-6 font-bold rounded-lg text-white bg-hepco-green hover:bg-green-700">
                  {editingId ? 'Cập Nhật' : 'Lưu Nhập Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Issue Paper */}
      {isIssueModalOpen && selectedPaper && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative">
            <form onSubmit={issueFormik.handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b bg-purple-50">
                <div>
                  <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                    <Send className="w-5 h-5 text-purple-700" />
                    Cấp Phát Giấy In POS
                  </h2>
                  <p className="text-xs text-purple-700 mt-1">
                    {selectedPaper.paper_name} (Còn {selectedPaper.in_stock_quantity} cuộn tồn)
                  </p>
                </div>
                <button type="button" onClick={() => setIsIssueModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân Viên Thu Phí Nhận Giấy <span className="text-red-500">*</span></label>
                  <Select
                    options={collectorEmployees.map(e => ({
                      value: e.id,
                      label: `${e.full_name} (${e.employee_code || 'NV'}) - ${e.department?.name || 'Xí nghiệp'}`
                    }))}
                    value={collectorEmployees
                      .map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_code || 'NV'}) - ${e.department?.name || 'Xí nghiệp'}` }))
                      .find(o => String(o.value) === String(issueFormik.values.employee_id)) || null
                    }
                    onChange={(option) => {
                      issueFormik.setFieldValue('employee_id', option ? option.value : '');
                    }}
                    placeholder="-- Gõ để tìm kiếm nhân viên thu phí --"
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
                        '&:hover': { borderColor: '#7C3AED' }
                      })
                    }}
                  />
                  {issueFormik.touched.employee_id && issueFormik.errors.employee_id && (
                    <div className="text-red-500 text-xs mt-1">{issueFormik.errors.employee_id}</div>
                  )}
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số Cuộn Giấy Cấp Phát <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="quantity"
                    max={selectedPaper.in_stock_quantity}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/50 font-bold text-purple-900"
                    value={issueFormik.values.quantity}
                    onChange={issueFormik.handleChange}
                  />
                  {issueFormik.touched.quantity && issueFormik.errors.quantity && (
                    <div className="text-red-500 text-xs mt-1">{issueFormik.errors.quantity}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Cấp Phát</label>
                  <input
                    type="date"
                    name="issue_date"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/50"
                    value={issueFormik.values.issue_date}
                    onChange={issueFormik.handleChange}
                  />
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsIssueModalOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100">
                  Hủy Bỏ
                </button>
                <button type="submit" disabled={issueFormik.isSubmitting} className="py-2.5 px-6 font-bold rounded-lg text-white bg-purple-700 hover:bg-purple-800">
                  Xác Nhận Cấp Phát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPosPaperManager;
