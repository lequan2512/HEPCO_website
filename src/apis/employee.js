import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/employees');
      return response.data;
    },
  });
};

export const useGetDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/departments');
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
