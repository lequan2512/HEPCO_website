import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Save,
  Sliders,
  Video,
  Upload,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetBanners, useUploadBanner, useDeleteBanner } from '../../../apis/banner';
import { useUploadImage } from '../../../apis/upload';
import {
  getHeroSettings,
  updateHeroSettings,
  reorderBannerItems
} from '../../../services/news.service';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import { ROUTES } from '../../../constants/routes';
import Loading from '../../../components/Loading';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminBannerManager = () => {
  const [activeTab, setActiveTab] = useState('slider'); // 'slider' | 'hero'
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const heroCoverRef = useRef(null);

  const { data: bannersRes, isLoading } = useGetBanners();
  const banners = bannersRes?.data || [];
  const uploadBannerMutation = useUploadBanner();
  const deleteBannerMutation = useDeleteBanner();
  const uploadImageMutation = useUploadImage();

  const initialHero = getHeroSettings();

  const heroFormik = useFormik({
    initialValues: initialHero,
    enableReinitialize: true,
    validationSchema: Yup.object({
      headlinePrefix: Yup.string().required('Vui lòng nhập tiêu đề chính'),
      headlineHighlight: Yup.string().required('Vui lòng nhập cụm từ nổi bật'),
      subtitle: Yup.string().required('Vui lòng nhập đoạn giới thiệu ngắn')
    }),
    onSubmit: (values) => {
      updateHeroSettings(values);
      toast.success('Đã lưu cấu hình Banner Hero & Video Trang chủ!');
    }
  });

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'upload_banner' });
      await uploadBannerMutation.mutateAsync(formData);
      toast.success('Thêm ảnh vào Slider thành công!', { id: 'upload_banner' });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    } catch {
      toast.error('Lỗi tải ảnh lên', { id: 'upload_banner' });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddByUrl = async () => {
    if (!newBannerUrl.trim()) {
      toast.error('Vui lòng nhập đường dẫn hình ảnh');
      return;
    }
    try {
      await uploadBannerMutation.mutateAsync(newBannerUrl.trim());
      setNewBannerUrl('');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Đã thêm hình ảnh vào Slider!');
    } catch {
      toast.error('Không thể thêm hình ảnh');
    }
  };

  const handleMoveBanner = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;
    const nextList = [...banners];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIdx, 0, moved);
    await reorderBannerItems(nextList);
    queryClient.invalidateQueries({ queryKey: ['banners'] });
    toast.success('Đã cập nhật thứ tự hiển thị!');
  };

  const handleDelete = (bannerUrl) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Hình Ảnh Slider',
      message: 'Bạn có chắc chắn muốn xóa hình ảnh này khỏi Slider trang chủ?',
      onConfirm: async () => {
        try {
          toast.loading('Đang xóa hình ảnh...', { id: 'delete_banner' });
          await deleteBannerMutation.mutateAsync(bannerUrl);
          toast.success('Xóa hình ảnh thành công!', { id: 'delete_banner' });
          queryClient.invalidateQueries({ queryKey: ['banners'] });
        } catch {
          toast.error('Lỗi xóa hình ảnh', { id: 'delete_banner' });
        }
      }
    });
  };

  const handleUploadHeroCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      toast.loading('Đang tải ảnh bìa Hero...', { id: 'hero_cover' });
      const res = await uploadImageMutation.mutateAsync(formData);
      if (res.success) {
        heroFormik.setFieldValue('coverImage', res.url);
        toast.success('Đã cập nhật ảnh bìa Hero! Nhấn Lưu cấu hình để áp dụng.', {
          id: 'hero_cover'
        });
      }
    } catch {
      toast.error('Lỗi tải ảnh bìa', { id: 'hero_cover' });
    } finally {
      if (heroCoverRef.current) heroCoverRef.current.value = '';
    }
  };

  return (
    <div className="w-full relative space-y-6">
      {(uploadBannerMutation.isPending ||
        deleteBannerMutation.isPending ||
        uploadImageMutation.isPending) && <Loading fullScreen message="Đang xử lý..." />}

      {/* Top Header & Tab Switcher */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">
            Quản lý Banner, Slider &amp; Hero Trang Chủ
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Tùy chỉnh khối Hero đầu trang chủ, video giới thiệu và danh sách hình ảnh Slider hoạt động.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('slider')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'slider'
                  ? 'bg-white text-hepco-green shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Slider Hoạt Động ({banners.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-white text-hepco-green shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Banner Hero &amp; Video</span>
            </button>
          </div>

          <Link
            to={ROUTES.HOME}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-hepco-green border border-emerald-200 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Trang chủ</span>
          </Link>
        </div>
      </div>

      {activeTab === 'slider' ? (
        <div className="space-y-5">
          {/* Add New Banner Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder="Dán đường dẫn ảnh (/uploads/images/... hoặc https://...)"
                value={newBannerUrl}
                onChange={(e) => setNewBannerUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-hepco-green outline-none"
              />
              <button
                type="button"
                onClick={handleAddByUrl}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                Thêm từ URL
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-hepco-green text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tải Ảnh Từ Máy Tính</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleUploadFile}
            />
          </div>

          {/* Banners Grid */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden p-5 sm:p-6 min-h-[300px] flex flex-col justify-center">
            {isLoading ? (
              <Loading />
            ) : banners.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {banners.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-gray-50 flex flex-col"
                  >
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                      <img
                        src={resolveAssetUrl(url)}
                        alt={`Slide ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/cover.png';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-extrabold">
                        Slide #{index + 1}
                      </span>
                    </div>

                    <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveBanner(index, 'up')}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                          title="Chuyển lên trước"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === banners.length - 1}
                          onClick={() => handleMoveBanner(index, 'down')}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                          title="Chuyển xuống sau"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(url)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Chưa có hình ảnh nào</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Vui lòng tải lên hình ảnh mới để hiển thị ngoài trang chủ.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Hero Banner & Video Configuration */
        <form
          onSubmit={heroFormik.handleSubmit}
          className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-7 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Tiêu đề chính (Dòng 1)
              </label>
              <input
                type="text"
                name="headlinePrefix"
                value={heroFormik.values.headlinePrefix}
                onChange={heroFormik.handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Cụm từ nổi bật (Màu xanh lá)
              </label>
              <input
                type="text"
                name="headlineHighlight"
                value={heroFormik.values.headlineHighlight}
                onChange={heroFormik.handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-hepco-green outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Mô tả giới thiệu ngắn dưới tiêu đề
            </label>
            <textarea
              rows={3}
              name="subtitle"
              value={heroFormik.values.subtitle}
              onChange={heroFormik.handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Nút hành động chính
              </label>
              <input
                type="text"
                name="primaryCtaText"
                value={heroFormik.values.primaryCtaText}
                onChange={heroFormik.handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Số điện thoại hiển thị
              </label>
              <input
                type="text"
                name="hotlineDisplay"
                value={heroFormik.values.hotlineDisplay}
                onChange={heroFormik.handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Link YouTube Embed (Phim giới thiệu)
              </label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="videoUrl"
                  value={heroFormik.values.videoUrl}
                  onChange={heroFormik.handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>
            </div>
          </div>

          {/* Hero Cover Banner Upload */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-800">
                  Ảnh bìa chính trên Trang chủ (Hero Cover Banner)
                </h3>
                <p className="text-xs text-gray-500">
                  Hiển thị trong khung lớn ngay dưới tiêu đề trang chủ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => heroCoverRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-hepco-green hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh bìa mới</span>
              </button>
              <input
                type="file"
                ref={heroCoverRef}
                accept="image/*"
                onChange={handleUploadHeroCover}
                className="hidden"
              />
            </div>

            <input
              type="text"
              name="coverImage"
              value={heroFormik.values.coverImage}
              onChange={heroFormik.handleChange}
              placeholder="/images/cover.png hoặc https://..."
              className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
            />

            <div className="rounded-xl overflow-hidden border border-gray-200 bg-[#0e3b2f] max-w-2xl">
              <img
                src={resolveAssetUrl(heroFormik.values.coverImage || '/images/cover.png')}
                alt="Hero Cover Preview"
                className="w-full h-56 object-contain"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-hepco-green hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Hero</span>
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

export default AdminBannerManager;
