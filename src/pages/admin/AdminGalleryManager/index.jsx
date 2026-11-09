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
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetGallery,
  useCreateGallery,
  useUpdateGallery,
  useDeleteGallery
} from '../../../apis/news';
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
  const queryClient = useQueryClient();

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
  const createMutation = useCreateGallery();
  const updateMutation = useUpdateGallery();
  const deleteMutation = useDeleteGallery();

  const { data: galleryResponse, isLoading } = useGetGallery({
    category,
    search,
    page,
    limit: 16
  });

  const items = galleryResponse?.data || [];
  const meta = galleryResponse?.meta || { total: 0, page: 1, limit: 16, totalPages: 1 };

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
      if (res?.url) {
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

    try {
      const payload = {
        ...formState,
        categoryLabel: GALLERY_CATEGORY_LABELS[formState.category]?.label || 'Hoạt động công ty'
      };

      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          ...payload
        });
        toast.success('Đã cập nhật thông tin hình ảnh!');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Đã thêm hình ảnh mới vào thư viện!');
      }
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setIsModalOpen(false);
    } catch {
      toast.error('Lỗi khi lưu hình ảnh');
    }
  };

  const handleDeletePhoto = (item) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Hình Ảnh Thư Viện',
      message: `Bạn có chắc chắn muốn xóa hình ảnh "${item.caption}" khỏi thư viện?`,
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id);
          queryClient.invalidateQueries({ queryKey: ['gallery'] });
          toast.success('Đã xóa hình ảnh khỏi thư viện!');
        } catch {
          toast.error('Lỗi khi xóa hình ảnh');
        }
      }
    });
  };

  return (
    <div className="w-full space-y-5 relative">
      {(uploadImageMutation.isPending || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) && (
        <Loading fullScreen message="Đang xử lý dữ liệu..." />
      )}

      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-hepco-green" />
              Quản lý Thư viện Ảnh Hoạt động
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Hình ảnh sẽ tự động hiển thị trên Slider trang chủ và Thư viện ảnh công khai ({meta.total} ảnh)
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-hepco-green text-white font-bold text-sm shadow-sm hover:bg-hepco-green-dark transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm ảnh mới
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm chú thích ảnh..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-hepco-green focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-hepco-green focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value={GALLERY_CATEGORY.ALL}>Tất cả danh mục</option>
              {GALLERY_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Items */}
      {isLoading ? (
        <Loading message="Đang tải danh sách ảnh hoạt động..." />
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-base">Chưa có hình ảnh nào phù hợp</p>
          <p className="text-gray-400 text-xs mt-1">
            Nhấn "Thêm ảnh mới" để tải lên hình ảnh hoạt động của công ty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={resolveAssetUrl(item.url)}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/images/cover.png"; }}
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  {GALLERY_CATEGORY_LABELS[item.category]?.label || 'Hoạt động'}
                </span>
                {item.date && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/40 text-gray-200 backdrop-blur-xs">
                    {item.date}
                  </span>
                )}
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3">
                  {item.caption || 'Hình ảnh hoạt động'}
                </p>
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-hepco-green hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editingItem ? 'Sửa thông tin hình ảnh' : 'Thêm ảnh mới vào thư viện'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Hình ảnh <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL ảnh hoặc tải file lên..."
                    value={formState.url}
                    onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-hepco-green focus:outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadPhoto}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Tải lên
                  </button>
                </div>
                {formState.url && (
                  <div className="mt-2.5 aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={resolveAssetUrl(formState.url)}
                      alt="Xem trước"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Chú thích / Tiêu đề <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả khoảnh khắc, hoạt động..."
                  value={formState.caption}
                  onChange={(e) => setFormState({ ...formState, caption: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-hepco-green focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Danh mục
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-hepco-green focus:outline-none"
                  >
                    {GALLERY_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Năm / Thời gian
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 2026 hoặc 06/2026"
                    value={formState.date}
                    onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-hepco-green focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-hepco-green text-white hover:bg-hepco-green-dark rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Lưu thay đổi' : 'Thêm vào thư viện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

export default AdminGalleryManager;
