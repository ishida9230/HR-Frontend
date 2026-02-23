/**
 * 従業員関連のReact Queryフック
 */

import { useQuery } from "@tanstack/react-query";
import { getEmployeeProfile, EmployeeProfileResponse } from "@/lib/api/employee";
import { ApiError } from "@/lib/errors/api-error";

/**
 * 従業員プロフィールを取得するReact Queryフック
 * @param id 従業員ID
 * @param enabled クエリを有効にするかどうか（デフォルト: true）
 * @returns React Queryのクエリ結果
 */
export function useEmployeeProfile(id: number | null, enabled: boolean = true) {
  return useQuery<EmployeeProfileResponse, ApiError>({
    queryKey: ["employee", "profile", id],
    queryFn: () => {
      if (id === null) {
        throw new ApiError(400, "従業員IDが指定されていません");
      }
      return getEmployeeProfile(id);
    },
    enabled: enabled && id !== null,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    throwOnError: true, // エラーをエラーバウンダリーに伝播
  });
}
