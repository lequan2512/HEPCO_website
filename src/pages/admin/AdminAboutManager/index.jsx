import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileText,
  Save,
  Upload,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAboutSettings, updateAboutSettings } from '../../../services/news.service';
import { useUploadImage } from '../../../apis/upload';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import { ROUTES } from '../../../constants/routes';
import AdminNewsManager from '../AdminNewsManager';
import Loading from '../../../components/Loading';

const AdminAboutManager = () => {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'articles'
  const orgChartFileRef = useRef(null);
  const capabilityPdfRef = useRef(null);
  const hqImageRef = useRef(null);
  const uploadMutation = useUploadImage();

  const initialAbout = getAboutSettings();

  const formik = useFormik({
    initialValues: initialAbout,
    enableReinitialize: true,
    onSubmit: (values) => {
      updateAboutSettings(values);
      toast.success('Đã lưu cấu hình trang Giới thiệu thành công!');
    }
  });

  const handleUploadAsset = async (e, fieldName, label) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      toast.loading(`Đang tải ${label}...`, { id: 'about_upload' });
      const res = await uploadMutation.mutateAsync(formData);
      if (res.success) {
        formik.setFieldValue(fieldName, res.url);
        toast.success(`Đã cập nhật ${label}! Nhấn Lưu cấu hình để áp dụng.`, {
          id: 'about_upload'
        });
      }
    } catch {
      toast.error(`Lỗi tải ${label}`, { id: 'about_upload' });
    }
  };

  return (
    <div className="space-y-6 relative">
      {uploadMutation.isPending && <Loading fullScreen message="Đang tải tệp lên..." />}

      {/* Header & Sub-tab Switcher */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">
            Quản lý Chuyên mục Giới Thiệu
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Chỉnh sửa Thư ngỏ, Sơ đồ tổ chức, Hồ sơ năng lực PDF, Lịch sử hình thành và Chức năng nhiệm vụ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-white text-hepco-green shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Thư Ngỏ, Sơ Đồ &amp; Hồ Sơ Năng Lực</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-white text-hepco-green shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Bài viết Lịch Sử &amp; Chức Năng</span>
            </button>
          </div>

          <Link
            to={ROUTES.ABOUT}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-hepco-green border border-emerald-200 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem trang Giới thiệu</span>
          </Link>
        </div>
      </div>

      {activeTab === 'general' ? (
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-7 space-y-6"
        >
          {/* Banner Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Mô tả trên Banner đầu trang Giới thiệu
            </label>
            <textarea
              rows={3}
              name="bannerDescription"
              value={formik.values.bannerDescription}
              onChange={formik.handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
            />
          </div>

          {/* Open Letter Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
            <h3 className="text-base font-extrabold text-gray-800">
              Nội dung Thư Ngỏ &amp; Thông tin Trụ sở
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tiêu đề mục Thư ngỏ
                </label>
                <input
                  type="text"
                  name="openLetterTitle"
                  value={formik.values.openLetterTitle}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Trụ sở hiển thị trên ảnh
                </label>
                <input
                  type="text"
                  name="hqTitle"
                  value={formik.values.hqTitle}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Địa chỉ Trụ sở
                </label>
                <input
                  type="text"
                  name="hqAddress"
                  value={formik.values.hqAddress}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Đoạn mở đầu 1</label>
              <textarea
                rows={3}
                name="openLetterParagraph1"
                value={formik.values.openLetterParagraph1}
                onChange={formik.handleChange}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Đoạn nội dung 2</label>
              <textarea
                rows={3}
                name="openLetterParagraph2"
                value={formik.values.openLetterParagraph2}
                onChange={formik.handleChange}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Đoạn nhấn mạnh (Khung nền xanh)
              </label>
              <textarea
                rows={2}
                name="openLetterHighlight"
                value={formik.values.openLetterHighlight}
                onChange={formik.handleChange}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ảnh minh họa khối Trụ sở
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  name="hqImage"
                  value={formik.values.hqImage}
                  onChange={formik.handleChange}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                />
                <button
                  type="button"
                  onClick={() => hqImageRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-hepco-green text-white text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh mới</span>
                </button>
                <input
                  type="file"
                  ref={hqImageRef}
                  accept="image/*"
                  onChange={(e) => handleUploadAsset(e, 'hqImage', 'ảnh Trụ sở')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Organizational Chart & Capability Profile PDF */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Org Chart */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-gray-800">
                  Sơ đồ bộ máy tổ chức (Tab 3)
                </h3>
                <button
                  type="button"
                  onClick={() => orgChartFileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hepco-green text-white text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh sơ đồ</span>
                </button>
                <input
                  type="file"
                  ref={orgChartFileRef}
                  accept="image/*"
                  onChange={(e) => handleUploadAsset(e, 'orgChartImage', 'Sơ đồ tổ chức')}
                  className="hidden"
                />
              </div>
              <input
                type="text"
                name="orgChartImage"
                value={formik.values.orgChartImage}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
              />
              {formik.values.orgChartImage && (
                <img
                  src={resolveAssetUrl(formik.values.orgChartImage)}
                  alt="Sơ đồ tổ chức"
                  className="w-full h-44 object-contain bg-white rounded-xl border border-gray-200 p-2"
                />
              )}
            </div>

            {/* Capability PDF */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-gray-800">
                  Hồ sơ năng lực PDF (Tab 4)
                </h3>
                <button
                  type="button"
                  onClick={() => capabilityPdfRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hepco-green text-white text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải file PDF mới</span>
                </button>
                <input
                  type="file"
                  ref={capabilityPdfRef}
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleUploadAsset(e, 'capabilityPdfUrl', 'Hồ sơ năng lực PDF')}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Đường dẫn tệp PDF Hồ sơ năng lực
                </label>
                <input
                  type="text"
                  name="capabilityPdfUrl"
                  value={formik.values.capabilityPdfUrl}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tên tệp khi tải xuống
                </label>
                <input
                  type="text"
                  name="capabilityPdfName"
                  value={formik.values.capabilityPdfName}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-hepco-green hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Giới Thiệu</span>
            </button>
          </div>
        </form>
      ) : (
        <AdminNewsManager type="about" />
      )}
    </div>
  );
};

export default AdminAboutManager;
