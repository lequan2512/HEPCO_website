import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await axiosInstance.post('/api/login', credentials);
      return response.data;
    },
  });
};
