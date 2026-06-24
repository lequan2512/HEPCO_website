import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { FileText, Shield, LogOut, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { ROUTES } from '../../constants/routes';

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
          <img src="/images/logo.png" alt="HEPCO" className="h-10 bg-white p-1 rounded" />
          <button className="lg:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
             <div className="w-8 h-8 bg-hepco-green text-white rounded-full flex items-center justify-center font-bold text-sm">A</div>
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
