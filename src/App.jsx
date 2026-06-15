import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import GenericPage from './pages/GenericPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gioi-thieu" element={<About />} />
            <Route path="/dich-vu" element={<Services />} />
            <Route path="/tin-tuc" element={<GenericPage title="Tin tức" description="Cập nhật những thông tin mới nhất về hoạt động của HEPCO." />} />
            <Route path="/du-an" element={<GenericPage title="Dự án" description="Các dự án trọng điểm HEPCO đã và đang thực hiện." />} />
            <Route path="/co-dong" element={<GenericPage title="Cổ đông" description="Thông tin dành cho cổ đông và nhà đầu tư." />} />
            <Route path="/cau-hoi" element={<GenericPage title="Câu hỏi" description="Giải đáp các thắc mắc thường gặp của khách hàng." />} />
            <Route path="/lien-he" element={<GenericPage title="Liên hệ" description="Thông tin liên hệ và biểu mẫu phản hồi." />} />
            <Route path="/hoa-don" element={<GenericPage title="Hóa đơn" description="Tra cứu thông tin hóa đơn điện tử." />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
