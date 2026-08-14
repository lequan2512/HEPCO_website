import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Building2,
  CheckSquare,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../../components/Pagination';
import {
  useGetDispatches,
  useGetTasks,
  useGetBaseHealth
} from '../../../apis/baseOffice';
import {
  DISPATCH_TYPES,
  DISPATCH_TYPE_LABELS,
  DISPATCH_STATUS,
  DISPATCH_STATUS_LABELS,
  TASK_STATUS,
  TASK_STATUS_LABELS
} from '../../../constants/baseOffice';
import { formatDate } from '../../../utils/formatDate';
import CreateDispatchModal from './components/CreateDispatchModal';
import DispatchDetailModal from './components/DispatchDetailModal';

const AdminBaseOffice = () => {
  const [activeTab, setActiveTab] = useState('dispatches'); // 'dispatches' | 'tasks'
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  // Reset page & search when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setFilters({ search: '', type: '', status: '' });
  };

  // Debounce search & filter inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters]);

  // Queries
  const {
    data: dispatchesRes = {},
    isLoading: isLoadingDispatches,
    refetch: refetchDispatches
  } = useGetDispatches({ ...debouncedFilters, page, limit: 20 }, { enabled: activeTab === 'dispatches' });

  const {
    data: tasksRes = {},
    isLoading: isLoadingTasks,
    refetch: refetchTasks
  } = useGetTasks({ ...debouncedFilters, page, limit: 20 }, { enabled: activeTab === 'tasks' });

  const { refetch: refetchHealth } = useGetBaseHealth();

  // Helper to normalize data list and compute meta using total for Pagination component
  const getPaginatedData = (res, currentPage, limit = 20) => {
    const rawList = Array.isArray(res)
      ? res
      : (res?.data || []);

    const total = Number(
      res?.meta?.total
      ?? res?.total
      ?? res?.pagination?.total
      ?? rawList.length
    ) || 0;

    const totalPages = res?.meta?.totalPages
      ?? res?.pagination?.totalPages
      ?? (Math.ceil(total / limit) || 1);

    const meta = {
      page: currentPage,
      limit,
      total,
      totalPages
    };

    const isBackendPaginated = !!(res?.meta || res?.pagination);
    const displayData = isBackendPaginated
      ? rawList
      : rawList.slice((currentPage - 1) * limit, currentPage * limit);

    return { data: displayData, meta };
  };

  const { data: dispatches, meta: dispatchesMeta } = getPaginatedData(dispatchesRes, page, 20);
  const { data: tasks, meta: tasksMeta } = getPaginatedData(tasksRes, page, 20);

  const handleRefresh = () => {
    if (activeTab === 'dispatches') refetchDispatches();
    if (activeTab === 'tasks') refetchTasks();
    refetchHealth();
    toast.success('Đã cập nhật dữ liệu mới nhất từ Base.vn');
  };

  return (
    <div className="p-1 sm:p-2 md:p-4 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-hepco-green/10 text-hepco-green flex items-center justify-center font-bold shadow-xs shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Quản Lý Base.vn Office</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đồng bộ dữ liệu</span>
          </button>

          {activeTab === 'dispatches' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-hepco-green hover:bg-hepco-green/90 rounded-lg shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Công Văn Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white px-2 sm:px-4 pt-1 sm:pt-2 rounded-t-xl overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => handleTabChange('dispatches')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs font-bold transition-all border-b-2 shrink-0 ${activeTab === 'dispatches'
            ? 'border-hepco-green text-hepco-green'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FileText className="w-4 h-4" />
          Công Văn
        </button>

        <button
          onClick={() => handleTabChange('tasks')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs font-bold transition-all border-b-2 shrink-0 ${activeTab === 'tasks'
            ? 'border-hepco-green text-hepco-green'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <CheckSquare className="w-4 h-4" />
          Công Việc Liên Quan
        </button>
      </div>

      {/* TAB 1: DISPATCHES (Base Office) */}
      {activeTab === 'dispatches' && (
        <div className="bg-white rounded-b-xl rounded-t-none shadow-xs border border-gray-100 p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, cơ quan gửi..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green"
              />
            </div>

            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green"
              >
                <option value="">-- Tất cả loại văn bản --</option>
                <option value={DISPATCH_TYPES.INCOMING}>Công văn đến</option>
                <option value={DISPATCH_TYPES.OUTGOING}>Công văn đi</option>
                <option value={DISPATCH_TYPES.INTERNAL}>Công văn nội bộ</option>
              </select>
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green"
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value={DISPATCH_STATUS.PENDING}>Chờ phân công</option>
                <option value={DISPATCH_STATUS.PROCESSING}>Đang xử lý</option>
                <option value={DISPATCH_STATUS.COMPLETED}>Đã hoàn thành</option>
                <option value={DISPATCH_STATUS.REJECTED}>Từ chối/Hủy</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 min-h-[250px]">
            <table className="w-full text-left text-xs text-gray-700 min-w-[650px]">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-2.5 sm:p-3.5 min-w-[200px]">Tiêu đề công văn</th>
                  <th className="p-2.5 sm:p-3.5 whitespace-nowrap">Loại văn bản</th>
                  <th className="p-2.5 sm:p-3.5 min-w-[170px]">Đơn vị gửi/nhận</th>
                  <th className="p-2.5 sm:p-3.5 whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingDispatches ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 text-hepco-green animate-spin" />
                        <span className="text-xs font-semibold text-gray-500">Đang tải dữ liệu công văn...</span>
                      </div>
                    </td>
                  </tr>
                ) : dispatches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-10 h-10 text-gray-300" />
                        <p className="text-sm font-medium">Không tìm thấy công văn phù hợp</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dispatches.map((item) => {
                    const typeLabel = item.typeConfig || DISPATCH_TYPE_LABELS[item.type] || { label: item.type, bg: 'bg-gray-100', text: 'text-gray-700' };
                    const statusLabel = item.statusConfig || DISPATCH_STATUS_LABELS[item.status] || { label: item.status, bg: 'bg-gray-100', text: 'text-gray-700' };

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedDispatch(item)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <td className="p-2.5 sm:p-3.5 min-w-[220px]">
                          <p className="font-semibold text-gray-900 line-clamp-2 group-hover:text-hepco-green transition-colors">{item.title}</p>
                          <span className="text-[10px] text-gray-400 mt-0.5 block whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </span>
                        </td>
                        <td className="p-2.5 sm:p-3.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold border ${typeLabel.bg} ${typeLabel.text} ${typeLabel.border || 'border-gray-200'}`}>
                            {typeLabel.label}
                          </span>
                        </td>
                        <td className="p-2.5 sm:p-3.5 min-w-[170px]">
                          <p className="font-medium text-gray-900">{item.sender}</p>
                          <p className="text-[11px] text-gray-500">➡️ {item.receiver}</p>
                        </td>
                        <td className="p-2.5 sm:p-3.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold ${statusLabel.bg} ${statusLabel.text}`}>
                            {statusLabel.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {dispatchesMeta && (
            <Pagination meta={dispatchesMeta} onPageChange={setPage} />
          )}
        </div>
      )}

      {/* TAB 2: TASKS (Base Wework) */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-b-xl rounded-t-none shadow-xs border border-gray-100 p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
          {/* Filters Bar for Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm công việc theo tên, dự án, người thực hiện..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green"
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green"
              >
                <option value="">-- Tất cả trạng thái công việc --</option>
                <option value={TASK_STATUS.TODO}>Mới giao / Chưa làm</option>
                <option value={TASK_STATUS.IN_PROGRESS}>Đang thực hiện</option>
                <option value={TASK_STATUS.COMPLETED}>Hoàn thành</option>
                <option value={TASK_STATUS.FAILED}>Quá hạn / Thất bại</option>
                <option value={TASK_STATUS.PENDING_REVIEW}>Chờ duyệt</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 min-h-[250px]">
            <table className="w-full text-left text-xs text-gray-700 min-w-[750px]">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-2.5 sm:p-3.5 min-w-[180px]">Tên công việc</th>
                  <th className="p-2.5 sm:p-3.5 whitespace-nowrap">Dự án liên quan</th>
                  <th className="p-2.5 sm:p-3.5 whitespace-nowrap">Người giao/Nhận</th>
                  <th className="p-2.5 sm:p-3.5 whitespace-nowrap">Hạn hoàn thành</th>
                  <th className="p-2.5 sm:p-3.5 whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingTasks ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 text-hepco-green animate-spin" />
                        <span className="text-xs font-semibold text-gray-500">Đang tải dữ liệu công việc...</span>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckSquare className="w-10 h-10 text-gray-300" />
                        <p className="text-sm font-medium">Không tìm thấy công việc phù hợp</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((item) => {
                    const statusConfig = item.statusConfig || TASK_STATUS_LABELS[item.status] || { label: 'Mới giao', bg: 'bg-gray-100', text: 'text-gray-700' };
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 sm:p-3.5 font-semibold text-gray-900 min-w-[180px]">{item.title}</td>
                        <td className="p-2.5 sm:p-3.5 text-gray-600 whitespace-nowrap">{item.project}</td>
                        <td className="p-2.5 sm:p-3.5 font-medium text-gray-900 whitespace-nowrap">{item.assignee}</td>
                        <td className="p-2.5 sm:p-3.5 text-gray-600 whitespace-nowrap">{item.due_date}</td>
                        <td className="p-2.5 sm:p-3.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold ${statusConfig.bg || 'bg-gray-100'} ${statusConfig.text || 'text-gray-700'}`}>
                            {statusConfig.label || 'Mới giao'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {tasksMeta && (
            <Pagination meta={tasksMeta} onPageChange={setPage} />
          )}
        </div>
      )}

      {/* Modals */}
      <CreateDispatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetchDispatches}
      />

      <DispatchDetailModal
        isOpen={!!selectedDispatch}
        onClose={() => setSelectedDispatch(null)}
        dispatch={selectedDispatch}
      />
    </div>
  );
};

export default AdminBaseOffice;


