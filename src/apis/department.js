import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/departments');
      return response.data;
    },
  });
};

export const useAddDepartment = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/departments', data);
      return response.data;
    },
  });
};

export const useUpdateDepartment = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/departments/${id}`, data);
      return response.data;
    },
  });
};

export const useDeleteDepartment = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/departments/${id}`);
      return response.data;
    },
  });
};
