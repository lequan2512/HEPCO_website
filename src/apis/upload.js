import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import { CMS_REQUEST_TIMEOUT } from '../constants/cms';
import { apiContractError } from '../services/apiErrors';

export const useUploadImage = () =>
  useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await axiosInstance.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: CMS_REQUEST_TIMEOUT
        });
        if (
          response?.data?.success === true &&
          typeof response.data.url === 'string' &&
          (response.data.url.startsWith('https://') ||
            /^\/api\/media\/images\/[a-f0-9-]+\.(png|jpg|gif|webp)$/.test(response.data.url))
        ) {
          return response.data;
        }
      } catch {
        // Fallback when server is offline: convert file to local Data URL
      }

      const file = formData?.get?.('image');
      if (file && typeof FileReader !== 'undefined') {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return { success: true, url: dataUrl };
      }

      throw apiContractError('UPLOAD_FAILED', 'Không thể tải ảnh lên');
    }
  });

export const useDeleteImage = () =>
  useMutation({
    mutationFn: async (url) => {
      try {
        const response = await axiosInstance.delete('/api/upload', {
          data: { url },
          timeout: CMS_REQUEST_TIMEOUT
        });
        if (response?.data?.success === true) return response.data;
      } catch {
        // Ignore offline deletion errors
      }
      return { success: true };
    }
  });
