/**
 * APIエラークラス
 * エラーコードを含むカスタムエラー
 */
export class ApiError extends Error {
  public code: number;
  public details?: unknown;

  constructor(code: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}
