/**
 * 従業員関連のReact Queryフック
 */

import { getEmployeeProfile, EmployeeProfileResponse } from "@/lib/api/employee";
import { ApiError } from "@/lib/errors/api-error";
import { useApiQuery } from "./use-api-query";

/**
 * 従業員プロフィールを取得するReact Queryフック
 * @param id 従業員ID
 * @param enabled クエリを有効にするかどうか（デフォルト: true）
 * @returns React Queryのクエリ結果
 */
export function useEmployeeProfile(id: number, enabled: boolean = true) {
  return useApiQuery<EmployeeProfileResponse, ApiError>({
    queryKey: ["employee", "profile", id],
    queryFn: () => getEmployeeProfile(id),
    enabled: enabled,
  });
}
