import axiosInstance from '../utils/axios';

export const getDispatches = async (params) => {
  const response = await axiosInstance.get('/api/base-office/dispatches', { params });
  return response.data;
};

export const getDispatchDetail = async (id) => {
  const response = await axiosInstance.get(`/api/base-office/dispatches/${id}`);
  return response.data;
};

export const createDispatch = async (data) => {
  const response = await axiosInstance.post('/api/base-office/dispatches', data);
  return response.data;
};

export const getRequests = async (params) => {
  const response = await axiosInstance.get('/api/base-office/requests', { params });
  return response.data;
};

export const getTasks = async (params) => {
  const response = await axiosInstance.get('/api/base-office/tasks', { params });
  return response.data;
};

export const getHealth = async () => {
  const response = await axiosInstance.get('/api/base-office/health');
  return response.data;
};
