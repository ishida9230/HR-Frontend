/**
 * 変更申請APIクライアント
 */

import { apiFetch } from "./api-client";

/**
 * 変更申請作成リクエスト型
 */
export interface CreateRequestRequest {
  employeeId: number;
  text: string;
  items: Array<{
    fieldKey: string;
    oldValue: string | null;
    newValue: string | null;
  }>;
}

/**
 * 所属情報のレスポンス型（変更申請詳細ページ用）
 * assignmentsフィールドのoldValue/newValueはこの形式のJSON文字列
 */
export interface AssignmentsFormattedResponse {
  branches: Array<{
    id: number;
    name: string;
  }>;
  departments: Array<{
    id: number;
    name: string;
  }>;
  positions: Array<{
    id: number;
    name: string;
  }>;
}

/**
 * 変更申請レスポンス型
 */
export interface RequestResponse {
  id: number;
  employeeId: number;
  status: string;
  text: string;
  submittedAt: string | null; // ISO 8601形式
  completedAt: string | null; // ISO 8601形式
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  isHidden: boolean;
  items: Array<{
    id: number;
    fieldKey: string;
    oldValue: string | null;
    newValue: string | null;
    // assignmentsフィールドの場合、oldValueとnewValueはAssignmentsFormattedResponseのJSON文字列
    // それ以外のフィールドの場合は通常の文字列
    createdAt: string; // ISO 8601形式
  }>;
}

/**
 * 変更申請を作成
 * @param request 変更申請作成リクエスト
 * @returns 変更申請レスポンス
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function createChangeRequest(request: CreateRequestRequest): Promise<RequestResponse> {
  return apiFetch<RequestResponse>("/api/requests", {
    method: "POST",
    body: request,
    defaultErrorMessage: "変更申請の作成に失敗しました",
  });
}

/**
 * 変更申請詳細を取得
 * @param id 変更申請ID
 * @returns 変更申請レスポンス
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getChangeRequestById(id: number): Promise<RequestResponse> {
  return apiFetch<RequestResponse>(`/api/requests/${id}`, {
    method: "GET",
    defaultErrorMessage: "変更申請の取得に失敗しました",
  });
}

/**
 * 変更申請を非表示にする
 * @param id 変更申請ID
 * @returns 非表示にされた変更申請レスポンス（{ id: number }）
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function hideChangeRequest(id: number): Promise<{ id: number }> {
  return apiFetch<{ id: number }>(`/api/requests/${id}/hide`, {
    method: "PATCH",
    defaultErrorMessage: "申請の非表示に失敗しました",
  });
}

/**
 * 申請件数レスポンス型
 */
export interface RequestCountResponse {
  pendingManager: number;
  pendingHr: number;
}

/**
 * 申請一覧検索クエリ型
 */
export interface RequestListQuery {
  statuses?: string[];
  employeeName?: string;
  departmentIds?: number[];
  branchIds?: number[];
  positionIds?: number[];
  page?: number;
  limit?: number;
}

/**
 * 申請一覧アイテム型
 */
export interface RequestListItem {
  id: number;
  title: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
  };
  departments: Array<{
    id: number;
    name: string;
  }>;
  branches: Array<{
    id: number;
    name: string;
  }>;
  positions: Array<{
    id: number;
    name: string;
  }>;
  status: string;
  submittedAt: string | null;
  updatedAt: string;
}

/**
 * 申請一覧レスポンス型
 */
export interface RequestListResponse {
  requests: RequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 申請件数を取得
 * @returns 申請件数レスポンス
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getRequestCounts(): Promise<RequestCountResponse> {
  return apiFetch<RequestCountResponse>("/api/requests/count", {
    method: "GET",
    defaultErrorMessage: "申請件数の取得に失敗しました",
  });
}

/**
 * 申請一覧を取得
 * @param query 検索・フィルタリング・ページネーションクエリ
 * @returns 申請一覧レスポンス
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getRequestList(query: RequestListQuery): Promise<RequestListResponse> {
  const queryParams = new URLSearchParams();
  if (query.statuses && query.statuses.length > 0) {
    query.statuses.forEach((status) => queryParams.append("status", status));
  }
  if (query.employeeName) queryParams.append("employeeName", query.employeeName);
  if (query.departmentIds && query.departmentIds.length > 0) {
    query.departmentIds.forEach((id) => queryParams.append("departmentIds", id.toString()));
  }
  if (query.branchIds && query.branchIds.length > 0) {
    query.branchIds.forEach((id) => queryParams.append("branchIds", id.toString()));
  }
  if (query.positionIds && query.positionIds.length > 0) {
    query.positionIds.forEach((id) => queryParams.append("positionIds", id.toString()));
  }
  if (query.page) queryParams.append("page", query.page.toString());
  if (query.limit) queryParams.append("limit", query.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/requests/list?${queryString}` : "/api/requests/list";

  return apiFetch<RequestListResponse>(endpoint, {
    method: "GET",
    defaultErrorMessage: "申請一覧の取得に失敗しました",
  });
}
