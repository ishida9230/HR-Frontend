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
  items: Array<{
    id: number;
    fieldKey: string;
    oldValue: string | null;
    newValue: string | null;
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
