import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "../services";

interface UseApiQueryOptions<TData, TError = string> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  queryKey: (string | number | object)[];
  queryFn: () => Promise<TData>;
  zeroStateOn404?: TData;
}

export function useApiQuery<TData, TError = string>(
  { queryKey, queryFn, zeroStateOn404, ...options }: UseApiQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 404 && zeroStateOn404 !== undefined) {
          return zeroStateOn404;
        }
        throw api.handleError(err) as TError;
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

