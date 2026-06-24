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
import AdminNewsManager from './pages/admin/AdminNewsManager';
import AdminIpWhitelist from './pages/admin/AdminIpWhitelist';
import { ROUTES } from './constants/routes';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');
  const isLoginRoute = location.pathname === ROUTES.ADMIN_LOGIN;

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<Navigate to="news" replace />} />
          <Route path="news" element={<AdminNewsManager type="news" />} />
          <Route path="shareholders" element={<AdminNewsManager type="shareholders" />} />
          <Route path="services" element={<AdminNewsManager type="service" />} />
          <Route path="ip-whitelist" element={<AdminIpWhitelist />} />
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
