import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { FileText, Shield, LogOut, Menu, X, Laptop, Users, Building2, ClipboardList } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { ROUTES } from '../../constants/routes';
import logo from '../../assets/images/logo.png';

const AdminLayout = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.ADMIN_LOGIN);
    }
  }, [isAuthenticated, navigate]);


  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans w-full overflow-hidden relative">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-hepco-green text-white flex flex-col shadow-lg z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-green-800 flex items-center justify-between lg:justify-center">
          <img src={logo} alt="HEPCO" className="h-10 bg-white p-1 rounded" />
          <button className="lg:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Nhóm 1: Quản lý trang chủ */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-4 px-4">
            Quản lý trang chủ
          </div>
          <Link 
            to={ROUTES.ADMIN_NEWS} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === ROUTES.ADMIN_NEWS || location.pathname === ROUTES.ADMIN_DASHBOARD
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Tin Tức</span>
          </Link>
          <Link 
            to={ROUTES.ADMIN_SHAREHOLDERS} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === ROUTES.ADMIN_SHAREHOLDERS
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Cổ Đông</span>
          </Link>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/services`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('/services')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Dịch Vụ</span>
          </Link>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/banners`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('/banners')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Hình Ảnh (Slider)</span>
          </Link>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/ip-whitelist`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('ip-whitelist')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>IP Whitelist</span>
          </Link>

          {/* Nhóm 2: Quản lý thiết bị */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-8 px-4 border-t border-green-800 pt-6">
            Quản lý thiết bị
          </div>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/devices`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('devices')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span>Thiết Bị</span>
          </Link>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/suppliers`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('suppliers')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Nhà Cung Cấp</span>
          </Link>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/assignments`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('assignments')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Cấp Phát</span>
          </Link>

          {/* Nhóm 3: Quản lý nhân sự */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-8 px-4 border-t border-green-800 pt-6">
            Quản lý nhân sự
          </div>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/employees`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('employees')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Danh Sách Nhân Sự</span>
          </Link>
          <Link 
            to={`${ROUTES.ADMIN_DASHBOARD}/departments`} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('departments')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Phòng Ban</span>
          </Link>
          
          {/* Nhóm 4: Tiện ích */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-8 px-4 border-t border-green-800 pt-6">
            Tiện ích
          </div>
          <Link 
            to={ROUTES.ADMIN_FUEL} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.includes('fuel-comparison')
                ? 'bg-green-800 text-white font-semibold' 
                : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Đối Chiếu Xăng Dầu</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-green-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-300 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 lg:ml-0 relative w-full">
        {/* Topbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200 z-10 shrink-0">
          <div className="flex items-center gap-3 text-gray-500">
            <button className="lg:hidden p-1 rounded-md hover:bg-gray-100" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <span className="font-medium text-sm hidden sm:block">Hệ thống Quản trị HEPCO</span>
          </div>
          <div className="flex items-center gap-3">
             <img src={logo} alt="Admin" className="w-8 h-8 bg-gray-100 rounded-full border border-gray-200 p-0.5 object-contain" />
             <span className="text-sm font-semibold text-gray-700">Admin</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
