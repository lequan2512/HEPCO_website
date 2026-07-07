import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useGetAssignments = (params) => {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/assignments', { params });
      return response.data;
    },
  });
};

export const useAddAssignment = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/assignments', data);
      return response.data;
    },
  });
};

export const useReturnAssignment = () => {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put(`/api/assignments/${id}/return`, data);
      return response.data;
    },
  });
};
