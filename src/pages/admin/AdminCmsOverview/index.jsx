import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Newspaper,
  TrendingUp,
  Wrench,
  Image as ImageIcon,
  Building2,
  Sliders,
  Plus,
  ExternalLink,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '../../../constants/routes';
import {
  getCmsOverviewCounts,
  exportCmsDataJson,
  importCmsDataJson,
  resetLocalOverrides
} from '../../../services/news.service';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminCmsOverview = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [, setRefreshTick] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);

  const counts = getCmsOverviewCounts();

  const modules = [
    {
      title: 'Tin Tức & Thông Báo',
      count: counts.newsCount,
      unit: 'bài viết',
      description: 'Quản lý tin hoạt động công ty, sự kiện, môi trường, thông báo, đoàn thể và sản xuất kinh doanh.',
      icon: Newspaper,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      route: ROUTES.ADMIN_NEWS,
      publicRoute: ROUTES.NEWS
    },
    {
      title: 'Quan Hệ Cổ Đông',
      count: counts.shareholdersCount,
      unit: 'tài liệu',
      description: 'Quản lý báo cáo tài chính, báo cáo thường niên, nghị quyết HĐQT, ĐHĐCĐ, cổ tức và tài liệu PDF.',
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      route: ROUTES.ADMIN_SHAREHOLDERS,
      publicRoute: ROUTES.SHAREHOLDERS
    },
    {
      title: 'Mục Giới Thiệu',
      count: counts.aboutCount + 4,
      unit: 'phân mục',
      description: 'Cập nhật Thư ngỏ, Lịch sử hình thành, Chức năng nhiệm vụ, Giấy phép môi trường, Sơ đồ tổ chức & Hồ sơ năng lực.',
      icon: Building2,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      route: ROUTES.ADMIN_ABOUT,
      publicRoute: ROUTES.ABOUT
    },
    {
      title: 'Dịch Vụ Công Ty',
      count: counts.servicesCount,
      unit: 'lĩnh vực',
      description: 'Cập nhật nội dung chi tiết các dịch vụ vệ sinh môi trường, chất thải nguy hại, xây dựng và chiếu sáng.',
      icon: Wrench,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      route: ROUTES.ADMIN_SERVICES,
      publicRoute: ROUTES.SERVICES
    },
    {
      title: 'Thư Viện Hình Ảnh',
      count: counts.galleryCount,
      unit: 'hình ảnh',
      description: 'Quản lý kho ảnh thực tế theo chủ đề: hoạt động công ty, môi trường, phương tiện thiết bị, công trình.',
      icon: ImageIcon,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      route: ROUTES.ADMIN_GALLERY,
      publicRoute: `${ROUTES.NEWS}?tab=gallery`
    },
    {
      title: 'Banner & Hero Trang Chủ',
      count: counts.bannersCount,
      unit: 'banner',
      description: 'Thay đổi ảnh bìa chính (Hero), video giới thiệu, tiêu đề trang chủ và danh sách ảnh Slider hoạt động.',
      icon: Sliders,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      route: ROUTES.ADMIN_BANNERS,
      publicRoute: ROUTES.HOME
    }
  ];

  const handleExportJson = () => {
    try {
      const jsonStr = exportCmsDataJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hepco-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Đã xuất tệp sao lưu dữ liệu CMS!');
    } catch {
      toast.error('Không thể xuất dữ liệu');
    }
  };

  const handleImportJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importCmsDataJson(text);
      queryClient.invalidateQueries();
      setRefreshTick((t) => t + 1);
      toast.success('Đã khôi phục dữ liệu CMS từ tệp sao lưu!');
    } catch {
      toast.error('Tệp JSON không hợp lệ!');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetDefaults = () => {
    resetLocalOverrides();
    queryClient.invalidateQueries();
    setRefreshTick((t) => t + 1);
    setConfirmReset(false);
    toast.success('Đã khôi phục dữ liệu mặc định từ hệ thống gốc!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#10243b] via-emerald-900 to-hepco-green rounded-2xl p-5 sm:p-7 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-emerald-200 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Trung tâm Quản trị Nội dung Website HEPCO
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
            Quản trị Toàn diện Nội dung &amp; Giao diện Website
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 max-w-2xl">
            Thêm bài viết mới, đăng tải báo cáo cổ đông PDF, cập nhật trang Giới thiệu, Dịch vụ, Thư viện hình ảnh và Banner trang chủ dễ dàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to={ROUTES.HOME}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#10243b] hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <ExternalLink className="w-4 h-4 text-hepco-green" />
            <span>Mở xem Website</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_NEWS)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hepco-orange hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng Tin tức mới</span>
          </button>
        </div>
      </div>

      {/* 6 CMS Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md border border-gray-200/80 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${mod.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-[#10243b]">
                      {mod.count}
                    </span>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {mod.unit}
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1.5">
                  {mod.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-5">
                  {mod.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate(mod.route)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-hepco-green hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Quản lý mục này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  to={mod.publicRoute}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                  title="Xem trang hiển thị thực tế"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem trang</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backup / Restore / Reset CMS Data Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-gray-900">
            Sao lưu &amp; Đồng bộ Dữ liệu Quản trị (CMS Backup)
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Xuất các chỉnh sửa ra tệp JSON để lưu trữ hoặc nhập lại bất kỳ lúc nào.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất bản sao lưu (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập dữ liệu (.JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleImportJson}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục gốc</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmReset}
        title="Khôi phục dữ liệu gốc"
        message="Bạn có chắc chắn muốn đặt lại các chỉnh sửa tạm thời về trạng thái dữ liệu chuẩn ban đầu?"
        onConfirm={handleResetDefaults}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
};

export default AdminCmsOverview;
