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
  getRequestForApproval,
  RequestApprovalResponse,
  processRequestAction,
  approveRequest,
  rejectRequest,
  ApproveRequestRequest,
  RequestActionRequest,
} from "@/lib/api/request";
import { ApiError } from "@/lib/errors/api-error";
import { useApiQuery } from "./use-api-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

/**
 * 申請承認画面用の申請詳細を取得するReact Queryフック
 * @param id 申請ID
 * @param enabled クエリを有効にするかどうか（デフォルト: true）
 * @returns React Queryのクエリ結果
 */
export function useRequestForApproval(id: number, enabled: boolean = true) {
  return useApiQuery<RequestApprovalResponse, ApiError>({
    queryKey: ["request", "approve", id],
    queryFn: () => getRequestForApproval(id),
    enabled: enabled && !isNaN(id),
  });
}

/**
 * 申請の承認・差し戻しを処理するMutation（統合API）
 * @returns React QueryのMutation結果
 */
export function useProcessRequestAction() {
  const queryClient = useQueryClient();
  return useMutation<RequestResponse, ApiError, { id: number; request: RequestActionRequest }>({
    mutationFn: ({ id, request }) => processRequestAction(id, request),
    onSuccess: (_, variables) => {
      // 申請承認画面のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["request", "approve", variables.id],
      });
      // 申請一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["requests", "list"],
      });
      // 申請件数のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["requests", "count"],
      });
    },
  });
}

/**
 * 申請を承認するMutation（旧形式、後方互換性のため残す）
 * @deprecated useProcessRequestActionを使用してください
 */
export function useApproveRequest() {
  const queryClient = useQueryClient();
  return useMutation<RequestResponse, ApiError, { id: number; request: ApproveRequestRequest }>({
    mutationFn: ({ id, request }) => approveRequest(id, request),
    onSuccess: (_, variables) => {
      // 申請承認画面のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["request", "approve", variables.id],
      });
      // 申請一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["requests", "list"],
      });
      // 申請件数のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["requests", "count"],
      });
    },
  });
}

/**
 * 申請を差し戻すMutation（旧形式、後方互換性のため残す）
 * @deprecated useProcessRequestActionを使用してください
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation<RequestResponse, ApiError, { id: number; request: ApproveRequestRequest }>({
    mutationFn: ({ id, request }) => rejectRequest(id, request),
    onSuccess: (_, variables) => {
      // 申請承認画面のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["request", "approve", variables.id],
      });
      // 申請一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["requests", "list"],
      });
      // 申請件数のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["requests", "count"],
      });
    },
  });
}
