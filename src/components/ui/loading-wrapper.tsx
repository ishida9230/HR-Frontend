/**
 * ローディング状態を管理する再利用可能なラッパーコンポーネント
 * ローディング中は背景が変わってローディングマークが回転します
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingWrapperProps {
  /**
   * ローディング状態
   */
  isLoading: boolean;
  /**
   * ローディング完了後に表示するコンテンツ
   */
  children: ReactNode;
  /**
   * 追加のクラス名
   */
  className?: string;
  /**
   * ローディング中の背景の不透明度（0-1、デフォルト: 0.5）
   */
  overlayOpacity?: number;
  /**
   * カスタムローディングコンポーネント（オプション）
   */
  customLoader?: ReactNode;
}

/**
 * ローディング状態を管理するラッパーコンポーネント
 *
 * @example
 * ```tsx
 * <LoadingWrapper isLoading={isLoading}>
 *   <ProfileContent data={data} />
 * </LoadingWrapper>
 * ```
 */
export function LoadingWrapper({
  isLoading,
  children,
  className,
  overlayOpacity = 0.5,
  customLoader,
}: LoadingWrapperProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {isLoading && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center min-h-[200px]"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity * 0.1})` }}
        >
          <div className="flex items-center justify-center">
            {customLoader || <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          </div>
        </div>
      )}
      <div className={cn("w-full", isLoading && "opacity-50 pointer-events-none")}>{children}</div>
    </div>
  );
}
