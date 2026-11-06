import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/user/Home';
import About from './pages/user/About';
import Services from './pages/user/Services';
import News from './pages/user/News';
import ArticleDetail from './pages/user/ArticleDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminCmsOverview from './pages/admin/AdminCmsOverview';
import AdminNewsManager from './pages/admin/AdminNewsManager';
import AdminAboutManager from './pages/admin/AdminAboutManager';
import AdminGalleryManager from './pages/admin/AdminGalleryManager';
import AdminIpWhitelist from './pages/admin/AdminIpWhitelist';
import AdminBannerManager from './pages/admin/AdminBannerManager';
import AdminDeviceManager from './pages/admin/AdminDeviceManager';
import AdminEmployeeManager from './pages/admin/AdminEmployeeManager';
import AdminSupplierManager from './pages/admin/AdminSupplierManager';
import AdminAssignmentManager from './pages/admin/AdminAssignmentManager';
import AdminDepartmentManager from './pages/admin/AdminDepartmentManager';
import AdminFuelComparison from './pages/admin/AdminFuelComparison';
import AdminBaseOffice from './pages/admin/AdminBaseOffice';
import AdminPosManager from './pages/admin/AdminPosManager';
import AdminPosEmployeeManager from './pages/admin/AdminPosEmployeeManager';
import AdminPosPaperManager from './pages/admin/AdminPosPaperManager';
import { ROUTES } from './constants/routes';

import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  }
});

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith('/admin-dashboard') || location.pathname === ROUTES.ADMIN;
  const isLoginRoute = location.pathname === ROUTES.ADMIN_LOGIN;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_OVERVIEW} replace />} />
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminCmsOverview />} />
          <Route path="news" element={<AdminNewsManager type="news" />} />
          <Route path="shareholders" element={<AdminNewsManager type="shareholders" />} />
          <Route path="about" element={<AdminAboutManager />} />
          <Route path="services" element={<AdminNewsManager type="service" />} />
          <Route path="gallery" element={<AdminGalleryManager />} />
          <Route path="banners" element={<AdminBannerManager />} />
          <Route path="ip-whitelist" element={<AdminIpWhitelist />} />
          <Route path="devices" element={<AdminDeviceManager />} />
          <Route path="employees" element={<AdminEmployeeManager />} />
          <Route path="departments" element={<AdminDepartmentManager />} />
          <Route path="suppliers" element={<AdminSupplierManager />} />
          <Route path="assignments" element={<AdminAssignmentManager />} />
          <Route path="fuel-comparison" element={<AdminFuelComparison />} />
          <Route path="base-office" element={<AdminBaseOffice />} />
          <Route path="pos" element={<AdminPosManager />} />
          <Route path="pos-employees" element={<AdminPosEmployeeManager />} />
          <Route path="pos-paper" element={<AdminPosPaperManager />} />
        </Route>
      </Routes>
    );
  }

  if (isLoginRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Routes>
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.SERVICES} element={<Services />} />
          <Route path={ROUTES.NEWS} element={<News pageType="news" />} />
          <Route path={ROUTES.SHAREHOLDERS} element={<News pageType="shareholders" />} />
          <Route path={ROUTES.ARTICLE_DETAIL} element={<ArticleDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
