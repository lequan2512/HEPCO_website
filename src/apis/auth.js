import { useMutation, useQuery } from '@tanstack/react-query';
import { login, getSession } from '../services/auth.service';

export const useLogin = () => useMutation({ mutationFn: login });
export const useSession = (token) => useQuery({ queryKey: ['admin-session', token], queryFn: getSession, enabled: !!token, retry: false, staleTime: 0 });
