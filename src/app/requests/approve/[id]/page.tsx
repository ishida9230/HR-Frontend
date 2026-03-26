"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useErrorBoundary } from "react-error-boundary";
import { useRequestForApproval, useProcessRequestAction } from "@/hooks/use-request";
import { useEmployeeProfile } from "@/hooks/use-employee";
import { AssignmentsFormattedResponse } from "@/lib/api/request";
import { ApiError } from "@/lib/errors/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stack } from "@/components/ui/stack";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { ErrorModal } from "@/components/ui/error-modal";
import { getStatusLabel, getStatusColor } from "@/lib/utils/index";
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

/**
 * 日付をフォーマット（YYYY年MM月DD日 HH:mm）
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "（未設定）";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export default function RequestApprovePage() {
  const params = useParams();
  const router = useRouter();
  const requestId = parseInt(params.id as string, 10);
  const [error, setError] = useState<ApiError | null>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const { showBoundary } = useErrorBoundary();

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: queryError,
  } = useRequestForApproval(requestId, !isNaN(requestId));

  // 従業員プロフィールを取得
  const {
    data: profile,
    isLoading: isLoadingProfile,
  } = useEmployeeProfile(request?.employeeId || 0, !!request?.employeeId);

  const actionMutation = useProcessRequestAction();

  useEffect(() => {
    if (queryError) {
      setError(queryError);
    }
  }, [queryError]);

  // 早期リターンはフックの後
  if (isNaN(requestId)) {
    return null;
  }

  const isLoading = isLoadingRequest || isLoadingProfile;

  const handleBack = () => {
    router.push("/requests/list");
  };

  const handleApprove = async () => {
    // 承認者IDは現在は1を固定値として使用（認証実装後は認証情報から取得）
    const actedByEmployeeId = 1;

    // 次のステータスを計算
    const currentStatus = request?.status || "";
    let nextStatus: string;
    if (currentStatus === "PENDING_MANAGER") {
      nextStatus = "PENDING_HR";
    } else {
      nextStatus = "COMPLETED";
    }

    try {
      await actionMutation.mutateAsync({
        id: requestId,
        request: {
          status: nextStatus,
          actedByEmployeeId,
        },
      });
      toast.success("申請を承認しました。");
      router.push("/requests/list");
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
    }
  };

  const handleReject = async () => {
    // 差し戻し者IDは現在は1を固定値として使用（認証実装後は認証情報から取得）
    const actedByEmployeeId = 1;

    // バリデーション: コメントが必須
    if (!comment.trim()) {
      setCommentError("差し戻し理由を入力してください。");
      toast.error("差し戻し理由を入力してください。");
      return;
    }

    // バリデーションエラーをクリア
    setCommentError(null);

    // 次のステータスは常にCHANGES_REQUESTED
    const nextStatus = "CHANGES_REQUESTED";

    try {
      await actionMutation.mutateAsync({
        id: requestId,
        request: {
          status: nextStatus,
          comment: comment,
          actedByEmployeeId,
        },
      });
      toast.success("申請を差し戻しました。");
      router.push("/requests/list");
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
    }
  };

  const status = request?.status || "";
  const isPending = status === "PENDING_MANAGER" || status === "PENDING_HR";
  const isChangesRequested = status === "CHANGES_REQUESTED";
  const isCompleted = status === "COMPLETED";
  const canApprove = isPending;
  const canReject = isPending;
  const showCommentForm = canReject; // 差し戻し可能な場合のみコメントフォームを表示

  // 変更された項目のfieldKeyを取得
  const changedFieldKeys = useMemo(() => {
    if (!request?.items) return new Set<string>();
    return new Set(request.items.map((item) => item.fieldKey));
  }, [request?.items]);

  // 氏名の変更項目を取得
  const nameChangeItem = useMemo(() => {
    if (!request?.items) return null;
    const lastNameItem = request.items.find((item) => item.fieldKey === "lastName");
    const firstNameItem = request.items.find((item) => item.fieldKey === "firstName");
    if (lastNameItem || firstNameItem) {
      return { lastNameItem, firstNameItem };
    }
    return null;
  }, [request?.items]);

  // 所属情報の変更項目を取得
  const assignmentsChangeItem = useMemo(() => {
    if (!request?.items) return null;
    return request.items.find((item) => item.fieldKey === "assignments") || null;
  }, [request?.items]);

  if (!request || !profile) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="申請承認"
        action={
          <Button
            variant="outline"
            onClick={handleBack}
            className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
          >
            戻る
          </Button>
        }
      />
      <LoadingWrapper isLoading={isLoading}>
        <Stack>
          {/* ステータス表示と承認・差し戻しボタン */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </span>
                </div>
                {/* 上長承認待ち、人事承認待ちの場合のみボタンを表示 */}
                {canApprove && (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={actionMutation.isPending}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      差し戻し
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={actionMutation.isPending}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      承認
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 前回の承認情報（上長承認待ち、人事承認待ち、差し戻しの場合に表示） */}
          {(isPending || isChangesRequested) && request.previousApproval && (
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-200 pb-1">
                <CardTitle className="text-xl font-semibold">前回の承認情報</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">承認日</Label>
                    <div className="text-base mt-1">
                      {formatDate(request.previousApproval.actedAt)}
                    </div>
                  </div>
                  {request.previousApproval.actedBy && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">承認者</Label>
                      <div className="text-base mt-1">
                        {request.previousApproval.actedBy.firstName}{" "}
                        {request.previousApproval.actedBy.lastName}
                      </div>
                    </div>
                  )}
                  {request.previousApproval.comment && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">コメント</Label>
                      <div className="text-base mt-1 bg-gray-50 px-3 py-2 rounded-md break-words">
                        {request.previousApproval.comment}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 基本情報 */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-200 pb-1">
              <CardTitle className="text-xl font-semibold">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 氏名 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">氏名</Label>
                  {nameChangeItem ? (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-500 block mb-1">変更前</Label>
                        <div className="text-base font-medium bg-gray-50 px-3 py-2 rounded-md break-words">
                          {`${nameChangeItem.lastNameItem?.oldValue || ""} ${nameChangeItem.firstNameItem?.oldValue || ""}`.trim() ||
                            "（未設定）"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 block mb-1">変更後</Label>
                        <div className="text-base font-medium bg-blue-50 px-3 py-2 rounded-md break-words">
                          {`${nameChangeItem.lastNameItem?.newValue || ""} ${nameChangeItem.firstNameItem?.newValue || ""}`.trim() ||
                            "（未設定）"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-base font-medium bg-gray-50 px-3 py-2 rounded-md break-words">
                      {profile.lastName} {profile.firstName}
                    </div>
                  )}
                </div>

                {/* 雇用形態 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">雇用形態</Label>
                  <div className="text-base font-medium bg-gray-50 px-3 py-2 rounded-md break-words">
                    {profile.employmentType}
                  </div>
                </div>

                {/* メールアドレス */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">メールアドレス</Label>
                  {changedFieldKeys.has("email") ? (
                    (() => {
                      const emailItem = request.items.find((item) => item.fieldKey === "email");
                      return (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更前</Label>
                            <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                              {emailItem?.oldValue || "（未設定）"}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更後</Label>
                            <div className="text-base bg-blue-50 px-3 py-2 rounded-md break-words">
                              {emailItem?.newValue || "（未設定）"}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                      {profile.email}
                    </div>
                  )}
                </div>

                {/* 電話番号 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">電話番号</Label>
                  {changedFieldKeys.has("phone") ? (
                    (() => {
                      const phoneItem = request.items.find((item) => item.fieldKey === "phone");
                      return (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更前</Label>
                            <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                              {phoneItem?.oldValue || "（未設定）"}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更後</Label>
                            <div className="text-base bg-blue-50 px-3 py-2 rounded-md break-words">
                              {phoneItem?.newValue || "（未設定）"}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                      {profile.phone}
                    </div>
                  )}
                </div>

                {/* 郵便番号 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">郵便番号</Label>
                  {changedFieldKeys.has("postalCode") ? (
                    (() => {
                      const postalCodeItem = request.items.find((item) => item.fieldKey === "postalCode");
                      return (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更前</Label>
                            <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                              {postalCodeItem?.oldValue || "（未設定）"}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更後</Label>
                            <div className="text-base bg-blue-50 px-3 py-2 rounded-md break-words">
                              {postalCodeItem?.newValue || "（未設定）"}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                      {profile.postalCode}
                    </div>
                  )}
                </div>

                {/* 住所 */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600">住所</Label>
                  {changedFieldKeys.has("address") ? (
                    (() => {
                      const addressItem = request.items.find((item) => item.fieldKey === "address");
                      return (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更前</Label>
                            <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                              {addressItem?.oldValue || "（未設定）"}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 block mb-1">変更後</Label>
                            <div className="text-base bg-blue-50 px-3 py-2 rounded-md break-words">
                              {addressItem?.newValue || "（未設定）"}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                      {profile.address}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 所属情報 */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-200 pb-1">
              <CardTitle className="text-xl font-semibold">所属情報</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {assignmentsChangeItem ? (
                <div className="space-y-4">
                  {/* 変更前 */}
                  <div>
                    <Label className="text-xs text-gray-500 block mb-2">変更前</Label>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 bg-gray-50 p-4 rounded-md">
                      {(() => {
                        const oldAssignments = formatAssignments(assignmentsChangeItem.oldValue);
                        return (
                          <>
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-600 block">支店</Label>
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
                              <Label className="text-sm font-medium text-gray-600 block">部署</Label>
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
                              <Label className="text-sm font-medium text-gray-600 block">役職</Label>
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
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {/* 変更後 */}
                  <div>
                    <Label className="text-xs text-gray-500 block mb-2">変更後</Label>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 bg-blue-50 p-4 rounded-md">
                      {(() => {
                        const newAssignments = formatAssignments(assignmentsChangeItem.newValue);
                        return (
                          <>
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-600 block">支店</Label>
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
                              <Label className="text-sm font-medium text-gray-600 block">部署</Label>
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
                              <Label className="text-sm font-medium text-gray-600 block">役職</Label>
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
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-600 block">支店</Label>
                    <div className="space-y-2">
                      {profile.assignments.length > 0 &&
                        Array.from(new Set(profile.assignments.map((a) => a.branch.name))).map(
                          (branch, index) => (
                            <div
                              key={index}
                              className="text-base bg-gray-50 px-3 py-2 rounded-md break-words"
                            >
                              {branch}
                            </div>
                          )
                        )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-600 block">部署</Label>
                    <div className="space-y-2">
                      {profile.assignments.length > 0 &&
                        Array.from(new Set(profile.assignments.map((a) => a.department.name))).map(
                          (dept, index) => (
                            <div
                              key={index}
                              className="text-base bg-gray-50 px-3 py-2 rounded-md break-words"
                            >
                              {dept}
                            </div>
                          )
                        )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-600 block">役職</Label>
                    <div className="space-y-2">
                      {profile.assignments.length > 0 &&
                        Array.from(new Set(profile.assignments.map((a) => a.position.name))).map(
                          (position, index) => (
                            <div
                              key={index}
                              className="text-base bg-gray-50 px-3 py-2 rounded-md break-words"
                            >
                              {position}
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* コメントフォーム */}
          {showCommentForm && (
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-200 pb-1">
                <CardTitle className="text-xl font-semibold">差し戻し理由</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="comment" className="text-sm font-medium text-gray-600">
                      差し戻し理由 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        // 入力時にエラーをクリア
                        if (commentError) {
                          setCommentError(null);
                        }
                      }}
                      placeholder="差し戻しの場合のみコメントしてください"
                      rows={5}
                      className={`mt-2 ${commentError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {commentError && (
                      <p className="text-sm text-red-500 mt-1">{commentError}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </Stack>
      </LoadingWrapper>

      {/* エラーモーダル */}
      <ErrorModal
        open={!!error}
        onOpenChange={(open) => {
          if (!open) setError(null);
        }}
        title="エラー"
        message={error?.message || "エラーが発生しました"}
      />
    </>
  );
}
