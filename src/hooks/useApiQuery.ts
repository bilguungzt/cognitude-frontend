import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";

export function useApiQuery<TData, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

