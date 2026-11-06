import { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Image as ImageIcon,
  X,
  Upload,
  Calendar,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getGalleryList,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} from '../../../services/news.service';
import {
  GALLERY_CATEGORY,
  GALLERY_CATEGORY_OPTIONS,
  GALLERY_CATEGORY_LABELS
} from '../../../constants/news';
import { useUploadImage } from '../../../apis/upload';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import Pagination from '../../../components/Pagination';
import ConfirmModal from '../../../components/ConfirmModal';
import Loading from '../../../components/Loading';

const AdminGalleryManager = () => {
  const [category, setCategory] = useState(GALLERY_CATEGORY.ALL);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [, setRefreshTick] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formState, setFormState] = useState({
    url: '',
    caption: '',
    category: GALLERY_CATEGORY.COMPANY,
    date: ''
  });
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const fileInputRef = useRef(null);
  const uploadImageMutation = useUploadImage();

  const galleryResponse = getGalleryList({
    category,
    search,
    page,
    limit: 16
  });
  const items = galleryResponse.data || [];
  const meta = galleryResponse.meta;

  const openAddModal = () => {
    setEditingItem(null);
    const today = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setFormState({
      url: '',
      caption: '',
      category: GALLERY_CATEGORY.COMPANY,
      date: today
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormState({
      url: item.url || '',
      caption: item.caption || item.title || '',
      category: item.category || GALLERY_CATEGORY.COMPANY,
      date: item.date || ''
    });
    setIsModalOpen(true);
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      toast.loading('Đang tải ảnh lên...', { id: 'gal_upload' });
      const res = await uploadImageMutation.mutateAsync(formData);
      if (res.success) {
        setFormState((prev) => ({
          ...prev,
          url: res.url,
          caption: prev.caption || file.name.replace(/\.[^.]+$/, '')
        }));
        toast.success('Đã tải ảnh thành công!', { id: 'gal_upload' });
      }
    } catch {
      toast.error('Lỗi tải ảnh lên', { id: 'gal_upload' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSavePhoto = async (e) => {
    e.preventDefault();
    if (!formState.url.trim()) {
      toast.error('Vui lòng tải ảnh lên hoặc nhập đường dẫn ảnh');
      return;
    }
    if (!formState.caption.trim()) {
      toast.error('Vui lòng nhập chú thích cho hình ảnh');
      return;
    }

    if (editingItem) {
      await updateGalleryItem({
        id: editingItem.id,
        ...formState
      });
      toast.success('Đã cập nhật thông tin hình ảnh!');
    } else {
      await createGalleryItem(formState);
      toast.success('Đã thêm hình ảnh mới vào thư viện!');
    }
    setIsModalOpen(false);
    setRefreshTick((t) => t + 1);
  };

  const handleDeletePhoto = (item) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Hình Ảnh Thư Viện',
      message: `Bạn có chắc chắn muốn xóa hình ảnh "${item.caption}" khỏi thư viện?`,
      onConfirm: async () => {
        await deleteGalleryItem(item.id);
        setRefreshTick((t) => t + 1);
        toast.success('Đã xóa hình ảnh khỏi thư viện!');
      }
    });
  };

  return (
    <div className="w-full space-y-5 relative">
      {uploadImageMutation.isPending && <Loading fullScreen message="Đang tải ảnh..." />}

      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                Quản lý Thư Viện Hình Ảnh
              </h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {meta.total} hình ảnh
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Thêm mới, phân loại chủ đề và cập nhật chú thích cho kho hình ảnh hoạt động công ty.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-hepco-green hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Hình Ảnh Mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          <div className="relative sm:col-span-7">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo chú thích hoặc tiêu đề ảnh..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-hepco-green outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative sm:col-span-5">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hepco-green w-4 h-4 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-6 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-hepco-green outline-none"
            >
              {GALLERY_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 min-h-[300px] flex flex-col justify-between">
        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {items.map((item) => {
                const badgeStyle =
                  GALLERY_CATEGORY_LABELS[item.category]?.bg ||
                  'bg-emerald-50 text-emerald-700 border-emerald-200';
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 bg-gray-100 relative overflow-hidden">
                        <img
                          src={resolveAssetUrl(item.url)}
                          alt={item.caption}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/cover.png';
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md bg-white/95 ${badgeStyle}`}
                        >
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div className="p-3.5">
                        <p
                          className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug"
                          title={item.caption}
                        >
                          {item.caption}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-hepco-green" />
                          <span>{item.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 border border-gray-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </>
        ) : (
          <div className="py-16 text-center flex flex-col items-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">Không tìm thấy hình ảnh nào</h3>
            <p className="text-xs text-gray-500 mt-1">
              Hãy thử chọn chủ đề khác hoặc nhấn &quot;Thêm Hình Ảnh Mới&quot;.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Photo Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-base font-extrabold text-gray-800">
                {editingItem ? 'Chỉnh sửa Hình ảnh' : 'Thêm Hình ảnh vào Thư viện'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tải ảnh từ máy tính hoặc nhập URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-hepco-green hover:bg-emerald-700 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn file ảnh</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                  <input
                    type="text"
                    placeholder="Hoặc dán đường dẫn ảnh..."
                    value={formState.url}
                    onChange={(e) => setFormState((p) => ({ ...p, url: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                  />
                </div>
                {formState.url && (
                  <img
                    src={resolveAssetUrl(formState.url)}
                    alt="Preview"
                    className="h-36 w-full object-cover rounded-xl border border-gray-200 mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Chú thích / Tiêu đề hình ảnh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập mô tả hoặc chú thích cho hình ảnh..."
                  value={formState.caption}
                  onChange={(e) => setFormState((p) => ({ ...p, caption: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Chủ đề hình ảnh
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-hepco-green"
                  >
                    {GALLERY_CATEGORY_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ngày đăng</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formState.date}
                    onChange={(e) => setFormState((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-hepco-green hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'Lưu thay đổi' : 'Thêm ảnh'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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

export default AdminGalleryManager;
