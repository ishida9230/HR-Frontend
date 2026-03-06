"use client";

import { Card, CardContent } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table";
import { RequestListItem } from "@/lib/api/request";

/**
 * ステータスのラベル
 */
const STATUS_LABELS: Record<string, string> = {
  PENDING_MANAGER: "上長承認待ち",
  PENDING_HR: "人事承認待ち",
  CHANGES_REQUESTED: "差し戻し",
  COMPLETED: "完了",
};

interface RequestListTableProps {
  /**
   * 申請一覧データ
   */
  requests: RequestListItem[];
  /**
   * 行クリック時のコールバック
   */
  onRowClick: (requestId: number) => void;
  /**
   * 空状態のメッセージ
   * @default "申請が見つかりませんでした"
   */
  emptyMessage?: string;
  /**
   * 日付フォーマット関数
   */
  formatDate: (dateString: string | null) => string;
}

/**
 * 申請一覧テーブルコンポーネント
 * list配下のみで使用
 */
export function RequestListTable({
  requests,
  onRowClick,
  emptyMessage = "申請が見つかりませんでした",
  formatDate,
}: RequestListTableProps) {
  return (
    <Card className="mt-4 bg-white">
      <CardContent className="p-0">
        <TableContainer>
          <Table fixed>
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell width="20">申請ID</TableHeaderCell>
                <TableHeaderCell width="45">従業員</TableHeaderCell>
                <TableHeaderCell width="32">部署</TableHeaderCell>
                <TableHeaderCell width="32">支店</TableHeaderCell>
                <TableHeaderCell width="32">役職</TableHeaderCell>
                <TableHeaderCell>タイトル</TableHeaderCell>
                <TableHeaderCell width="45">申請ステータス</TableHeaderCell>
                <TableHeaderCell width="32">申請日</TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <EmptyState message={emptyMessage} colSpan={8} />
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id} onClick={() => onRowClick(request.id)}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>
                      {request.employee.lastName} {request.employee.firstName}
                    </TableCell>
                    <TableCell>
                      {request.departments.length > 0 ? (
                        <div className="space-y-1">
                          {request.departments.map((d) => (
                            <div key={d.id}>{d.name}</div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {request.branches.length > 0 ? (
                        <div className="space-y-1">
                          {request.branches.map((b) => (
                            <div key={b.id}>{b.name}</div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {request.positions.length > 0 ? (
                        <div className="space-y-1">
                          {request.positions.map((p) => (
                            <div key={p.id}>{p.name}</div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="break-words">{request.title}</TableCell>
                    <TableCell>
                      {STATUS_LABELS[request.status] || request.status}
                    </TableCell>
                    <TableCell>{formatDate(request.submittedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
