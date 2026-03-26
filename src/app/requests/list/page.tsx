"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useRequestList } from "@/hooks/use-request";
import {
  getDepartments,
  getBranches,
  getPositions,
  type Department,
  type Branch,
  type Position,
} from "@/lib/api/masters";
import { RequestListQuery } from "@/lib/api/request";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { ErrorModal } from "@/components/ui/error-modal";
import { ApiError } from "@/lib/errors/api-error";
import { useErrorBoundary } from "react-error-boundary";
import { useApiQuery } from "@/hooks/use-api-query";
import { RequestListTable } from "@/components/list/RequestListTable";
import { RequestListSearchForm } from "@/components/list/RequestListSearchForm";
import { Pagination } from "@/components/ui/pagination";

/**
 * ステータスのラベル
 */
const STATUS_LABELS: Record<string, string> = {
  PENDING_MANAGER: "上長承認待ち",
  PENDING_HR: "人事承認待ち",
  CHANGES_REQUESTED: "差し戻し",
  COMPLETED: "完了",
};

export default function RequestListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showBoundary } = useErrorBoundary();

  // URLパラメータから初期値を取得
  const initialStatusParams = searchParams.getAll("status");
  const initialPage = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
  const fromParam = searchParams.get("from"); // 遷移元を取得（count: 申請数ページから, list: 申請一覧ページ内で検索）

  // 検索フォームの状態（入力中の値）
  const [employeeNameInput, setEmployeeNameInput] = useState("");
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [branchIds, setBranchIds] = useState<number[]>([]);
  const [positionIds, setPositionIds] = useState<number[]>([]);
  const [statusInputs, setStatusInputs] = useState<string[]>(initialStatusParams);
  const [page, setPage] = useState(initialPage);

  // 検索条件（検索ボタン押下時に設定される）
  const [searchQuery, setSearchQuery] = useState<RequestListQuery>({
    employeeName: undefined,
    departmentIds: undefined,
    branchIds: undefined,
    positionIds: undefined,
    statuses: initialStatusParams.length > 0 ? initialStatusParams : undefined,
    page: initialPage,
    limit: 25,
  });

  // マスターデータの取得
  const { data: departments = [], isLoading: isLoadingDepartments } = useApiQuery<
    Department[],
    ApiError
  >({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  });

  const { data: branches = [], isLoading: isLoadingBranches } = useApiQuery<Branch[], ApiError>({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
  });

  const { data: positions = [], isLoading: isLoadingPositions } = useApiQuery<Position[], ApiError>(
    {
      queryKey: ["positions"],
      queryFn: () => getPositions(),
    }
  );

  // 申請一覧の取得（検索条件を使用）
  const { data, isLoading, error } = useRequestList(searchQuery);

  // エラーハンドリング
  const [apiError, setApiError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (error) {
      if (error instanceof ApiError) {
        if (error.code >= 400 && error.code < 500) {
          setApiError(error);
        } else {
          showBoundary(error);
        }
      } else {
        showBoundary(error);
      }
    }
  }, [error, showBoundary]);

  // 検索実行
  const handleSearch = () => {
    // 検索条件を設定（複数選択対応）
    const newQuery: RequestListQuery = {
      employeeName: employeeNameInput || undefined,
      departmentIds: departmentIds.length > 0 ? departmentIds : undefined,
      branchIds: branchIds.length > 0 ? branchIds : undefined,
      positionIds: positionIds.length > 0 ? positionIds : undefined,
      statuses: statusInputs.length > 0 ? statusInputs : undefined,
      page: 1,
      limit: 25,
    };
    setSearchQuery(newQuery);
    setPage(1);
    // 検索実行時は現在のfromパラメータを保持
    // 申請一覧ページ（from=listまたはfromなし）の場合はfrom=listに設定
    // そのほかのページ（from=count）の場合はfrom=countを保持
    const newFrom = fromParam === "count" ? "count" : "list";
    updateURL(newQuery, newFrom);
  };

  // リセット
  const handleReset = () => {
    // 申請一覧ページ内での検索（from=listまたはfromなし）の場合のみ申請ステータスもリセット
    const isRequestListPage = fromParam !== "count";

    setEmployeeNameInput("");
    setDepartmentIds([]);
    setBranchIds([]);
    setPositionIds([]);
    if (isRequestListPage) {
      setStatusInputs([]); // 申請一覧ページ内での検索の場合はstatusもリセット
    }
    // 申請数ページから遷移した場合（from=count）はstatusは保持
    setPage(1);
    const resetQuery: RequestListQuery = {
      employeeName: undefined,
      departmentIds: undefined,
      branchIds: undefined,
      positionIds: undefined,
      statuses: isRequestListPage ? undefined : searchQuery.statuses, // 申請一覧ページ内での検索の場合はリセット、申請数ページから遷移した場合は保持
      page: 1,
      limit: 25,
    };
    setSearchQuery(resetQuery);
    // fromパラメータを保持（申請数ページから遷移した場合はcount、申請一覧ページ内で検索した場合はlist）
    updateURL(resetQuery, fromParam || undefined);
  };

  // URL更新（申請一覧ページにとどまる）
  const updateURL = (query: RequestListQuery, from?: string) => {
    const params = new URLSearchParams();
    // statusは複数選択対応
    if (query.statuses && query.statuses.length > 0) {
      query.statuses.forEach((status) => params.append("status", status));
    }
    if (query.employeeName) params.set("employeeName", query.employeeName);
    if (query.departmentIds && query.departmentIds.length > 0) {
      query.departmentIds.forEach((id) => params.append("departmentIds", id.toString()));
    }
    if (query.branchIds && query.branchIds.length > 0) {
      query.branchIds.forEach((id) => params.append("branchIds", id.toString()));
    }
    if (query.positionIds && query.positionIds.length > 0) {
      query.positionIds.forEach((id) => params.append("positionIds", id.toString()));
    }
    if (query.page && query.page > 1) params.set("page", query.page.toString());
    // fromパラメータを設定（検索実行時はlist、申請数ページから遷移した場合はcount）
    if (from) {
      params.set("from", from);
    }
    const queryString = params.toString();
    // 常に/requests/listにとどまる（ページ遷移しない）
    router.push(`/requests/list${queryString ? `?${queryString}` : ""}`);
  };

  // URLパラメータから初期値を設定
  useEffect(() => {
    const employeeNameParam = searchParams.get("employeeName");
    const departmentIdParams = searchParams.getAll("departmentIds");
    const branchIdParams = searchParams.getAll("branchIds");
    const positionIdParams = searchParams.getAll("positionIds");
    const statusParams = searchParams.getAll("status");
    const pageParam = searchParams.get("page");

    if (employeeNameParam) {
      setEmployeeNameInput(employeeNameParam);
    } else {
      setEmployeeNameInput("");
    }
    if (departmentIdParams.length > 0) {
      setDepartmentIds(departmentIdParams.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)));
    } else {
      setDepartmentIds([]);
    }
    if (branchIdParams.length > 0) {
      setBranchIds(branchIdParams.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)));
    } else {
      setBranchIds([]);
    }
    if (positionIdParams.length > 0) {
      setPositionIds(positionIdParams.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)));
    } else {
      setPositionIds([]);
    }
    setStatusInputs(statusParams.length > 0 ? statusParams : []);
    if (pageParam) {
      setPage(parseInt(pageParam, 10));
    } else {
      setPage(1);
    }

    // 検索条件も設定
    const initialQuery: RequestListQuery = {
      employeeName: employeeNameParam || undefined,
      departmentIds:
        departmentIdParams.length > 0
          ? departmentIdParams.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
          : undefined,
      branchIds:
        branchIdParams.length > 0
          ? branchIdParams.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
          : undefined,
      positionIds:
        positionIdParams.length > 0
          ? positionIdParams.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
          : undefined,
      statuses: statusParams.length > 0 ? statusParams : undefined,
      page: pageParam ? parseInt(pageParam, 10) : 1,
      limit: 25,
    };
    setSearchQuery(initialQuery);
  }, [searchParams]);

  // ページネーション
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const newQuery = { ...searchQuery, page: newPage };
    setSearchQuery(newQuery);
    // fromパラメータを保持
    updateURL(newQuery, fromParam || undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 申請承認画面への遷移
  const handleRequestClick = (requestId: number) => {
    router.push(`/requests/approve/${requestId}`);
  };

  /**
   * 日付を日本語形式（YYYY/MM/DD）に変換
   * @param dateString ISO 8601形式の日付文字列またはnull
   * @returns 日本語形式の日付文字列（例: "2024/01/15"）または "-"
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // タイトルを動的に生成
  const pageTitle = useMemo(() => {
    // 申請数ページから遷移した場合（from=count）かつ1つのステータスのみ選択されている場合のみタイトルを変更
    if (fromParam === "count" && searchQuery.statuses && searchQuery.statuses.length === 1) {
      return `${STATUS_LABELS[searchQuery.statuses[0]]}申請一覧`;
    }
    // それ以外の場合は「申請一覧」
    return "申請一覧";
  }, [fromParam, searchQuery.statuses]);

  // 戻るボタンのハンドラー
  const handleBack = () => {
    router.push("/requests/count");
  };

  return (
    <>
      <PageHeader
        title={pageTitle}
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
      <LoadingWrapper isLoading={isLoadingDepartments || isLoadingBranches || isLoadingPositions}>
        <Card className="mt-4 bg-white">
          <CardContent className="p-6">
            <RequestListSearchForm
              employeeNameInput={employeeNameInput}
              setEmployeeNameInput={setEmployeeNameInput}
              departmentIds={departmentIds}
              setDepartmentIds={setDepartmentIds}
              branchIds={branchIds}
              setBranchIds={setBranchIds}
              positionIds={positionIds}
              setPositionIds={setPositionIds}
              statusInputs={statusInputs}
              setStatusInputs={setStatusInputs}
              departments={departments}
              branches={branches}
              positions={positions}
              fromParam={fromParam}
              onSearch={handleSearch}
              onReset={handleReset}
            />
          </CardContent>
        </Card>

        {/* 申請一覧 */}
        <LoadingWrapper isLoading={isLoading}>
          {data && (
            <>
              <div className="mt-4">
                <div className="text-sm">
                  全{data.total}件中 {data.page === 1 ? 1 : (data.page - 1) * data.limit + 1}〜
                  {Math.min(data.page * data.limit, data.total)}件を表示
                </div>
              </div>

              <RequestListTable
                requests={data.requests}
                onRowClick={handleRequestClick}
                emptyMessage="申請が見つかりませんでした"
                formatDate={formatDate}
              />

              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </LoadingWrapper>
      </LoadingWrapper>

      {/* エラーモーダル */}
      <ErrorModal
        open={!!apiError}
        onOpenChange={(open) => {
          if (!open) setApiError(null);
        }}
        title="エラー"
        message={apiError?.message || "エラーが発生しました"}
      />
    </>
  );
}
