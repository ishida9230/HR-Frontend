/**
 * 変更申請APIクライアント
 */

// バックエンドAPIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
 * APIエラーレスポンス型
 */
export interface ApiErrorResponse {
  error: {
    code: number;
    message: string;
    details?: unknown;
  };
}

import { ApiError } from "../errors/api-error";

/**
 * 変更申請を作成
 * @param request 変更申請作成リクエスト
 * @returns 変更申請レスポンス
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function createChangeRequest(request: CreateRequestRequest): Promise<RequestResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // CORSでクッキーを送信する場合
      body: JSON.stringify(request),
    });

    // statusが200以外の場合はエラーを投げる
    if (!response.ok) {
      let errorMessage: string = "変更申請の作成に失敗しました";
      let errorDetails: unknown;
      try {
        // エラーメッセージを取得
        const errorData: ApiErrorResponse = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        errorDetails = errorData.error?.details;
      } catch {
        // JSONパースに失敗した場合はデフォルトメッセージを使用
      }
      // エラーコードを含むApiErrorを投げる
      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    const data: RequestResponse = await response.json();
    return data;
  } catch (error) {
    // fetch自体が失敗した場合（ネットワークエラーなど）は500エラーとして扱う
    if (error instanceof ApiError) {
      throw error;
    }
    // ネットワークエラーなどの予期しないエラー
    throw new ApiError(
      500,
      "ネットワークエラーが発生しました。しばらくしてから再度お試しください。",
      error
    );
  }
}

/**
 * 変更申請詳細を取得
 * @param id 変更申請ID
 * @returns 変更申請レスポンス
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getChangeRequestById(id: number): Promise<RequestResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage: string = "変更申請の取得に失敗しました";
      let errorDetails: unknown;
      try {
        const errorData: ApiErrorResponse = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        errorDetails = errorData.error?.details;
      } catch {
        // JSONパースに失敗した場合はデフォルトメッセージを使用
      }
      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    const data: RequestResponse = await response.json();
    return data;
  } catch (error) {
    // fetch自体が失敗した場合（ネットワークエラーなど）は500エラーとして扱う
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "ネットワークエラーが発生しました。しばらくしてから再度お試しください。",
      error
    );
  }
}

/**
 * 変更申請を非表示にする
 * @param id 変更申請ID
 * @returns 非表示にされた変更申請レスポンス（{ id: number }）
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function hideChangeRequest(id: number): Promise<{ id: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/${id}/hide`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage: string = "申請の非表示に失敗しました";
      let errorDetails: unknown;
      try {
        const errorData: ApiErrorResponse = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        errorDetails = errorData.error?.details;
      } catch {
        // JSONパースに失敗した場合はデフォルトメッセージを使用
      }

      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    const data: { id: number } = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "ネットワークエラーが発生しました。しばらくしてから再度お試しください。",
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}
