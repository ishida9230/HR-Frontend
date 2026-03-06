/**
 * 空状態表示コンポーネント
 * データが存在しない場合に表示するメッセージ
 */

interface EmptyStateProps {
  /**
   * 表示するメッセージ
   * @default "データが見つかりませんでした"
   */
  message?: string;
  /**
   * カラム数（テーブルのcolSpanに使用）
   * @default 1
   */
  colSpan?: number;
  /**
   * 追加のクラス名
   */
  className?: string;
}

export function EmptyState({ message = "データが見つかりませんでした", colSpan = 1, className = "" }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={`px-4 py-8 text-center text-muted-foreground ${className}`}>
        {message}
      </td>
    </tr>
  );
}
