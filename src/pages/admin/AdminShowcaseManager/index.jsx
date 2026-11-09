import { useState } from 'react';
import { useFormik, getIn } from 'formik';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Layout,
  Tv,
  BarChart3,
  SlidersHorizontal,
  Compass,
  Award,
  MessageSquare,
  PhoneCall,
  HelpCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useShowcase } from '../../../apis/showcase';
import { saveShowcase } from '../../../services/showcase.service';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import ConfirmModal from '../../../components/ConfirmModal';
import ShowcaseImagePicker from './ShowcaseImagePicker';
import { ROUTES } from '../../../constants/routes';

const TABS = [
  { id: 'layout', label: 'Bố cục trang chủ', icon: Layout },
  { id: 'hero', label: 'Banner Hero & Video', icon: Tv },
  { id: 'stats', label: 'Số liệu thống kê', icon: BarChart3 },
  { id: 'utilities', label: 'Tiện ích công dân', icon: SlidersHorizontal },
  { id: 'showcase', label: 'Hoạt động trọng điểm', icon: Compass },
  { id: 'sectors', label: 'Lĩnh vực phục vụ', icon: Sparkles },
  { id: 'why', label: 'Năng lực & Thế mạnh', icon: Award },
  { id: 'testimonials', label: 'Đánh giá & Ý kiến', icon: MessageSquare },
  { id: 'cta', label: 'Banner Kêu gọi (CTA)', icon: PhoneCall },
  { id: 'faq', label: 'Câu hỏi thường gặp (FAQ)', icon: HelpCircle }
];

