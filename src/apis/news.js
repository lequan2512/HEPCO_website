import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import {
  getNewsList,
  getArticleById,
  createNewsItem,
  updateNewsItem,
  deleteNewsItem
} from '../services/news.service';

export const useGetNews = (params) => {
  return useQuery({
    queryKey: ['news', params],
    queryFn: () => getNewsList(params)
  });
};

export const useGetInfiniteNews = (params) => {
  return useInfiniteQuery({
    queryKey: ['infiniteNews', params],
    queryFn: ({ pageParam = 1 }) => getNewsList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1
  });
};

export const useGetArticleById = (id) => {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => getArticleById(id),
    enabled: !!id
  });
};

export const useCreateNews = () => {
  return useMutation({
    mutationFn: (newPost) => createNewsItem(newPost)
  });
};

export const useUpdateNews = () => {
  return useMutation({
    mutationFn: (payload) => updateNewsItem(payload)
  });
};

export const useDeleteNews = () => {
  return useMutation({
    mutationFn: (id) => deleteNewsItem(id)
  });
};
