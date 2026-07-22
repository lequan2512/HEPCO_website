import { useQuery, useMutation } from '@tanstack/react-query';
import * as baseOfficeService from '../services/baseOffice.service';

export const useGetDispatches = (params, options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'dispatches', params],
    queryFn: () => baseOfficeService.getDispatches(params),
    ...options
  });
};

export const useGetDispatchDetail = (id, options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'dispatch', id],
    queryFn: () => baseOfficeService.getDispatchDetail(id),
    enabled: !!id,
    ...options
  });
};

export const useCreateDispatch = () => {
  return useMutation({
    mutationFn: (data) => baseOfficeService.createDispatch(data),
  });
};

export const useGetRequests = (params, options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'requests', params],
    queryFn: () => baseOfficeService.getRequests(params),
    ...options
  });
};

export const useGetTasks = (params, options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'tasks', params],
    queryFn: () => baseOfficeService.getTasks(params),
    ...options
  });
};

export const useGetBaseHealth = (options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'health'],
    queryFn: () => baseOfficeService.getHealth(),
    ...options
  });
};
