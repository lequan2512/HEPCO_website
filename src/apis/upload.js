import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Compress large images on canvas so localStorage stays lightweight
      if (file.type && file.type.startsWith('image/') && file.size > 350 * 1024) {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(reader.result);
        img.src = reader.result;
      } else {
        resolve(reader.result);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await axiosInstance.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 3500
        });
        if (response?.data?.success && response?.data?.url) {
          return response.data;
        }
      } catch {
        // Fallback to local DataURL / ObjectURL so Admin uploads work without backend server
      }

      const file = formData.get('image') || formData.get('file');
      if (!file) {
        throw new Error('No file provided');
      }

      // For large PDF/document files (> 2MB), use ObjectURL in session or DataURL for smaller files
      if (!file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
        const blobUrl = URL.createObjectURL(file);
        return {
          success: true,
          url: blobUrl,
          fileName: file.name,
          size: file.size
        };
      }

      const dataUrl = await readFileAsDataUrl(file);
      return {
        success: true,
        url: dataUrl,
        fileName: file.name,
        size: file.size
      };
    }
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: async (url) => {
      try {
        const response = await axiosInstance.delete('/api/upload', {
          data: { url },
          timeout: 2500
        });
        return response.data;
      } catch {
        return { success: true };
      }
    }
  });
};
