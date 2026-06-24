import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

// Lấy danh sách ảnh banner
export const useGetBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/banner');
      return response.data;
    },
  });
};

// Upload banner
export const useUploadBanner = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post('/api/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
};

// Xóa banner
export const useDeleteBanner = () => {
  return useMutation({
    mutationFn: async (filename) => {
      const response = await axiosInstance.delete(`/api/banner/${filename}`);
      return response.data;
    },
  });
};
