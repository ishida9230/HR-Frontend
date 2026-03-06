"use client";

import { Button } from "./button";

interface PaginationProps {
  /**
   * 現在のページ番号
   */
  currentPage: number;
  /**
   * 総ページ数
   */
  totalPages: number;
  /**
   * ページ変更時のコールバック
   */
  onPageChange: (page: number) => void;
  /**
   * 追加のクラス名
   */
  className?: string;
}

/**
 * ページネーションコンポーネント
 * 現在のページの前後2ページまで表示し、それ以外は省略記号で表示
 */
export function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // 表示するページ番号を計算
  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    // 現在のページの前後2ページまで表示
    return Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages;
  });

  return (
    <div className={`mt-4 flex justify-center gap-2 ${className}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
      >
        前へ
      </Button>
      <div className="flex items-center gap-2">
        {visiblePages.map((p, index) => {
          const prev = visiblePages[index - 1];
          const showEllipsis = prev && p - prev > 1;
          return (
            <div key={p} className="flex items-center gap-1">
              {showEllipsis && <span className="px-2">...</span>}
              <Button
                variant={p === currentPage ? "default" : "outline"}
                onClick={() => onPageChange(p)}
                className={`min-w-[2.5rem] ${
                  p !== currentPage ? "bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black" : ""
                }`}
              >
                {p}
              </Button>
            </div>
          );
        })}
      </div>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
      >
        次へ
      </Button>
    </div>
  );
}
