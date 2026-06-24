import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    }
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: async (url) => {
      const response = await axiosInstance.delete('/api/upload', {
        data: { url }
      });
      return response.data;
    }
  });
};
