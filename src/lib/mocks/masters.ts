/**
 * マスターデータ用モックデータ
 * バックエンドAPI実装後は削除またはAPI呼び出しに置き換え
 */

export interface Department {
  id: number;
  name: "営業部" | "開発部" | "CS部" | "管理部" | "人事部";
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: number;
  name: "東京支店" | "大阪支店" | "福岡支店";
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: number;
  name: "平社員" | "主任" | "部長" | "社長";
  createdAt: string;
  updatedAt: string;
}

/**
 * 部署マスタのモックデータ
 */
export const mockDepartments: Department[] = [
  { id: 1, name: "営業部", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 2, name: "開発部", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 3, name: "CS部", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 4, name: "管理部", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 5, name: "人事部", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
];

/**
 * 支店マスタのモックデータ
 */
export const mockBranches: Branch[] = [
  { id: 1, name: "東京支店", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 2, name: "大阪支店", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 3, name: "福岡支店", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
];

/**
 * 役職マスタのモックデータ
 */
export const mockPositions: Position[] = [
  { id: 1, name: "平社員", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 2, name: "主任", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 3, name: "部長", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
  { id: 4, name: "社長", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2020-01-01T00:00:00Z" },
];
