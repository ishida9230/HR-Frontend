"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useErrorBoundary } from "react-error-boundary";
import { useEmployeeProfile } from "@/hooks/use-employee";
import { hideChangeRequest } from "@/lib/api/request";
import { ApiError } from "@/lib/errors/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Stack } from "@/components/ui/stack";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { ErrorModal } from "@/components/ui/error-modal";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // 従業員IDは現在は1を固定値として使用（認証実装後は認証情報から取得）
  const { data: profile, isLoading } = useEmployeeProfile(1);
  const [isHidingRequest, setIsHidingRequest] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { showBoundary } = useErrorBoundary();

  const handleRequestChange = () => {
    router.push("/profile/requests/create");
  };

  const handleViewRequest = (requestId: number) => {
    router.push(`/profile/requests/${requestId}`);
  };

  const handleHideRequest = async (requestId: number) => {
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

  if (!profile) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="プロフィール"
        action={
          <Button
            className="bg-blue-300 text-black hover:bg-blue-500"
            onClick={handleRequestChange}
            disabled={isLoading || profile?.hasPendingChangeRequest}
          >
            変更申請
          </Button>
        }
      />
      <Stack>
        {/* 変更確認フィールド */}
        {profile?.changeRequests
          .filter((req) => !req.isHidden)
          .map((changeRequest) => {
            const status = changeRequest.status;

            // 差し戻しの場合
            if (status === "CHANGES_REQUESTED") {
              return (
                <Card key={changeRequest.id} className="bg-red-50 border-red-200 shadow-sm w-full">
                  <CardContent className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-red-900">
                            プロフィール変更が差し戻しされました。
                          </p>
                          <p className="text-sm text-red-700">
                            変更申請が差し戻しされました。詳細を確認できます。
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewRequest(changeRequest.id)}
                        className="bg-red-600 text-white hover:bg-red-700 flex-shrink-0"
                      >
                        確認
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // 完了の場合
            if (status === "COMPLETED") {
              return (
                <Card
                  key={changeRequest.id}
                  className="bg-green-50 border-green-200 shadow-sm w-full"
                >
                  <CardContent className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-green-900">
                            プロフィール変更承認されました。
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleHideRequest(changeRequest.id)}
                        className="bg-green-600 text-white hover:bg-green-700 flex-shrink-0"
                        disabled={isHidingRequest}
                      >
                        申請を非表示にする
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // その他（PENDING_MANAGER、PENDING_HR）は現状の仕様
            return (
              <Card
                key={changeRequest.id}
                className="bg-yellow-50 border-yellow-200 shadow-sm w-full"
              >
                <CardContent className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-900">プロフィール変更中</p>
                        <p className="text-sm text-yellow-700">
                          変更申請が承認待ちです。詳細を確認できます。
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewRequest(changeRequest.id)}
                      className="bg-yellow-600 text-white hover:bg-yellow-700 flex-shrink-0"
                    >
                      確認
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {/* プロフィールと所属情報 */}
        <LoadingWrapper isLoading={isLoading}>
          {/* プロフィール */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-200 pb-1">
              <CardTitle className="text-xl font-semibold">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 ">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">氏名</Label>
                  <div className="text-base font-medium bg-gray-50 px-3 py-2 rounded-md break-words">
                    {profile.lastName} {profile.firstName}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">雇用形態</Label>
                  <div className="text-base font-medium bg-gray-50 px-3 py-2 rounded-md break-words">
                    {profile.employmentType}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">メールアドレス</Label>
                  <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                    {profile.email}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">電話番号</Label>
                  <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                    {profile.phone}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-600">郵便番号</Label>
                  <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                    {profile.postalCode}
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600">住所</Label>
                  <div className="text-base bg-gray-50 px-3 py-2 rounded-md break-words">
                    {profile.address}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 所属情報 */}
          <Card className="bg-white shadow-sm border-gray-200 mt-6">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl font-semibold">所属情報</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
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
            </CardContent>
          </Card>
        </LoadingWrapper>
      </Stack>

      {error && (
        <ErrorModal
          open={!!error}
          onOpenChange={(open) => {
            if (!open) {
              setError(null);
            }
          }}
          title="エラー"
          message={error.message || "申請の非表示に失敗しました"}
        />
      )}
    </>
  );
}
