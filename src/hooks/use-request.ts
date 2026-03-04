/**
 * 変更申請関連のReact Queryフック
 */

import { getChangeRequestById, RequestResponse } from "@/lib/api/request";
import { ApiError } from "@/lib/errors/api-error";
import { useApiQuery } from "./use-api-query";

/**
 * 変更申請を取得するReact Queryフック
 * @param id 変更申請ID
 * @param enabled クエリを有効にするかどうか（デフォルト: true）
 * @returns React Queryのクエリ結果
 */
export function useChangeRequest(id: number, enabled: boolean = true) {
  return useApiQuery<RequestResponse, ApiError>({
    queryKey: ["request", id],
    queryFn: () => getChangeRequestById(id),
    enabled: enabled && !isNaN(id),
  });
}
