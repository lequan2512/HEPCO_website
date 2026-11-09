import axiosInstance from '../utils/axios';
import { CMS_REQUEST_TIMEOUT } from '../constants/cms';
import { apiContractError, requestConfirmed } from './apiErrors';

const confirmed = (response) => {
  const result = response?.data;
  if (result?.success !== true || !Number.isSafeInteger(result.version) || result.version < 0 || !Array.isArray(result.data?.items) || !result.data.items.length || !result.data?.title) throw apiContractError('INVALID_SERVER_RESPONSE', 'The server did not confirm the showcase configuration');
  return result;
};
export const getShowcase = () => requestConfirmed(async () => confirmed(await axiosInstance.get('/api/showcase', { timeout: CMS_REQUEST_TIMEOUT })));
export const saveShowcase = (config, version) => requestConfirmed(async () => {
  const result = confirmed(await axiosInstance.put('/api/showcase', { config, version }, { timeout: CMS_REQUEST_TIMEOUT }));
  if (result.version !== version + 1) throw apiContractError('INVALID_SERVER_RESPONSE', 'The server did not confirm the saved version');
  return result;
});
