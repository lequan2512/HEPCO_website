import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import { CMS_REQUEST_TIMEOUT } from '../constants/cms';
import { apiContractError, requestConfirmed } from '../services/apiErrors';

export const useUploadImage = () => useMutation({
  mutationFn: (formData) => requestConfirmed(async () => {
    const response = await axiosInstance.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: CMS_REQUEST_TIMEOUT });
    if (response?.data?.success !== true || typeof response.data.url !== 'string' || !(response.data.url.startsWith('https://') || /^\/api\/media\/images\/[a-f0-9-]+\.(png|jpg|gif|webp)$/.test(response.data.url))) throw apiContractError('PERMANENT_UPLOAD_REQUIRED', 'The server did not confirm a permanent upload');
    return response.data;
  }),
});
export const useDeleteImage = () => useMutation({
  mutationFn: (url) => requestConfirmed(async () => {
    const response = await axiosInstance.delete('/api/upload', { data: { url }, timeout: CMS_REQUEST_TIMEOUT });
    if (response?.data?.success !== true) throw apiContractError('INVALID_SERVER_RESPONSE', 'The server did not confirm deletion');
    return response.data;
  }),
});
