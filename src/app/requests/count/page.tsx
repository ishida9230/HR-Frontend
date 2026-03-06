"use client";

import { useRouter } from "next/navigation";
import { useRequestCounts } from "@/hooks/use-request";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";

/**
 * ステータスのラベル
 */
const STATUS_LABELS: Record<string, string> = {
  PENDING_MANAGER: "上長承認待ち",
  PENDING_HR: "人事承認待ち",
  CHANGES_REQUESTED: "差し戻し",
  COMPLETED: "完了",
  ALL: "全申請",
};

/**
 * ステータスの色
 */
const STATUS_COLORS: Record<string, string> = {
  PENDING_MANAGER: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  PENDING_HR: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  CHANGES_REQUESTED: "bg-red-50 border-red-200 hover:bg-red-100",
  COMPLETED: "bg-green-50 border-green-200 hover:bg-green-100",
  ALL: "bg-gray-50 border-gray-200 hover:bg-gray-100",
};

export default function RequestCountPage() {
  const router = useRouter();
  const { data: counts, isLoading } = useRequestCounts();

  const handleTabClick = (status: string) => {
    if (status === "ALL") {
      router.push("/requests/list?from=list");
    } else {
      router.push(`/requests/list?status=${status}&from=count`);
    }
  };

  const tabs = [
    {
      status: "PENDING_MANAGER",
      label: STATUS_LABELS.PENDING_MANAGER,
      count: counts?.pendingManager,
    },
    { status: "PENDING_HR", label: STATUS_LABELS.PENDING_HR, count: counts?.pendingHr },
    { status: "CHANGES_REQUESTED", label: STATUS_LABELS.CHANGES_REQUESTED },
    { status: "COMPLETED", label: STATUS_LABELS.COMPLETED },
    { status: "ALL", label: STATUS_LABELS.ALL },
  ];

  return (
    <>
      <PageHeader title="申請状況" />
      <LoadingWrapper isLoading={isLoading}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 mt-4">
          {tabs.map((tab) => (
            <Card
              key={tab.status}
              className={`${STATUS_COLORS[tab.status]} cursor-pointer transition-colors relative`}
              onClick={() => handleTabClick(tab.status)}
            >
              <CardContent className="px-4 py-6">
                {/* 件数バッジ（上長承認待ちと人事承認待ちのみ、左上に表示） */}
                {tab.count !== undefined && tab.count > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {tab.count}
                  </div>
                )}
                <div className="text-center">
                  <div className="text-base font-medium">{tab.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </LoadingWrapper>
    </>
  );
}
