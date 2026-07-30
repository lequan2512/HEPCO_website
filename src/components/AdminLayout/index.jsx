import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { FileText, Shield, LogOut, Menu, X, Laptop, Users, Building2, ClipboardList, Briefcase, CreditCard, UserCheck, ChevronDown } from 'lucide-react';

import useAuthStore from '../../store/useAuthStore';
import { ROUTES } from '../../constants/routes';
import logo from '../../assets/images/logo.png';

const AdminLayout = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.ADMIN_LOGIN);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#user-profile-menu')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



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
        <div className="p-4 lg:p-6 border-b border-green-800 flex items-center justify-between lg:justify-center">
          <img src={logo} alt="HEPCO" className="h-10 bg-white p-1 rounded" />
          <button className="lg:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto custom-scrollbar">

          {/* Nhóm 1: Quản lý trang chủ */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-4 px-4">
            Quản lý trang chủ
          </div>
          <Link
            to={ROUTES.ADMIN_NEWS}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === ROUTES.ADMIN_NEWS || location.pathname === ROUTES.ADMIN_DASHBOARD
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === ROUTES.ADMIN_SHAREHOLDERS
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span>Quan Hệ Cổ Đông</span>
          </Link>
          <Link
            to={`${ROUTES.ADMIN_DASHBOARD}/services`}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('/services')
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('/banners')
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span>Hình Ảnh (Slider)</span>
          </Link>


          {/* Nhóm 2: Quản lý thiết bị văn phòng */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-8 px-4 border-t border-green-800 pt-6">
            Quản lý thiết bị
          </div>
          <Link
            to={`${ROUTES.ADMIN_DASHBOARD}/devices`}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.endsWith('/devices')
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <Laptop className="w-5 h-5" />
            <span>Thiết Bị PC</span>
          </Link>
          <Link
            to={`${ROUTES.ADMIN_DASHBOARD}/suppliers`}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('suppliers')
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('assignments')
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Cấp Phát PC</span>
          </Link>

          {/* Nhóm 3: Quản lý xí nghiệp */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-8 px-4 border-t border-green-800 pt-6">
            Quản lý xí nghiệp
          </div>
          <Link
            to={ROUTES.ADMIN_POS}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === ROUTES.ADMIN_POS
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Máy POS</span>
          </Link>


          {/* Nhóm 4: Quản lý nhân sự */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-8 px-4 border-t border-green-800 pt-6">
            Quản lý nhân sự
          </div>
          <Link
            to={`${ROUTES.ADMIN_DASHBOARD}/employees`}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('employees') && !location.pathname.includes('pos-employees')
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <Users className="w-5 h-5" />
            <span>NV Văn Phòng</span>
          </Link>
          <Link
            to={ROUTES.ADMIN_POS_EMPLOYEES}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('pos-employees')
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>NV Xí Nghiệp</span>
          </Link>
          <Link
            to={`${ROUTES.ADMIN_DASHBOARD}/departments`}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('departments')
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('fuel-comparison')
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span>Đối Chiếu Xăng Dầu</span>
          </Link>

          {/* Nhóm 5: Hệ thống Base.vn */}
          <div className="text-xs uppercase font-bold text-green-300 tracking-wider mb-2 mt-8 px-4 border-t border-green-800 pt-6">
            Hệ thống Base.vn
          </div>
          <Link
            to={ROUTES.ADMIN_BASE_OFFICE}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('base-office')
              ? 'bg-green-800 text-white font-semibold'
              : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Base Office</span>
          </Link>
        </nav>
      </aside>


      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 lg:ml-0 relative w-full">
        {/* Topbar */}
        <header className="bg-white shadow-sm h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-8 border-b border-gray-200 z-10 shrink-0">
          <div className="flex items-center gap-3 text-gray-500">
            <button className="lg:hidden p-1 rounded-md hover:bg-gray-100" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <span className="font-medium text-sm hidden sm:block">Hệ thống Quản trị HEPCO</span>
          </div>
          <div className="relative" id="user-profile-menu">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <img src={logo} alt="Admin" className="w-8 h-8 bg-white rounded-full border border-gray-200 p-0.5 object-contain shadow-sm" />
              <span className="text-sm font-semibold text-gray-700">Admin</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popup Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                <div className="py-1">
                  <Link
                    to={`${ROUTES.ADMIN_DASHBOARD}/ip-whitelist`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-hepco-green transition-colors"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Quản lý IP Whitelist</span>
                  </Link>
                </div>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

        </header>

        {/* Content Area */}
        <div className="flex-2 overflow-y-auto p-3 sm:p-5 lg:p-5 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
