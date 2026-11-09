import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import { getNewsList, getNewsCategoryStats, getGalleryList } from '../services/news.service';

export const useGetNews = (params) => {
  return useQuery({
    queryKey: ['news', params],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/api/news', { params, timeout: 3500 });
        if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fall back seamlessly to complete migrated dataset
      }
      return getNewsList(params);
    }
  });
};

export const useGetNewsStats = () => {
  return useQuery({
    queryKey: ['newsStats'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/api/news/stats', { timeout: 3500 });
        if (response?.data && (response.data.total > 0 || Object.keys(response.data.countsByYear || {}).length > 0)) {
          return response.data;
        }
      } catch {
        // Fall back to local dataset stats
      }
      return getNewsCategoryStats();
    }
  });
};

export const useGetGallery = (params) => {
  return useQuery({
    queryKey: ['gallery', params],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/api/gallery', { params, timeout: 3500 });
        if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fall back to rich gallery dataset
      }
      return getGalleryList(params);
    }
  });
};

export const useGetInfiniteNews = (params) => {
  return useInfiniteQuery({
    queryKey: ['infiniteNews', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get('/api/news', {
        params: { ...params, page: pageParam }
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useGetArticleById = (id) => {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/news/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useCreateNews = () => {
  return useMutation({
    mutationFn: async (newPost) => {
      const response = await axiosInstance.post('/api/news', newPost);
      return response.data;
    }
  });
};

export const useUpdateNews = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/news/${id}`, data);
      return response.data;
    }
  });
};

export const useDeleteNews = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/news/${id}`);
      return response.data;
    }
  });
};

export const useCreateGallery = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/gallery', data);
      return response.data;
    }
  });
};

export const useUpdateGallery = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/gallery/${id}`, data);
      return response.data;
    }
  });
};

export const useDeleteGallery = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/gallery/${id}`);
      return response.data;
    }
  });
};
