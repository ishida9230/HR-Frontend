/**
 * 汎用的なAPIクエリフック
 * 共通の設定（staleTime、refetchOnWindowFocus、throwOnError）を適用
 */

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/errors/api-error";

/**
 * 汎用的なAPIクエリフックのオプション
 */
export interface UseApiQueryOptions<TData, _TError = ApiError> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * 汎用的なAPIクエリフック
 * 共通の設定（staleTime、refetchOnWindowFocus、throwOnError）を適用
 */
export function useApiQuery<TData, TError = ApiError>(options: UseApiQueryOptions<TData, TError>) {
  return useQuery<TData, TError>({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // デフォルト5分
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    throwOnError: true, // 常にエラーバウンダリーに伝播
  });
}
