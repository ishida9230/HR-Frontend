/**
 * 変更申請関連のReact Queryフック
 */

import {
  getChangeRequestById,
  RequestResponse,
  getRequestCounts,
  RequestCountResponse,
  getRequestList,
  RequestListResponse,
  RequestListQuery,
} from "@/lib/api/request";
import { ApiError } from "@/lib/errors/api-error";
import { useApiQuery } from "./use-api-query";

/**
 * 変更申請を取得するReact Queryフック
 * @param id 変更申請ID
 * @param enabled クエリを有効にするかどうか（デフォルト: true）
 * @returns React Queryのクエリ結果
 */
export function useChangeRequest(id: number, enabled: boolean = true) {
  return useApiQuery<RequestResponse, ApiError>({
    queryKey: ["request", id],
    queryFn: () => getChangeRequestById(id),
    enabled: enabled && !isNaN(id),
  });
}

/**
 * 申請件数を取得するReact Queryフック
 * @param enabled クエリを有効にするかどうか（デフォルト: true）
 * @returns React Queryのクエリ結果
 */
export function useRequestCounts(enabled: boolean = true) {
  return useApiQuery<RequestCountResponse, ApiError>({
    queryKey: ["requests", "count"],
    queryFn: () => getRequestCounts(),
    enabled: enabled,
  });
}

/**
 * 申請一覧を取得するReact Queryフック
 * @param query 検索・フィルタリング・ページネーションクエリ
 * @param enabled クエリを有効にするかどうか（デフォルト: true）
 * @returns React Queryのクエリ結果
 */
export function useRequestList(query: RequestListQuery, enabled: boolean = true) {
  return useApiQuery<RequestListResponse, ApiError>({
    queryKey: ["requests", "list", query],
    queryFn: () => getRequestList(query),
    enabled: enabled,
  });
}
