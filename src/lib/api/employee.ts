/**
 * 従業員APIクライアント
 */

// バックエンドAPIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  hasPendingChangeRequest: boolean; // 変更申請があるかどうかのフラグ
  latestChangeRequestId: number | null; // 最新の変更申請ID（存在する場合）
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
  startDate: string; // ISO 8601形式
  endDate: string | null; // ISO 8601形式
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
 * 従業員プロフィールを取得
 * @param id 従業員ID
 * @returns 従業員プロフィール
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getEmployeeProfile(id: number): Promise<EmployeeProfileResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // CORSでクッキーを送信する場合
    });

    // statusが200以外の場合はエラーを投げる
    if (!response.ok) {
      let errorMessage: string = "従業員プロフィールの取得に失敗しました";
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

    const data: EmployeeProfileResponse = await response.json();
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
