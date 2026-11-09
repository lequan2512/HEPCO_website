import axiosInstance from '../utils/axios';
import { CMS_REQUEST_TIMEOUT } from '../constants/cms';
import { apiContractError, requestConfirmed } from './apiErrors';

const persistedId = (value) => Number.isSafeInteger(value) && value > 0;
const confirmedArticle = (response, expectedId) => {
  const article = response?.data?.data;
  if (response?.data?.success !== true || !article || !persistedId(article.id) || (expectedId !== undefined && Number(article.id) !== Number(expectedId))) throw apiContractError('INVALID_SERVER_RESPONSE', 'The server did not return the saved article');
  return article;
};
export const createServerArticle = (payload) => requestConfirmed(async () => confirmedArticle(await axiosInstance.post('/api/news', payload, { timeout: CMS_REQUEST_TIMEOUT })));
export const updateServerArticle = (id, payload) => requestConfirmed(async () => confirmedArticle(await axiosInstance.put(`/api/news/${id}`, payload, { timeout: CMS_REQUEST_TIMEOUT }), id));
export const deleteServerArticle = (id) => requestConfirmed(async () => {
  const response = await axiosInstance.delete(`/api/news/${id}`, { timeout: CMS_REQUEST_TIMEOUT });
  if (response?.data?.success !== true || !persistedId(response.data.id) || Number(response.data.id) !== Number(id)) throw apiContractError('INVALID_SERVER_RESPONSE', 'The server did not confirm the deleted article');
  return response.data;
});
export const getServerArticles = (params) => requestConfirmed(async () => {
  const response = await axiosInstance.get('/api/news', { params, timeout: CMS_REQUEST_TIMEOUT });
  const result = response?.data;
  if (!Array.isArray(result?.data) || !Number.isSafeInteger(result?.meta?.total) || !Number.isSafeInteger(result?.meta?.page) || !Number.isSafeInteger(result?.meta?.totalPages)) throw apiContractError('INVALID_SERVER_RESPONSE', 'Invalid article list response');
  return { ...result, meta: { ...result.meta, source: 'server' } };
});
export const getServerArticle = (id) => requestConfirmed(async () => {
  const response = await axiosInstance.get(`/api/news/${id}`, { timeout: CMS_REQUEST_TIMEOUT });
  if (!persistedId(response?.data?.id) || Number(response.data.id) !== Number(id)) throw apiContractError('INVALID_SERVER_RESPONSE', 'Invalid article detail response');
  return response.data;
});
