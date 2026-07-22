import { useQuery, useMutation } from '@tanstack/react-query';
import * as baseOfficeService from '../services/baseOffice.service';

export const useGetDispatches = (params) => {
  return useQuery({
    queryKey: ['baseOffice', 'dispatches', params],
    queryFn: () => baseOfficeService.getDispatches(params),
  });
};

export const useGetDispatchDetail = (id) => {
  return useQuery({
    queryKey: ['baseOffice', 'dispatch', id],
    queryFn: () => baseOfficeService.getDispatchDetail(id),
    enabled: !!id,
  });
};

export const useCreateDispatch = () => {
  return useMutation({
    mutationFn: (data) => baseOfficeService.createDispatch(data),
  });
};

export const useGetRequests = (params) => {
  return useQuery({
    queryKey: ['baseOffice', 'requests', params],
    queryFn: () => baseOfficeService.getRequests(params),
  });
};

export const useGetTasks = (params) => {
  return useQuery({
    queryKey: ['baseOffice', 'tasks', params],
    queryFn: () => baseOfficeService.getTasks(params),
  });
};

export const useGetBaseHealth = () => {
  return useQuery({
    queryKey: ['baseOffice', 'health'],
    queryFn: () => baseOfficeService.getHealth(),
  });
};
