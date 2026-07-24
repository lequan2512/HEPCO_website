import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetPosPapers = (params) => {
  return useQuery({
    queryKey: ['posPapers', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/pos-paper', { params });
      return response.data;
    }
  });
};

export const useAddPosPaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/pos-paper', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posPapers']);
    }
  });
};

export const useUpdatePosPaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const response = await axiosInstance.put(`/pos-paper/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posPapers']);
    }
  });
};

export const useDeletePosPaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/pos-paper/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posPapers']);
    }
  });
};

export const useIssuePosPaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/pos-paper/issue', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posPapers']);
      queryClient.invalidateQueries(['posPaperIssues']);
    }
  });
};

export const useGetPosPaperIssues = (params) => {
  return useQuery({
    queryKey: ['posPaperIssues', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/pos-paper/issues', { params });
      return response.data;
    }
  });
};
