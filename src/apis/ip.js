import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetIps = (params) => {
  return useQuery({
    queryKey: ['ips', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/ip', { params });
      return response.data.data;
    }
  });
};

export const useAddIp = () => {
  return useMutation({
    mutationFn: async (newIp) => {
      const response = await axiosInstance.post('/api/ip', newIp);
      return response.data;
    }
  });
};

export const useUpdateIp = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/ip/${id}`, data);
      return response.data;
    }
  });
};

export const useDeleteIp = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/ip/${id}`);
      return response.data;
    }
  });
};
