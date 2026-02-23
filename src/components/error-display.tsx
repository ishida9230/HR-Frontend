"use client";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/errors/api-error";
import { FallbackProps } from "react-error-boundary";
import {
  ERROR_TITLE_DEFAULT,
  ERROR_TITLE_NETWORK,
  ERROR_MESSAGE_VALIDATION,
  ERROR_MESSAGE_NOT_FOUND,
  ERROR_MESSAGE_NETWORK,
} from "@/lib/errors/error-messages";

/**
 * エラー表示コンポーネント（関数コンポーネント）
 * react-error-boundaryのFallbackComponentとして使用
 * 全てのエラーを画面全体に表示
 */
export function ErrorDisplay({ error }: FallbackProps) {
  if (!error) return null;

  // エラータイトルを取得
  const getErrorTitle = (error: Error): string => {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 400:
        case 404:
          return ERROR_TITLE_DEFAULT;
        case 500:
          return ERROR_TITLE_NETWORK;
        default:
          return ERROR_TITLE_NETWORK;
      }
    }
    return ERROR_TITLE_NETWORK;
  };

  // エラーメッセージを取得（APIから返されたメッセージを優先、なければデフォルト）
  const getErrorMessage = (error: Error): string => {
    if (error instanceof ApiError) {
      // APIから返されたメッセージがあり、かつ空文字列でない場合はそれを優先
      if (error.message && error.message !== "") {
        return error.message;
      }
    }
    return ERROR_MESSAGE_NETWORK;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          {getErrorTitle(error)}
        </h2>
        <p className="text-gray-600 text-center mb-6">{getErrorMessage(error)}</p>
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ページを再読み込み
          </Button>
        </div>
      </div>
    </div>
  );
}
