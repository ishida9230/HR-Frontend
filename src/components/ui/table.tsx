"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * テーブルコンテナコンポーネント
 * 横スクロール可能なテーブルラッパー
 */
interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TableContainer({ children, className }: TableContainerProps) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}

/**
 * テーブルコンポーネント
 */
interface TableProps {
  children: React.ReactNode;
  className?: string;
  fixed?: boolean;
}

export function Table({ children, className, fixed = false }: TableProps) {
  return (
    <table
      className={cn("w-full bg-white", fixed && "table-fixed", className)}
      style={fixed ? { tableLayout: "fixed" } : undefined}
    >
      {children}
    </table>
  );
}

/**
 * テーブルヘッダーコンポーネント
 */
interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return <thead className={className}>{children}</thead>;
}

/**
 * テーブルヘッダー行コンポーネント
 */
interface TableHeaderRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeaderRow({ children, className }: TableHeaderRowProps) {
  return (
    <tr className={cn("border-b border-gray-200 bg-gray-50", className)}>
      {children}
    </tr>
  );
}

/**
 * テーブルヘッダーセルコンポーネント
 */
interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function TableHeaderCell({ children, className, width }: TableHeaderCellProps) {
  // widthが指定されている場合は、固定のクラス名を使用
  const widthClass = width
    ? {
        "20": "w-20",
        "32": "w-32",
        "45": "w-45",
      }[width] || ""
    : "";
  
  return (
    <th className={cn("px-4 py-3 text-left text-sm font-medium text-gray-600", widthClass, className)}>
      {children}
    </th>
  );
}

/**
 * テーブルボディコンポーネント
 */
interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

/**
 * テーブル行コンポーネント
 */
interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-gray-200 bg-white",
        onClick && "hover:bg-gray-50 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

/**
 * テーブルセルコンポーネント
 */
interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn("px-4 py-3 text-sm text-base font-medium", className)}>
      {children}
    </td>
  );
}
