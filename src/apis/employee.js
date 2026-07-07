import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetEmployees = (params) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/employees', { params });
      return response.data;
    },
  });
};

export const useGetDepartments = (params) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/departments', { params });
      return response.data;
    },
  });
};

export const useAddEmployee = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/employees', data);
      return response.data;
    },
  });
};

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/employees/${id}`, data);
      return response.data;
    },
  });
};

export const useDeleteEmployee = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/employees/${id}`);
      return response.data;
    },
  });
};
