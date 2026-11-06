import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import { getMigratedBanners } from '../services/news.service';

// Fetch banner images (with migrated fallback)
export const useGetBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: () => getMigratedBanners(),
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

// Delete banner
export const useDeleteBanner = () => {
  return useMutation({
    mutationFn: async (filename) => {
      const response = await axiosInstance.delete(`/api/banner/${filename}`);
      return response.data;
    },
  });
};
