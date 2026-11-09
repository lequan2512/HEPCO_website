import { useQuery } from '@tanstack/react-query';
import { getShowcase } from '../services/showcase.service';

export const useShowcase = () => useQuery({ queryKey: ['home-showcase'], queryFn: getShowcase, retry: 1, staleTime: 30000, refetchOnWindowFocus: true });
