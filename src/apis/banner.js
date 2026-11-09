import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import { getMigratedBanners } from '../services/news.service';

// Fetch banner images (with migrated fallback & CMS overrides)
export const useGetBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/api/banner', { timeout: 3500 });
        if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback to local banners
      }
      return getMigratedBanners();
    },
  });
};

// Upload banner
export const useUploadBanner = () => {
  return useMutation({
    mutationFn: async (payload) => {
      // If payload is a string URL or DataURL directly
      if (typeof payload === 'string') {
        return addBannerItem(payload);
      }

      try {
        const response = await axiosInstance.post('/api/banner', payload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 3000
        });
        if (response?.data?.url) {
          await addBannerItem(response.data.url);
          return response.data;
        }
      } catch {
        // Fallback to local DataURL conversion
      }

      const file = payload?.get?.('image');
      if (!file) throw new Error('Missing banner file');

      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 1440;
            let { width, height } = img;
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.84));
          };
          img.onerror = () => resolve(reader.result);
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      return addBannerItem(dataUrl);
    }
  });
};

// Delete banner
export const useDeleteBanner = () => {
  return useMutation({
    mutationFn: async (bannerUrlOrFilename) => {
      try {
        const filename = String(bannerUrlOrFilename).split('/').pop();
        await axiosInstance.delete(`/api/banner/${filename}`, { timeout: 2500 });
      } catch {
        // Continue with local CMS removal
      }
      return removeBannerItem(bannerUrlOrFilename);
    }
  });
};
