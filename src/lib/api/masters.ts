/**
 * マスターデータAPIクライアント
 */

import { apiFetch } from "./api-client";

/**
 * 部署レスポンス型
 */
export interface Department {
  id: number;
  name: string;
}

/**
 * 支店レスポンス型
 */
export interface Branch {
  id: number;
  name: string;
}

/**
 * 役職レスポンス型
 */
export interface Position {
  id: number;
  name: string;
}

/**
 * 部署一覧を取得
 * @returns 部署一覧
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getDepartments(): Promise<Department[]> {
  return apiFetch<Department[]>("/api/departments", {
    method: "GET",
    defaultErrorMessage: "部署一覧の取得に失敗しました",
  });
}

/**
 * 支店一覧を取得
 * @returns 支店一覧
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getBranches(): Promise<Branch[]> {
  return apiFetch<Branch[]>("/api/branches", {
    method: "GET",
    defaultErrorMessage: "支店一覧の取得に失敗しました",
  });
}

/**
 * 役職一覧を取得
 * @returns 役職一覧
 * @throws ApiError API呼び出しが失敗した場合（エラーコードを含む）
 */
export async function getPositions(): Promise<Position[]> {
  return apiFetch<Position[]>("/api/positions", {
    method: "GET",
    defaultErrorMessage: "役職一覧の取得に失敗しました",
  });
}
