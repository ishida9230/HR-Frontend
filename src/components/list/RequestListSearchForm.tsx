"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Department, Branch, Position } from "@/lib/api/masters";

/**
 * ステータスのラベル
 */
const STATUS_LABELS: Record<string, string> = {
  PENDING_MANAGER: "上長承認待ち",
  PENDING_HR: "人事承認待ち",
  CHANGES_REQUESTED: "差し戻し",
  COMPLETED: "完了",
};

/**
 * ステータスのオプション
 */
const STATUS_OPTIONS = [
  { value: "PENDING_MANAGER", label: STATUS_LABELS.PENDING_MANAGER },
  { value: "PENDING_HR", label: STATUS_LABELS.PENDING_HR },
  { value: "CHANGES_REQUESTED", label: STATUS_LABELS.CHANGES_REQUESTED },
  { value: "COMPLETED", label: STATUS_LABELS.COMPLETED },
];

interface RequestListSearchFormProps {
  /**
   * 従業員名の入力値
   */
  employeeNameInput: string;
  /**
   * 従業員名の入力値変更ハンドラー
   */
  setEmployeeNameInput: (value: string) => void;
  /**
   * 選択された部署IDの配列
   */
  departmentIds: number[];
  /**
   * 部署IDの配列変更ハンドラー
   */
  setDepartmentIds: (ids: number[]) => void;
  /**
   * 選択された支店IDの配列
   */
  branchIds: number[];
  /**
   * 支店IDの配列変更ハンドラー
   */
  setBranchIds: (ids: number[]) => void;
  /**
   * 選択された役職IDの配列
   */
  positionIds: number[];
  /**
   * 役職IDの配列変更ハンドラー
   */
  setPositionIds: (ids: number[]) => void;
  /**
   * 選択されたステータスの配列
   */
  statusInputs: string[];
  /**
   * ステータスの配列変更ハンドラー
   */
  setStatusInputs: (statuses: string[]) => void;
  /**
   * 部署一覧
   */
  departments: Department[];
  /**
   * 支店一覧
   */
  branches: Branch[];
  /**
   * 役職一覧
   */
  positions: Position[];
  /**
   * 遷移元パラメータ（count: 申請数ページから, list: 申請一覧ページ内で検索）
   */
  fromParam: string | null;
  /**
   * 検索ボタンクリックハンドラー
   */
  onSearch: () => void;
  /**
   * リセットボタンクリックハンドラー
   */
  onReset: () => void;
}

/**
 * 申請一覧検索フォームコンポーネント
 * list配下のみで使用
 */
export function RequestListSearchForm({
  employeeNameInput,
  setEmployeeNameInput,
  departmentIds,
  setDepartmentIds,
  branchIds,
  setBranchIds,
  positionIds,
  setPositionIds,
  statusInputs,
  setStatusInputs,
  departments,
  branches,
  positions,
  fromParam,
  onSearch,
  onReset,
}: RequestListSearchFormProps) {
  return (
    <>
      {/* 検索フォーム */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="employeeName" className="text-sm font-medium text-gray-600">
            従業員
          </Label>
          <Input
            id="employeeName"
            value={employeeNameInput}
            onChange={(e) => setEmployeeNameInput(e.target.value)}
            placeholder="従業員名を入力"
            className="bg-gray-50"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
          />
        </div>

        <div>
          <Label htmlFor="department" className="text-sm font-medium text-gray-600">
            部署
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="department"
                className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-black shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className="truncate">
                  {departmentIds.length === 0
                    ? "すべて"
                    : departmentIds.length === 1
                      ? departments.find((d) => d.id === departmentIds[0])?.name || "選択中"
                      : `${departmentIds
                          .map((id) => departments.find((d) => d.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}`}
                </span>
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
              <div className="space-y-1">
                {departments.map((dept) => {
                  const isSelected = departmentIds.includes(dept.id);
                  return (
                    <div
                      key={dept.id}
                      className={`cursor-pointer hover:bg-gray-50 p-2 rounded text-sm ${
                        isSelected ? "bg-gray-100 font-medium" : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setDepartmentIds(departmentIds.filter((id) => id !== dept.id));
                        } else {
                          setDepartmentIds([...departmentIds, dept.id]);
                        }
                      }}
                    >
                      {dept.name}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="branch" className="text-sm font-medium text-gray-600">
            支店
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="branch"
                className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-black shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className="truncate">
                  {branchIds.length === 0
                    ? "すべて"
                    : branchIds.length === 1
                      ? branches.find((b) => b.id === branchIds[0])?.name || "選択中"
                      : `${branchIds
                          .map((id) => branches.find((b) => b.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}`}
                </span>
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
              <div className="space-y-1">
                {branches.map((branch) => {
                  const isSelected = branchIds.includes(branch.id);
                  return (
                    <div
                      key={branch.id}
                      className={`cursor-pointer hover:bg-gray-50 p-2 rounded text-sm ${
                        isSelected ? "bg-gray-100 font-medium" : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setBranchIds(branchIds.filter((id) => id !== branch.id));
                        } else {
                          setBranchIds([...branchIds, branch.id]);
                        }
                      }}
                    >
                      {branch.name}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 申請ステータスの検索フィールド表示条件 */}
        {/* from=countがある場合は常に非表示 */}
        {fromParam !== "count" && (
          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-600">
              申請ステータス
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="status"
                  className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-black shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span className="truncate">
                    {statusInputs.length === 0
                      ? "すべて"
                      : statusInputs.length === 1
                        ? STATUS_LABELS[statusInputs[0]] || "選択中"
                        : `${statusInputs
                            .map((s) => STATUS_LABELS[s])
                            .filter(Boolean)
                            .join(", ")}`}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                <div className="space-y-1">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = statusInputs.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        className={`cursor-pointer hover:bg-gray-50 p-2 rounded text-sm ${
                          isSelected ? "bg-gray-100 font-medium" : ""
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setStatusInputs(statusInputs.filter((s) => s !== option.value));
                          } else {
                            setStatusInputs([...statusInputs, option.value]);
                          }
                        }}
                      >
                        {option.label}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div>
          <Label htmlFor="position" className="text-sm font-medium text-gray-600">
            役職
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="position"
                className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-black shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className="truncate">
                  {positionIds.length === 0
                    ? "すべて"
                    : positionIds.length === 1
                      ? positions.find((p) => p.id === positionIds[0])?.name || "選択中"
                      : `${positionIds
                          .map((id) => positions.find((p) => p.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}`}
                </span>
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
              <div className="space-y-1">
                {positions.map((position) => {
                  const isSelected = positionIds.includes(position.id);
                  return (
                    <div
                      key={position.id}
                      className={`cursor-pointer hover:bg-gray-50 p-2 rounded text-sm ${
                        isSelected ? "bg-gray-100 font-medium" : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setPositionIds(positionIds.filter((id) => id !== position.id));
                        } else {
                          setPositionIds([...positionIds, position.id]);
                        }
                      }}
                    >
                      {position.name}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 検索ボタン */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onReset}
          className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
        >
          リセット
        </Button>
        <Button onClick={onSearch}>検索</Button>
      </div>
    </>
  );
}
