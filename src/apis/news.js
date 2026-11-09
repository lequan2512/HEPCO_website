import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetNews = (params) => {
  return useQuery({
    queryKey: ['news', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/news', { params });
      return response.data;
    }
  });
};

export const useGetNewsStats = () => {
  return useQuery({
    queryKey: ['newsStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/news/stats');
      return response.data;
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
