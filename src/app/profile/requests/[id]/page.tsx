"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useErrorBoundary } from "react-error-boundary";
import {
  hideChangeRequest,
  AssignmentsFormattedResponse,
} from "@/lib/api/request";
import { useChangeRequest } from "@/hooks/use-request";
import { ApiError } from "@/lib/errors/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Stack } from "@/components/ui/stack";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { ErrorModal } from "@/components/ui/error-modal";
import { getStatusLabel, getStatusColor, getFieldLabel } from "@/lib/utils/index";
import { toast } from "sonner";

/**
 * 所属情報をフォーマット（プロフィールページと同じ形式）
 * @param value AssignmentsFormattedResponseのJSON文字列またはnull
 * @returns プロフィールページと同じ形式のデータ構造（名前の配列）
 */
function formatAssignments(value: string | null): {
  branches: string[];
  departments: string[];
  positions: string[];
} {
  if (!value) {
    return { branches: [], departments: [], positions: [] };
  }
  try {
    const formatted: AssignmentsFormattedResponse = JSON.parse(value);

    // 名前の配列に変換
    const branches = formatted.branches?.map((b: { id: number; name: string }) => b.name) || [];
    const departments =
      formatted.departments?.map((d: { id: number; name: string }) => d.name) || [];
    const positions = formatted.positions?.map((p: { id: number; name: string }) => p.name) || [];

    return { branches, departments, positions };
  } catch {
    throw new ApiError(400, "データ表示に失敗しました。しばらくしてから再度お試しください。", null);
  }
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = parseInt(params.id as string, 10);
  const [error, setError] = useState<ApiError | null>(null);
  const queryClient = useQueryClient();
  const [isHidingRequest, setIsHidingRequest] = useState(false);
  const { showBoundary } = useErrorBoundary();

  // フックは早期リターンの前に呼ぶ（React Hooksのルール）
  const {
    data: request,
    isLoading,
    error: queryError,
  } = useChangeRequest(requestId, !isNaN(requestId));

  useEffect(() => {
    if (queryError) {
      setError(queryError);
    }
  }, [queryError]);

  // 早期リターンはフックの後
  if (isNaN(requestId)) {
    return null;
  }

  const handleBack = () => {
    router.push("/profile");
  };

  const handleHideRequest = async () => {
    setIsHidingRequest(true);
    try {
      await hideChangeRequest(requestId);
      toast.success("申請を非表示にしました。");
      // プロフィールデータのキャッシュを無効化して再取得
      await queryClient.invalidateQueries({
        queryKey: ["employee", "profile", 1],
      });
      // 明示的に再取得を実行
      await queryClient.refetchQueries({
        queryKey: ["employee", "profile", 1],
      });
      // データ更新後に遷移
      router.push("/profile");
    } catch (error) {
      if (error instanceof ApiError) {
        // 400系エラー：エラーモーダルを表示
        if (error.code >= 400 && error.code < 500) {
          setError(error);
        } else {
          // 500系エラー：エラーバウンダリーに伝播
          showBoundary(error);
        }
      } else {
        // 予期しないエラー：エラーバウンダリーに伝播
        showBoundary(error as Error);
      }
    } finally {
      setIsHidingRequest(false);
    }
  };

  return (
    <>
      <PageHeader
        title="変更申請詳細"
        action={
          <div className="flex gap-2">
            {request?.status === "CHANGES_REQUESTED" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
                >
                  戻る
                </Button>
                <Button
                  variant="outline"
                  onClick={handleHideRequest}
                  className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
                  disabled={isHidingRequest}
                >
                  申請を非表示にする
                </Button>
                <Button
                  onClick={() => router.push("/profile/requests/create")}
                  className="bg-blue-300 text-black hover:bg-blue-500"
                >
                  再度申請
                </Button>
              </>
            )}
            {request?.status === "COMPLETED" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
                >
                  戻る
                </Button>
                <Button
                  variant="outline"
                  onClick={handleHideRequest}
                  className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
                  disabled={isHidingRequest}
                >
                  申請を非表示にする
                </Button>
              </>
            )}
            {request?.status !== "CHANGES_REQUESTED" && request?.status !== "COMPLETED" && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
              >
                戻る
              </Button>
            )}
          </div>
        }
      />
      <Stack>
        <LoadingWrapper isLoading={isLoading}>
          {request && (
            <>
              {/* ステータス */}
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader className="border-b border-gray-200 pb-1">
                  <CardTitle className="text-xl font-semibold">申請状況</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                    <span className="text-sm text-gray-600">
                      申請日: {new Date(request.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 変更内容 */}
              <Card className="bg-white shadow-sm border-gray-200 mt-6">
                <CardHeader className="border-b border-gray-200 pb-1">
                  <CardTitle className="text-xl font-semibold">変更内容</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {request.items.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* 氏名の処理（firstNameとlastNameを結合） */}
                      {(() => {
                        const lastNameItem = request.items.find(
                          (item) => item.fieldKey === "lastName"
                        );
                        const firstNameItem = request.items.find(
                          (item) => item.fieldKey === "firstName"
                        );
                        const hasNameChange = lastNameItem || firstNameItem;

                        if (hasNameChange) {
                          return (
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-sm font-medium text-gray-600">氏名</Label>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs text-gray-500 block mb-1">変更前</Label>
                                  <div className="text-base font-medium bg-gray-50 px-3 py-2 rounded-md break-words">
                                    {`${lastNameItem?.oldValue || ""} ${firstNameItem?.oldValue || ""}`.trim() ||
                                      "（未設定）"}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500 block mb-1">変更後</Label>
                                  <div className="text-base font-medium bg-blue-50 px-3 py-2 rounded-md break-words">
                                    {`${lastNameItem?.newValue || ""} ${firstNameItem?.newValue || ""}`.trim() ||
                                      "（未設定）"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* 所属情報の処理（特別な表示形式） */}
                      {(() => {
                        const assignmentsItem = request.items.find(
                          (item) => item.fieldKey === "assignments"
                        );
                        if (assignmentsItem) {
                          const oldAssignments = formatAssignments(assignmentsItem.oldValue);
                          const newAssignments = formatAssignments(assignmentsItem.newValue);
                          return (
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-sm font-medium text-gray-600">所属情報</Label>
                              <div className="space-y-4">
                                {/* 変更前 */}
                                <div>
                                  <Label className="text-xs text-gray-500 block mb-2">変更前</Label>
                                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3 bg-gray-50 p-4 rounded-md">
                                    <div className="space-y-3">
                                      <Label className="text-sm font-medium text-gray-600 block">
                                        支店
                                      </Label>
                                      <div className="space-y-2">
                                        {oldAssignments.branches.length > 0 ? (
                                          oldAssignments.branches.map((branch, index) => (
                                            <div
                                              key={index}
                                              className="text-base bg-white px-3 py-2 rounded-md break-words"
                                            >
                                              {branch}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-base text-gray-400">（未設定）</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-sm font-medium text-gray-600 block">
                                        部署
                                      </Label>
                                      <div className="space-y-2">
                                        {oldAssignments.departments.length > 0 ? (
                                          oldAssignments.departments.map((dept, index) => (
                                            <div
                                              key={index}
                                              className="text-base bg-white px-3 py-2 rounded-md break-words"
                                            >
                                              {dept}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-base text-gray-400">（未設定）</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-sm font-medium text-gray-600 block">
                                        役職
                                      </Label>
                                      <div className="space-y-2">
                                        {oldAssignments.positions.length > 0 ? (
                                          oldAssignments.positions.map((position, index) => (
                                            <div
                                              key={index}
                                              className="text-base bg-white px-3 py-2 rounded-md break-words"
                                            >
                                              {position}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-base text-gray-400">（未設定）</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* 変更後 */}
                                <div>
                                  <Label className="text-xs text-gray-500 block mb-2">変更後</Label>
                                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3 bg-blue-50 p-4 rounded-md">
                                    <div className="space-y-3">
                                      <Label className="text-sm font-medium text-gray-600 block">
                                        支店
                                      </Label>
                                      <div className="space-y-2">
                                        {newAssignments.branches.length > 0 ? (
                                          newAssignments.branches.map((branch, index) => (
                                            <div
                                              key={index}
                                              className="text-base bg-white px-3 py-2 rounded-md break-words"
                                            >
                                              {branch}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-base text-gray-400">（未設定）</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-sm font-medium text-gray-600 block">
                                        部署
                                      </Label>
                                      <div className="space-y-2">
                                        {newAssignments.departments.length > 0 ? (
                                          newAssignments.departments.map((dept, index) => (
                                            <div
                                              key={index}
                                              className="text-base bg-white px-3 py-2 rounded-md break-words"
                                            >
                                              {dept}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-base text-gray-400">（未設定）</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-sm font-medium text-gray-600 block">
                                        役職
                                      </Label>
                                      <div className="space-y-2">
                                        {newAssignments.positions.length > 0 ? (
                                          newAssignments.positions.map((position, index) => (
                                            <div
                                              key={index}
                                              className="text-base bg-white px-3 py-2 rounded-md break-words"
                                            >
                                              {position}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-base text-gray-400">（未設定）</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* その他のフィールド（氏名・所属情報以外） */}
                      {(() => {
                        // プロフィールページと同じ表示順序を定義
                        const fieldOrder: Record<string, number> = {
                          email: 1,
                          phone: 2,
                          postalCode: 3,
                          address: 4,
                          salary: 5,
                        };
                        
                        return request.items
                          .filter(
                            (item) =>
                              item.fieldKey !== "firstName" &&
                              item.fieldKey !== "lastName" &&
                              item.fieldKey !== "assignments"
                          )
                          .sort((a, b) => {
                            const orderA = fieldOrder[a.fieldKey] ?? 999;
                            const orderB = fieldOrder[b.fieldKey] ?? 999;
                            return orderA - orderB;
                          })
                          .map((item) => {
                            // 住所は全幅表示
                            const isFullWidth = item.fieldKey === "address";
                            return (
                              <div
                                key={item.id}
                                className={`space-y-1.5 ${isFullWidth ? "md:col-span-2" : ""}`}
                              >
                                <Label className="text-sm font-medium text-gray-600">
                                  {getFieldLabel(item.fieldKey)}
                                </Label>
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-xs text-gray-500 block mb-1">
                                      変更前
                                    </Label>
                                    <div className="text-base px-3 py-2 rounded-md break-words bg-gray-50">
                                      {item.oldValue || "（未設定）"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500 block mb-1">
                                      変更後
                                    </Label>
                                    <div className="text-base px-3 py-2 rounded-md break-words bg-blue-50">
                                      {item.newValue || "（未設定）"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  ) : (
                    <p className="text-gray-500">変更項目がありません</p>
                  )}
                </CardContent>
              </Card>

              {/* 備考 */}
              {request.text && (
                <Card className="bg-white shadow-sm border-gray-200 mt-6">
                  <CardHeader className="border-b border-gray-200 pb-1">
                    <CardTitle className="text-xl font-semibold">備考</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words whitespace-pre-wrap">
                      {request.text}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </LoadingWrapper>
      </Stack>

      {error && (
        <ErrorModal
          open={!!error}
          onOpenChange={(open) => {
            if (!open) {
              setError(null);
              router.push("/profile");
            }
          }}
          title="エラー"
          message={error.message || "変更申請の取得に失敗しました"}
        />
      )}
    </>
  );
}
