/**
 * 共通のAPIクライアント関数
 */

// バックエンドAPIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
 * APIリクエストのオプション
 */
export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  defaultErrorMessage: string;
}

/**
 * 共通のfetch処理
 * @param endpoint APIエンドポイント（例: "/api/requests"）
 * @param options リクエストオプション
 * @returns レスポンスデータ
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function apiFetch<T>(endpoint: string, options: ApiRequestOptions): Promise<T> {
  try {
    const { method = "GET", body, defaultErrorMessage } = options;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // CORSでクッキーを送信する場合
      body: body ? JSON.stringify(body) : undefined,
    });

    // statusが200以外の場合はエラーを投げる
    if (!response.ok) {
      let errorMessage: string = defaultErrorMessage;
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

    const data: T = await response.json();
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
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}
