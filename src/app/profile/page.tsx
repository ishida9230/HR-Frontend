"use client";

import { useRouter } from "next/navigation";
import { useEmployeeProfile } from "@/hooks/use-employee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Stack } from "@/components/ui/stack";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";

export default function ProfilePage() {
  const router = useRouter();
  // 従業員IDは現在は1を固定値として使用（認証実装後は認証情報から取得）
  const { data: profile, isLoading } = useEmployeeProfile(1);

  const handleRequestChange = () => {
    router.push("/profile/edit");
  };

  if (!profile) {
    return null;
  }

  return (
    <Stack>
      <PageHeader
        title="プロフィール"
        action={
          <Button
            className="bg-blue-300 text-black hover:bg-blue-500"
            onClick={handleRequestChange}
            disabled={isLoading}
          >
            変更申請
          </Button>
        }
      />

      {/* プロフィールと所属情報 */}
      <LoadingWrapper isLoading={isLoading}>
        {/* プロフィール */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-200 pb-1">
            <CardTitle className="text-xl font-semibold">プロフィール</CardTitle>
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
  );
}
