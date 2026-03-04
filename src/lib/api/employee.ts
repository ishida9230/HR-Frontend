/**
 * 従業員APIクライアント
 */

import { apiFetch } from "./api-client";

/**
 * 従業員プロフィールのレスポンス型
 * バックエンドのDTOと一致させる
 */
export interface EmployeeProfileResponse {
  id: number;
  employeeCode: number;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  address: string;
  phone: string;
  employmentType: "正社員" | "契約社員" | "業務委託";
  isActive: boolean;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  assignments: EmployeeAssignmentResponse[];
  hasPendingChangeRequest: boolean; // 完了、差し戻し以外のステータスがあるかどうか
  changeRequests: ChangeRequestInfo[]; // 非表示でない変更申請の全て（isHidden: false、ソート済み）
}

/**
 * 変更申請情報（簡易版）
 */
export interface ChangeRequestInfo {
  id: number;
  status: string;
  isHidden: boolean;
}

/**
 * 従業員所属情報のレスポンス型
 */
export interface EmployeeAssignmentResponse {
  id: number;
  employeeId: number;
  departmentId: number;
  branchId: number;
  positionId: number;
  superiorFlag: boolean;
  createdAt: string; // ISO 8601形式
  department: {
    id: number;
    name: string;
  };
  branch: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
  };
}

/**
 * 従業員プロフィールを取得
 * @param id 従業員ID
 * @returns 従業員プロフィール
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getEmployeeProfile(id: number): Promise<EmployeeProfileResponse> {
  return apiFetch<EmployeeProfileResponse>(`/api/employees/${id}`, {
    method: "GET",
    defaultErrorMessage: "従業員プロフィールの取得に失敗しました",
  });
}
