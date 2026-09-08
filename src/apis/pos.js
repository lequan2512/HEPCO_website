import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetPosDevices = (params, options = {}) => {
  return useQuery({
    queryKey: ['posDevices', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/pos', { params });
      return response.data;
    },
    ...options
  });
};

export const useGetPosDeviceById = (id) => {
  return useQuery({
    queryKey: ['posDevices', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/pos/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAddPosDevice = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/pos', data);
      return response.data;
    },
  });
};

export const useUpdatePosDevice = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/pos/${id}`, data);
      return response.data;
    },
  });
};

export const useDeletePosDevice = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/pos/${id}`);
      return response.data;
    },
  });
};

export const useAssignPosDevice = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.post(`/api/pos/${id}/assign`, data);
      return response.data;
    },
  });
};

export const useUnassignPosDevice = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.post(`/api/pos/${id}/unassign`, data);
      return response.data;
    },
  });
};

export const useBorrowPosDevice = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.post(`/api/pos/${id}/borrow`, data);
      return response.data;
    },
  });
};

export const useReturnBorrowPosDevice = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.post(`/api/pos/${id}/return-borrow`, data);
      return response.data;
    },
  });
};

export const useGetPosHistory = (id) => {
  return useQuery({
    queryKey: ['posHistory', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/pos/${id}/history`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdatePosAssignment = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/pos/assignments/${id}`, data);
      return response.data;
    },
  });
};

export const useDeletePosAssignment = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/pos/assignments/${id}`);
      return response.data;
    },
  });
};

