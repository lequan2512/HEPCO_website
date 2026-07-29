import { useQuery, useMutation } from '@tanstack/react-query';
import * as baseOfficeService from '../services/baseOffice.service';
import {
  getDispatchTypeLabel,
  getDispatchStatusLabel,
  getRequestStatusLabel,
  getTaskStatusLabel,
  getTaskPriorityLabel,
  getUrgencyLevelLabel
} from '../constants/baseOffice';

// Transformer helpers to map Base.vn raw items to mapped UI objects
export const mapDispatchItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    typeConfig: getDispatchTypeLabel(item.type),
    statusConfig: getDispatchStatusLabel(item.status),
    urgencyConfig: getUrgencyLevelLabel(item.urgency)
  };
};

export const mapRequestItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    statusConfig: getRequestStatusLabel(item.status)
  };
};

export const mapTaskItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    statusConfig: getTaskStatusLabel(item.status),
    priorityConfig: getTaskPriorityLabel(item.priority)
  };
};

export const useGetDispatches = (params, options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'dispatches', params],
    queryFn: () => baseOfficeService.getDispatches(params),
    select: (res) => {
      if (!res?.data) return res;
      return {
        ...res,
        data: res.data.map(mapDispatchItem)
      };
    },
    ...options
  });
};

export const useGetDispatchDetail = (id, options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'dispatch', id],
    queryFn: () => baseOfficeService.getDispatchDetail(id),
    select: (res) => {
      const data = res?.data || res;
      return res?.data ? { ...res, data: mapDispatchItem(data) } : mapDispatchItem(res);
    },
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
    select: (res) => {
      if (!res?.data) return res;
      return {
        ...res,
        data: res.data.map(mapRequestItem)
      };
    },
    ...options
  });
};

export const useGetTasks = (params, options = {}) => {
  return useQuery({
    queryKey: ['baseOffice', 'tasks', params],
    queryFn: () => baseOfficeService.getTasks(params),
    select: (res) => {
      if (!res?.data) return res;
      return {
        ...res,
        data: res.data.map(mapTaskItem)
      };
    },
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
