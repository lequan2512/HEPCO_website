import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetDevices = (params, options = {}) => {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/devices', { params });
      return response.data;
    },
    ...options
  });
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['deviceCategories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/devices/categories');
      return response.data;
    },
  });
};

export const useGetDeviceById = (id) => {
  return useQuery({
    queryKey: ['devices', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/devices/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAddDevice = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/devices', data);
      return response.data;
    },
  });
};

export const useUpdateDevice = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/devices/${id}`, data);
      return response.data;
    },
  });
};

export const useDeleteDevice = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/devices/${id}`);
      return response.data;
    },
  });
};

export const useDeleteMultipleDevices = () => {
  return useMutation({
    mutationFn: async (ids) => {
      const response = await axiosInstance.post('/api/devices/delete-multiple', { ids });
      return response.data;
    },
  });
};