const AdminShowcaseManager = () => {
  const cache = useQueryClient();
  const { data, isLoading, isError, refetch } = useShowcase();
  const [activeTab, setActiveTab] = useState('layout');
  const [uploading, setUploading] = useState(false);
  const [reloadConfirm, setReloadConfirm] = useState(false);
  const [reloading, setReloading] = useState(false);

  const initialData = data?.data || {};
  const version = data?.version || 1;

  const form = useFormik({
    initialValues: {
      title: initialData.title || 'Hoạt Động & Dự Án Trọng Điểm',
      description: initialData.description || '',
      linkLabel: initialData.linkLabel || 'Thư Viện Hình Ảnh & Hoạt Động',
      href: initialData.href || '/tin-tuc?tab=gallery',
      sections: initialData.sections || [],
      hero: initialData.hero || {
        headlinePrefix: 'CÔNG TY CỔ PHẦN MÔI TRƯỜNG',
        headlineHighlight: 'VÀ CÔNG TRÌNH ĐÔ THỊ HUẾ',
        subtitle: '',
        primaryCtaText: 'Khám Phá Dịch Vụ',
        primaryCtaLink: '/dich-vu',
        hotlineDisplay: '1900.96.96.69',
        hotlineTel: '1900969669',
        coverImage: '/uploads/images/TongQuan_6a06c09d.jpg',
        videoUrl: 'https://www.youtube.com/embed/P7RZLoytEBI?autoplay=1',
        videoButtonText: 'Xem Phim Giới Thiệu'
      },
      stats: initialData.stats || [],
      utilities: initialData.utilities || [],
      items: initialData.items || [],
      sectors: initialData.sectors || { title: '', subtitle: '', items: [] },
      why: initialData.why || { title: '', subtitle: '', items: [] },
      testimonials: initialData.testimonials || { title: '', subtitle: '', items: [] },
      cta: initialData.cta || { title: '', subtitle: '', buttonText: '', hotlineDisplay: '', hotlineTel: '' },
      faq: initialData.faq || { title: '', subtitle: '', items: [] }
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const result = await saveShowcase(values, version);
        cache.setQueryData(['home-showcase'], result);
        toast.success('Đã lưu toàn bộ cấu hình trang chủ thành công lên máy chủ!');
      } catch (error) {
        toast.error(getErrorMessage(error?.response?.data?.errorCode) || 'Lỗi khi lưu dữ liệu');
      }
    }
  });

  if (isLoading) return <Loading fullScreen message="Đang tải dữ liệu trang chủ..." />;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Lỗi tải dữ liệu máy chủ</div>;

  const busy = form.isSubmitting || uploading || reloading;

  const move = (from, offset, target = 'items') => {
    const next = [...(form.values[target] || [])];
    const [item] = next.splice(from, 1);
    next.splice(from + offset, 0, item);
    form.setFieldValue(target, next);
  };

  const renderInput = (path, label, isArea = false, placeholder = '') => {
    const value = getIn(form.values, path) ?? '';
    return (
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">{label}</label>
        {isArea ? (
          <textarea
            name={path}
            value={value}
            onChange={form.handleChange}
            rows={3}
            disabled={busy}
            placeholder={placeholder}
            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        ) : (
          <input
            type="text"
            name={path}
            value={value}
            onChange={form.handleChange}
            disabled={busy}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <form onSubmit={form.handleSubmit} className="space-y-6">
        {/* Sticky Action Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-2">
              <span>Quản Lý Nội Dung Toàn Bộ Trang Chủ</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                v{version}
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Chỉnh sửa trực tiếp tất cả các phần trên màn hình chính và lưu vào cơ sở dữ liệu
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => (form.dirty ? setReloadConfirm(true) : refetch())}
              disabled={busy}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
              <span>Tải lại</span>
            </button>

            <a
              href={ROUTES.HOME}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Xem trang chủ</span>
            </a>

            <button
              type="submit"
              disabled={busy || !form.dirty}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{form.isSubmitting ? 'Đang lưu lên máy chủ...' : 'Lưu tất cả thay đổi'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white p-2 rounded-2xl shadow-xs border border-gray-200/80 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#10243b] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Layout & Sections */}
        {activeTab === 'layout' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Thứ tự & Bật/Tắt các khối trên Trang chủ</h2>
              <p className="text-xs text-gray-500">Tích chọn để hiển thị hoặc bỏ tích để ẩn khối tương ứng.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {form.values.sections.map(({ id, visible, label }, index) => (
                <div key={id} className="flex items-center justify-between gap-3 py-3">
                  <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => form.setFieldValue(`sections[${index}].visible`, e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{label || id}</span>
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, -1, 'sections')}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      title="Đưa lên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === form.values.sections.length - 1}
                      onClick={() => move(index, 1, 'sections')}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      title="Đưa xuống"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Hero Banner */}
        {activeTab === 'hero' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-800">Cấu hình Banner Hero & Video</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {renderInput('hero.headlinePrefix', 'Tiêu đề chính')}
              {renderInput('hero.headlineHighlight', 'Cụm từ nổi bật (chữ màu xanh)')}
            </div>
            {renderInput('hero.subtitle', 'Đoạn giới thiệu ngắn', true)}
            <div className="grid sm:grid-cols-2 gap-4">
              {renderInput('hero.primaryCtaText', 'Chữ trên nút khám phá')}
              {renderInput('hero.primaryCtaLink', 'Đường dẫn nút khám phá')}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {renderInput('hero.hotlineDisplay', 'Hotline hiển thị')}
              {renderInput('hero.hotlineTel', 'Hotline gọi (số liền)')}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {renderInput('hero.videoUrl', 'Đường dẫn nhúng Video (YouTube Embed)')}
              {renderInput('hero.videoButtonText', 'Chữ trên nút mở video')}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Ảnh bìa Hero</label>
              <ShowcaseImagePicker
                name="hero-cover"
                value={form.values.hero.coverImage}
                onChange={(url) => form.setFieldValue('hero.coverImage', url)}
                onBusyChange={setUploading}
                disabled={busy}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Stats */}
        {activeTab === 'stats' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-800">4 Chỉ số Thống kê Nổi bật</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {form.values.stats.map((st, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Chỉ số #{idx + 1}</span>
                  {renderInput(`stats[${idx}].value`, 'Số liệu (Ví dụ: 50+, 100K+)')}
                  {renderInput(`stats[${idx}].label`, 'Nhãn tiêu đề')}
                  {renderInput(`stats[${idx}].description`, 'Mô tả chi tiết', true)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Utilities */}
        {activeTab === 'utilities' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-800">4 Thẻ Tiện ích & Dịch vụ Nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {form.values.utilities.map((u, idx) => (
                <div key={u.id || idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Tiện ích #{idx + 1}</span>
                  {renderInput(`utilities[${idx}].title`, 'Tiêu đề thẻ')}
                  {renderInput(`utilities[${idx}].subtitle`, 'Mô tả ngắn', true)}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {renderInput(`utilities[${idx}].buttonText`, 'Chữ trên nút')}
                    {renderInput(`utilities[${idx}].badge`, 'Nhãn badge')}
                  </div>
                  {renderInput(`utilities[${idx}].link`, 'Đường dẫn liên kết')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Showcase (Hoạt động trọng điểm) */}
        {activeTab === 'showcase' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Tiêu đề & Giới thiệu khối Hoạt động trọng điểm</h2>
              {renderInput('title', 'Tiêu đề khối')}
              {renderInput('description', 'Mô tả khối', true)}
              <div className="grid sm:grid-cols-2 gap-4">
                {renderInput('linkLabel', 'Chữ trên nút thư viện')}
                {renderInput('href', 'Đường dẫn thư viện')}
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h2 className="text-lg font-bold text-gray-800">Các thẻ hoạt động ({form.values.items.length}/6)</h2>
                <button
                  type="button"
                  disabled={form.values.items.length >= 6}
                  onClick={() =>
                    form.setFieldValue('items', [
                      ...form.values.items,
                      {
                        id: crypto.randomUUID(),
                        title: 'Hoạt động mới 2026',
                        subtitle: '',
                        location: 'TP. Huế',
                        scale: 'Quy mô hoạt động',
                        image: '/uploads/images/TongQuan_6a06c09d.jpg',
                        href: '/tin-tuc?tab=gallery',
                        linkLabel: 'Xem thư viện ảnh'
                      }
                    ])
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Thêm thẻ
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {form.values.items.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex flex-col">
                    <div className="p-3 bg-white flex items-center justify-between gap-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => move(index, -1, 'items')}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === form.values.items.length - 1}
                          onClick={() => move(index, 1, 'items')}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={form.values.items.length <= 1}
                          onClick={() => {
                            const next = [...form.values.items];
                            next.splice(index, 1);
                            form.setFieldValue('items', next);
                          }}
                          className="p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 space-y-4">
                      <ShowcaseImagePicker
                        name={`showcase-${item.id}`}
                        value={item.image}
                        onChange={(url) => form.setFieldValue(`items[${index}].image`, url)}
                        onBusyChange={setUploading}
                        disabled={busy}
                      />
                      {renderInput(`items[${index}].title`, 'Tiêu đề thẻ')}
                      {renderInput(`items[${index}].subtitle`, 'Phụ đề ảnh', true)}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {renderInput(`items[${index}].location`, 'Địa điểm')}
                        {renderInput(`items[${index}].scale`, 'Quy mô / số lượng')}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {renderInput(`items[${index}].linkLabel`, 'Chữ trên liên kết')}
                        {renderInput(`items[${index}].href`, 'Đường dẫn liên kết')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Sectors */}
        {activeTab === 'sectors' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-800">Lĩnh Vực Hoạt Động & Phục Vụ</h2>
            {renderInput('sectors.title', 'Tiêu đề khối')}
            {renderInput('sectors.subtitle', 'Mô tả khối', true)}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
              {(form.values.sectors.items || []).map((sec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Lĩnh vực #{idx + 1}</span>
                  {renderInput(`sectors.items[${idx}].title`, 'Tên lĩnh vực')}
                  {renderInput(`sectors.items[${idx}].subtitle`, 'Tiêu đề phụ')}
                  {renderInput(`sectors.items[${idx}].tag`, 'Nhãn tag')}
                  {renderInput(`sectors.items[${idx}].description`, 'Mô tả chi tiết', true)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Why Choose Us */}
        {activeTab === 'why' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-800">Năng Lực & Vì Sao Chọn HEPCO</h2>
            {renderInput('why.title', 'Tiêu đề khối')}
            {renderInput('why.subtitle', 'Mô tả khối', true)}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
              {(form.values.why.items || []).map((w, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Thế mạnh #{idx + 1}</span>
                  {renderInput(`why.items[${idx}].title`, 'Tiêu đề thế mạnh')}
                  {renderInput(`why.items[${idx}].badge`, 'Nhãn badge')}
                  {renderInput(`why.items[${idx}].description`, 'Mô tả chi tiết', true)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Testimonials */}
        {activeTab === 'testimonials' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-800">Đánh Giá & Nhận Xét Của Khách Hàng</h2>
            {renderInput('testimonials.title', 'Tiêu đề khối')}
            {renderInput('testimonials.subtitle', 'Mô tả khối', true)}
            <div className="space-y-4 pt-3">
              {(form.values.testimonials.items || []).map((t, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Đánh giá #{idx + 1}</span>
                  {renderInput(`testimonials.items[${idx}].content`, 'Nội dung nhận xét', true)}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {renderInput(`testimonials.items[${idx}].author`, 'Người đánh giá')}
                    {renderInput(`testimonials.items[${idx}].role`, 'Chức vụ / Đơn vị')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: CTA Banner */}
        {activeTab === 'cta' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-800">Banner Kêu Gọi Hành Động (CTA)</h2>
            {renderInput('cta.title', 'Tiêu đề banner')}
            {renderInput('cta.subtitle', 'Mô tả ngắn', true)}
            <div className="grid sm:grid-cols-3 gap-4">
              {renderInput('cta.buttonText', 'Chữ trên nút bấm')}
              {renderInput('cta.hotlineDisplay', 'Hotline hiển thị')}
              {renderInput('cta.hotlineTel', 'Hotline gọi (số liền)')}
            </div>
          </div>
        )}

        {/* Tab 10: FAQ */}
        {activeTab === 'faq' && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Câu Hỏi Thường Gặp (FAQ)</h2>
                <p className="text-xs text-gray-500">Quản lý các câu hỏi và giải đáp hiển thị trên trang chủ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  form.setFieldValue('faq.items', [
                    ...(form.values.faq.items || []),
                    { question: 'Câu hỏi mới?', answer: 'Câu trả lời giải đáp chi tiết...' }
                  ])
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm câu hỏi
              </button>
            </div>
            {renderInput('faq.title', 'Tiêu đề khối FAQ')}
            {renderInput('faq.subtitle', 'Mô tả khối FAQ', true)}

            <div className="space-y-4 pt-3">
              {(form.values.faq.items || []).map((faqItem, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 uppercase">Câu hỏi #{idx + 1}</span>
                    <button
                      type="button"
                      disabled={(form.values.faq.items || []).length <= 1}
                      onClick={() => {
                        const next = [...(form.values.faq.items || [])];
                        next.splice(idx, 1);
                        form.setFieldValue('faq.items', next);
                      }}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {renderInput(`faq.items[${idx}].question`, 'Câu hỏi')}
                  {renderInput(`faq.items[${idx}].answer`, 'Câu trả lời', true)}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <ConfirmModal
        isOpen={reloadConfirm}
        title="Hủy các thay đổi chưa lưu?"
        message="Bạn có thay đổi chưa lưu lên máy chủ. Việc tải lại sẽ làm mất các nội dung này."
        confirmText="Tải lại ngay"
        onConfirm={async () => {
          setReloading(true);
          try {
            await refetch();
          } finally {
            setReloading(false);
            setReloadConfirm(false);
          }
        }}
        onCancel={() => setReloadConfirm(false)}
      />
    </div>
  );
};

export default AdminShowcaseManager;
