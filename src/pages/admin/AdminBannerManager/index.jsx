import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../../constants/api';
import toast from 'react-hot-toast';
import { useGetBanners, useUploadBanner, useDeleteBanner } from '../../../apis/banner';
import Loading from '../../../components/Loading';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminBannerManager = () => {
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: banners = [], isLoading } = useGetBanners();
  const uploadBannerMutation = useUploadBanner();
  const deleteBannerMutation = useDeleteBanner();

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'upload_banner' });
      await uploadBannerMutation.mutateAsync(formData);
      toast.success('Tải ảnh thành công!', { id: 'upload_banner' });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    } catch (error) {
      console.error('Upload banner error:', error);
      toast.error('Lỗi tải ảnh lên', { id: 'upload_banner' });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = (bannerUrl) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Hình Ảnh',
      message: 'Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          toast.loading('Đang xóa hình ảnh...', { id: 'delete_banner' });
          const filename = bannerUrl.split('/').pop();
          await deleteBannerMutation.mutateAsync(filename);
          toast.success('Xóa hình ảnh thành công!', { id: 'delete_banner' });
          queryClient.invalidateQueries({ queryKey: ['banners'] });
        } catch (error) {
          console.error('Delete banner error:', error);
          toast.error('Lỗi xóa hình ảnh', { id: 'delete_banner' });
        }
      }
    });
  };

  return (
    <div className="w-full relative">
      {(uploadBannerMutation.isPending || deleteBannerMutation.isPending) && <Loading fullScreen message="Đang xử lý..." />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Hình Ảnh (Slider Trang Chủ)</h1>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Hình Ảnh</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleUpload}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
        {isLoading ? (
          <Loading />
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((url, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img 
                  src={url.startsWith('http') ? url : `${API_BASE_URL}${url}`} 
                  alt={`Hình Ảnh ${index}`} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(url)}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                    title="Xóa Hình Ảnh"
                  >
                    <Trash2 className="w-5 h-5" />
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
            <p className="text-gray-500 mt-1">Vui lòng tải lên hình ảnh mới để hiển thị ngoài trang chủ.</p>
          </div>
        )}
      </div>

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
