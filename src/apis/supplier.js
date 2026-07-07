import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetSuppliers = (params) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/suppliers', { params });
      return response.data;
    },
  });
};

export const useAddSupplier = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/suppliers', data);
      return response.data;
    },
  });
};

export const useUpdateSupplier = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/suppliers/${id}`, data);
      return response.data;
    },
  });
};

export const useDeleteSupplier = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/suppliers/${id}`);
      return response.data;
    },
  });
};
