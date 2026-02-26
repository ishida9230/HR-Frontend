"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useEmployeeProfile } from "@/hooks/use-employee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stack } from "@/components/ui/stack";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { ErrorModal } from "@/components/ui/error-modal";
import { mockDepartments, mockBranches, mockPositions } from "@/lib/mocks/masters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createChangeRequest, CreateRequestRequest } from "@/lib/api/request";
import { ApiError } from "@/lib/errors/api-error";
import { toast } from "sonner";

// フォームスキーマ定義
const profileEditSchema = z.object({
  firstName: z.string().min(1, "名を入力してください"),
  lastName: z.string().min(1, "姓を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().min(1, "電話番号を入力してください"),
  postalCode: z.string().min(1, "郵便番号を入力してください"),
  address: z.string().min(1, "住所を入力してください"),
  assignments: z
    .array(
      z.object({
        branchId: z.number().min(1, "支店を選択してください"),
        departmentId: z.number().min(1, "部署を選択してください"),
        positionId: z.number().min(1, "役職を選択してください"),
      })
    )
    .min(1, "所属情報を1つ以上入力してください"),
  changeReason: z.string().min(1, "変更内容を入力してください"),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  // 従業員IDは現在は1を固定値として使用（認証実装後は認証情報から取得）
  const { data: profile, isLoading } = useEmployeeProfile(1);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
  });

  // プロフィールデータが読み込まれたらフォームに初期値を設定
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        postalCode: profile.postalCode,
        address: profile.address,
        assignments: profile.assignments.map((a) => ({
          branchId: a.branchId,
          departmentId: a.departmentId,
          positionId: a.positionId,
        })),
        changeReason: "",
      });
    }
  }, [profile, reset]);

  const assignments = watch("assignments") || [];

  const handleAssignmentChange = (
    index: number,
    field: "branchId" | "departmentId" | "positionId",
    value: string
  ) => {
    const updated = [...assignments];
    updated[index] = {
      ...updated[index],
      [field]: parseInt(value, 10),
    };
    setValue("assignments", updated);
  };

  const handleAddAssignment = () => {
    const updated = [...assignments, { branchId: 0, departmentId: 0, positionId: 0 }];
    setValue("assignments", updated);
  };

  const handleRemoveAssignment = (index: number) => {
    const updated = assignments.filter((_, i) => i !== index);
    setValue("assignments", updated);
  };

  const onSubmit = async (data: ProfileEditFormData) => {
    if (!profile) {
      return;
    }

    setIsSubmittingRequest(true);

    try {
      // 変更されたフィールドを検出
      const items: CreateRequestRequest["items"] = [];

      // 基本情報の変更を検出
      if (data.firstName !== profile.firstName) {
        items.push({
          fieldKey: "firstName",
          oldValue: profile.firstName,
          newValue: data.firstName,
        });
      }
      if (data.lastName !== profile.lastName) {
        items.push({
          fieldKey: "lastName",
          oldValue: profile.lastName,
          newValue: data.lastName,
        });
      }
      if (data.email !== profile.email) {
        items.push({
          fieldKey: "email",
          oldValue: profile.email,
          newValue: data.email,
        });
      }
      if (data.phone !== profile.phone) {
        items.push({
          fieldKey: "phone",
          oldValue: profile.phone,
          newValue: data.phone,
        });
      }
      if (data.postalCode !== profile.postalCode) {
        items.push({
          fieldKey: "postalCode",
          oldValue: profile.postalCode,
          newValue: data.postalCode,
        });
      }
      if (data.address !== profile.address) {
        items.push({
          fieldKey: "address",
          oldValue: profile.address,
          newValue: data.address,
        });
      }

      // 所属情報の変更を検出
      const oldAssignments = profile.assignments.map((a) => ({
        branchId: a.branchId,
        departmentId: a.departmentId,
        positionId: a.positionId,
      }));
      const newAssignments = data.assignments;
      const oldAssignmentsStr = JSON.stringify(
        oldAssignments.sort((a, b) => a.branchId - b.branchId)
      );
      const newAssignmentsStr = JSON.stringify(
        newAssignments.sort((a, b) => a.branchId - b.branchId)
      );
      if (oldAssignmentsStr !== newAssignmentsStr) {
        items.push({
          fieldKey: "assignments",
          oldValue: JSON.stringify(oldAssignments),
          newValue: JSON.stringify(newAssignments),
        });
      }

      // 変更がない場合はトースト通知を表示
      if (items.length === 0) {
        toast.info("変更がありません。");
        router.push("/profile");
        return;
      }

      // API呼び出し
      const request: CreateRequestRequest = {
        employeeId: profile.id,
        text: data.changeReason,
        items,
      };

      await createChangeRequest(request);

      // 成功時：トースト表示→プロフィール画面遷移
      toast.success("変更申請が送信されました");
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("エラー:", error);

      // エラーハンドリング
      if (error instanceof ApiError) {
        // 400系エラー：エラーモーダルを表示
        if (error.code >= 400 && error.code < 500) {
          setErrorMessage("変更申請の送信に失敗しました");
          setErrorDetails("エラーが発生しました。");
          setErrorModalOpen(true);
        } else {
          // 500系エラー：エラーバウンダリーに投げる（throwOnErrorで自動的に処理される）
          throw error;
        }
      } else {
        // 予期しないエラー：エラーバウンダリーに投げる
        throw error;
      }
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  if (!profile) {
    return null;
  }

  return (
    <>
      <ErrorModal
        open={errorModalOpen}
        onOpenChange={setErrorModalOpen}
        title="エラー"
        message={errorMessage}
        details={errorDetails}
      />
      <PageHeader
        title="変更申請"
        className=""
        action={
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
              onClick={handleCancel}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              form="profile-edit-form"
              className="bg-blue-300 text-black hover:bg-blue-500"
              disabled={isSubmitting || isSubmittingRequest}
            >
              {isSubmittingRequest ? "送信中..." : "変更申請を送信"}
            </Button>
          </div>
        }
      />
      <Stack>
        <LoadingWrapper isLoading={isLoading || isSubmittingRequest}>
          <form id="profile-edit-form" onSubmit={handleSubmit(onSubmit)}>
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-200 pb-1">
                <CardTitle className="text-xl font-semibold">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-600">
                      姓 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-600">
                      名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-600">
                      メールアドレス <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500      ">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-600">
                      電話番号 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-600">
                      郵便番号 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      className={errors.postalCode ? "border-red-500" : ""}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-red-500">{errors.postalCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-600">
                      住所 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      {...register("address")}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200 mt-6">
              <CardHeader className="border-b border-gray-200 pb-1">
                <CardTitle className="text-xl font-semibold">所属情報</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  {/* ヘッダー */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto]">
                    <Label className="text-sm font-medium text-gray-600 flex items-center">
                      支店 <span className="text-red-500">*</span>
                    </Label>
                    <Label className="text-sm font-medium text-gray-600 flex items-center">
                      部署 <span className="text-red-500">*</span>
                    </Label>
                    <Label className="text-sm font-medium text-gray-600 flex items-center">
                      役職 <span className="text-red-500">*</span>
                    </Label>
                    <div className="w-9"></div>
                  </div>
                  {/* 各所属情報 */}
                  {assignments.map((assignment, index) => {
                    // 既に選択されている支店IDを取得（現在のassignmentを除く）
                    const selectedBranchIds = assignments
                      .map((a, i) => (i !== index ? a.branchId : null))
                      .filter((id): id is number => id !== null && id !== 0);
                    // 選択可能な支店（既に選択されている支店を除外）
                    const availableBranches = mockBranches.filter(
                      (branch) => !selectedBranchIds.includes(branch.id)
                    );

                    const branchError = errors.assignments?.[index]?.branchId;
                    const departmentError = errors.assignments?.[index]?.departmentId;
                    const positionError = errors.assignments?.[index]?.positionId;

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start"
                      >
                        <div>
                          <Select
                            value={assignment.branchId > 0 ? assignment.branchId.toString() : ""}
                            onValueChange={(value) =>
                              handleAssignmentChange(index, "branchId", value)
                            }
                          >
                            <SelectTrigger
                              className={`border-gray-200 bg-white focus-visible:border-gray-200 focus-visible:ring-0 ${branchError ? "border-red-500" : ""}`}
                            >
                              <SelectValue placeholder="選択してください">
                                {mockBranches.find((b) => b.id === assignment.branchId)?.name ||
                                  "選択してください"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {availableBranches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {branchError && (
                            <p className="text-sm text-red-500 mt-1">{branchError.message}</p>
                          )}
                        </div>
                        <div>
                          <Select
                            value={
                              assignment.departmentId > 0 ? assignment.departmentId.toString() : ""
                            }
                            onValueChange={(value) =>
                              handleAssignmentChange(index, "departmentId", value)
                            }
                          >
                            <SelectTrigger
                              className={`border-gray-200 bg-white focus-visible:border-gray-200 focus-visible:ring-0 ${departmentError ? "border-red-500" : ""}`}
                            >
                              <SelectValue placeholder="選択してください">
                                {mockDepartments.find((d) => d.id === assignment.departmentId)
                                  ?.name || "選択してください"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {mockDepartments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {departmentError && (
                            <p className="text-sm text-red-500 mt-1">{departmentError.message}</p>
                          )}
                        </div>
                        <div>
                          <Select
                            value={
                              assignment.positionId > 0 ? assignment.positionId.toString() : ""
                            }
                            onValueChange={(value) =>
                              handleAssignmentChange(index, "positionId", value)
                            }
                          >
                            <SelectTrigger
                              className={`border-gray-200 bg-white focus-visible:border-gray-200 focus-visible:ring-0 ${positionError ? "border-red-500" : ""}`}
                            >
                              <SelectValue placeholder="選択してください">
                                {mockPositions.find((p) => p.id === assignment.positionId)?.name ||
                                  "選択してください"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {mockPositions.map((position) => (
                                <SelectItem key={position.id} value={position.id.toString()}>
                                  {position.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {positionError && (
                            <p className="text-sm text-red-500 mt-1">{positionError.message}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="border-gray-200 bg-white hover:bg-white h-9 w-9 [&>svg]:!text-red-500"
                          onClick={() => handleRemoveAssignment(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                  {/* プラスボタン */}
                  {assignments.length < mockBranches.length && (
                    <div className="flex justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-200 bg-white hover:bg-white"
                        onClick={handleAddAssignment}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {errors.assignments && (
                    <p className="text-sm text-red-500">{errors.assignments.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200 mt-6">
              <CardHeader className="border-b border-gray-200 pb-1">
                <CardTitle className="text-xl font-semibold">変更内容</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-1.5">
                  <Label htmlFor="changeReason" className="text-sm font-medium text-gray-600">
                    変更内容 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="changeReason"
                    rows={5}
                    {...register("changeReason")}
                    className={errors.changeReason ? "border-red-500 hover:border-red-500" : ""}
                    placeholder="変更の理由や詳細を入力してください"
                  />
                  {errors.changeReason && (
                    <p className="text-sm text-red-500">{errors.changeReason.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </LoadingWrapper>
      </Stack>
    </>
  );
}
