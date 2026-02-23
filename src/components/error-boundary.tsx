"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorDisplay } from "./error-display";

interface Props {
  children: React.ReactNode;
}

/**
 * エラーバウンダリーコンポーネント（関数コンポーネント風の実装）
 * react-error-boundaryライブラリを使用して関数コンポーネント風に実装
 * データ取得エラーを含む全てのエラーを画面全体に表示
 */
export function ErrorBoundary({ children }: Props) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorDisplay}
      onError={(error, errorInfo) => {
        // 全てのエラーをログに出力
        console.error("エラーが発生しました:", error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
