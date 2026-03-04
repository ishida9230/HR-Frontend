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
