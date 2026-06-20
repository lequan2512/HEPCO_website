import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import News from './pages/News';
import GenericPage from './pages/GenericPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { ROUTES } from './constants/routes';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.ABOUT} element={<About />} />
            <Route path={ROUTES.SERVICES} element={<Services />} />
            <Route path={ROUTES.NEWS} element={<News />} />
            <Route path={ROUTES.SHAREHOLDERS} element={<GenericPage title="Cổ đông" description="Thông tin dành cho cổ đông và nhà đầu tư." />} />

            {/* Admin Routes */}
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
