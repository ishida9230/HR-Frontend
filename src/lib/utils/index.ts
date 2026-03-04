/**
 * 変更申請のステータス関連のユーティリティ関数
 */

/**
 * ステータスの表示名を取得
 */
export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING_MANAGER: "上長承認待ち",
    PENDING_HR: "人事承認待ち",
    CHANGES_REQUESTED: "差し戻し",
    COMPLETED: "完了",
  };
  return statusMap[status] || status;
}

/**
 * ステータスのバッジ色を取得
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING_MANAGER: "bg-yellow-100 text-yellow-800",
    PENDING_HR: "bg-blue-100 text-blue-800",
    CHANGES_REQUESTED: "bg-red-100 text-red-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}

/**
 * フィールド名の表示名を取得
 */
export function getFieldLabel(fieldKey: string): string {
  const fieldMap: Record<string, string> = {
    firstName: "名",
    lastName: "姓",
    email: "メールアドレス",
    phone: "電話番号",
    postalCode: "郵便番号",
    address: "住所",
    assignments: "所属情報",
  };
  return fieldMap[fieldKey] || fieldKey;
}
