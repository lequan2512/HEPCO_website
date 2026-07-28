import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Layers,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import Pagination from '../../../components/Pagination';
import {
  useGetDispatches,
  useGetRequests,
  useGetTasks,
  useGetBaseHealth
} from '../../../apis/baseOffice';
import {
  DISPATCH_TYPES,
  DISPATCH_TYPE_LABELS,
  DISPATCH_STATUS,
  DISPATCH_STATUS_LABELS,
  URGENCY_LEVEL_LABELS,
  REQUEST_STATUS_LABELS
} from '../../../constants/baseOffice';
import { formatDate } from '../../../utils/formatDate';
import CreateDispatchModal from './components/CreateDispatchModal';
import DispatchDetailModal from './components/DispatchDetailModal';

const AdminBaseOffice = () => {
  const [activeTab, setActiveTab] = useState('dispatches'); // 'dispatches' | 'requests' | 'tasks' | 'settings'
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  // Debounce search filter
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
    data: requestsRes = {},
    isLoading: isLoadingRequests,
    refetch: refetchRequests
  } = useGetRequests({ search: debouncedFilters.search, page, limit: 20 }, { enabled: activeTab === 'requests' });

  const {
    data: tasksRes = {},
    isLoading: isLoadingTasks,
    refetch: refetchTasks
  } = useGetTasks({ search: debouncedFilters.search, page, limit: 20 }, { enabled: activeTab === 'tasks' });

  const { refetch: refetchHealth } = useGetBaseHealth();



  const dispatches = dispatchesRes?.data || [];
  const dispatchesMeta = dispatchesRes?.meta;

  const requests = requestsRes?.data || [];
  const requestsMeta = requestsRes?.meta;

  const tasks = tasksRes?.data || [];
  const tasksMeta = tasksRes?.meta;

  const handleRefresh = () => {
    if (activeTab === 'dispatches') refetchDispatches();
    if (activeTab === 'requests') refetchRequests();
    if (activeTab === 'tasks') refetchTasks();
    refetchHealth();
    toast.success('Đã cập nhật dữ liệu mới nhất từ Base.vn');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-hepco-green/10 text-hepco-green flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản Lý Base.vn Office</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Đồng bộ dữ liệu
          </button>

          {activeTab === 'dispatches' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-hepco-green hover:bg-hepco-green/90 rounded-lg shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Tạo Công Văn Mới
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white px-4 pt-2 rounded-t-xl overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => { setActiveTab('dispatches'); setPage(1); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 shrink-0 ${activeTab === 'dispatches'
            ? 'border-hepco-green text-hepco-green'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FileText className="w-4 h-4" />
          Công Văn
        </button>

        <button
          onClick={() => { setActiveTab('requests'); setPage(1); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 shrink-0 ${activeTab === 'requests'
            ? 'border-hepco-green text-hepco-green'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <Layers className="w-4 h-4" />
          Trình Ký & Đề Xuất
        </button>

        <button
          onClick={() => { setActiveTab('tasks'); setPage(1); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 shrink-0 ${activeTab === 'tasks'
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
        <div className="bg-white rounded-b-xl rounded-t-none shadow-xs border border-gray-100 p-6 space-y-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, mã công văn, cơ quan gửi..."
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
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoadingDispatches ? (
            <Loading />
          ) : dispatches.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-medium">Không tìm thấy công văn phù hợp</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-700 min-w-[800px]">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">Mã CV</th>
                    <th className="p-3.5 min-w-[220px]">Tiêu đề công văn</th>
                    <th className="p-3.5 whitespace-nowrap">Loại văn bản</th>
                    <th className="p-3.5 min-w-[200px]">Đơn vị gửi/nhận</th>
                    <th className="p-3.5 whitespace-nowrap">Độ khẩn</th>
                    <th className="p-3.5 whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dispatches.map((item) => {
                    const typeLabel = DISPATCH_TYPE_LABELS[item.type] || { label: item.type, bg: 'bg-gray-100', text: 'text-gray-700' };
                    const statusLabel = DISPATCH_STATUS_LABELS[item.status] || { label: item.status, bg: 'bg-gray-100', text: 'text-gray-700' };
                    const urgencyLabel = URGENCY_LEVEL_LABELS[item.urgency] || { label: item.urgency || 'Thường', badge: 'bg-gray-100 text-gray-700' };

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedDispatch(item)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <td className="p-3.5 font-bold text-hepco-green whitespace-nowrap group-hover:underline">
                          {typeof item.code === 'object' ? (item.code.text || item.code.counter || 'CV') : String(item.code || '')}
                        </td>
                        <td className="p-3.5 min-w-[220px]">
                          <p className="font-semibold text-gray-900 line-clamp-2 group-hover:text-hepco-green transition-colors">{item.title}</p>
                          <span className="text-[10px] text-gray-400 mt-0.5 block whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold border ${typeLabel.bg} ${typeLabel.text} ${typeLabel.border || 'border-gray-200'}`}>
                            {typeLabel.label}
                          </span>
                        </td>
                        <td className="p-3.5 min-w-[200px]">
                          <p className="font-medium text-gray-900">{item.sender}</p>
                          <p className="text-[11px] text-gray-500">➡️ {item.receiver}</p>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold ${urgencyLabel.badge}`}>
                            {urgencyLabel.label}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold ${statusLabel.bg} ${statusLabel.text}`}>
                            {statusLabel.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {dispatchesMeta && (
            <Pagination meta={dispatchesMeta} onPageChange={setPage} />
          )}
        </div>
      )}

      {/* TAB 2: REQUESTS (Base Request) */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-b-xl rounded-t-none shadow-xs border border-gray-100 p-6 space-y-6">
          {isLoadingRequests ? (
            <Loading />
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Không có dữ liệu đề xuất trình ký</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-700 min-w-[850px]">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">Mã Đề Xuất</th>
                    <th className="p-3.5 min-w-[220px]">Tiêu đề tờ trình</th>
                    <th className="p-3.5 whitespace-nowrap">Danh mục</th>
                    <th className="p-3.5 whitespace-nowrap">Người trình ký</th>
                    <th className="p-3.5 whitespace-nowrap">Kinh phí/Số tiền</th>
                    <th className="p-3.5 whitespace-nowrap">Trạng thái phê duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((item) => {
                    const statusConfig = REQUEST_STATUS_LABELS[item.status] || { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700' };
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">{item.code}</td>
                        <td className="p-3.5 font-semibold text-gray-900 min-w-[220px]">{item.title}</td>
                        <td className="p-3.5 text-gray-600 whitespace-nowrap">{item.category}</td>
                        <td className="p-3.5 font-medium text-gray-900 whitespace-nowrap">{item.creator}</td>
                        <td className="p-3.5 font-bold text-hepco-orange whitespace-nowrap">{item.amount || '---'}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {requestsMeta && (
            <Pagination meta={requestsMeta} onPageChange={setPage} />
          )}
        </div>
      )}

      {/* TAB 3: TASKS (Base Wework) */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-b-xl rounded-t-none shadow-xs border border-gray-100 p-6 space-y-6">
          {isLoadingTasks ? (
            <Loading />
          ) : tasks.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Không có công việc nào</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-700 min-w-[800px]">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 min-w-[200px]">Tên công việc</th>
                    <th className="p-3.5 whitespace-nowrap">Dự án liên quan</th>
                    <th className="p-3.5 whitespace-nowrap">Người giao/Nhận</th>
                    <th className="p-3.5 whitespace-nowrap">Hạn hoàn thành</th>
                    <th className="p-3.5 whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-semibold text-gray-900 min-w-[200px]">{item.title}</td>
                      <td className="p-3.5 text-gray-600 whitespace-nowrap">{item.project}</td>
                      <td className="p-3.5 font-medium text-gray-900 whitespace-nowrap">{item.assignee}</td>
                      <td className="p-3.5 text-gray-600 whitespace-nowrap">{item.due_date}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700">
                          {item.status === 'in_progress' ? 'Đang thực hiện' : 'Mới giao'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
