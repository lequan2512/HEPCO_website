import axiosInstance from '../utils/axios';
import { CMS_REQUEST_TIMEOUT } from '../constants/cms';
import { apiContractError, requestConfirmed } from './apiErrors';

export const login = (credentials) => requestConfirmed(async () => {
  const response = await axiosInstance.post('/api/login', credentials, { timeout: CMS_REQUEST_TIMEOUT });
  if (response?.data?.success !== true || typeof response.data.token !== 'string' || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(response.data.token) || !Number.isSafeInteger(response.data.user?.id) || response.data.user.id < 1) throw apiContractError('INVALID_SERVER_RESPONSE', 'The server did not confirm authentication');
  return response.data;
});
export const getSession = () => requestConfirmed(async () => {
  const response = await axiosInstance.get('/api/session', { timeout: CMS_REQUEST_TIMEOUT });
  if (response?.data?.success !== true || !Number.isSafeInteger(response.data.user?.id) || response.data.user.id < 1 || typeof response.data.canManageContent !== 'boolean') throw apiContractError('INVALID_SERVER_RESPONSE', 'The server did not confirm the session');
  return response.data;
});
