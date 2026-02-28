import { http } from '@/utils/request';

/**
 * 身份驗證 / 用戶安全相關 API
 *
 * 約定：
 * - 所有路徑均已去掉 `/api/` 前綴，交由全局攔截器統一加上。
 * - 默認會自動帶上 token、語言等公共參數。
 */

/**
 * =========================
 * 修改 / 設置提現密碼
 * =========================
 *
 * 接口：PUT /api/auth/me/withdraw-password
 * 路徑：auth/me/withdraw-password
 */

export interface UpdateWithdrawPasswordPayload {
  /**
   * 原本提現密碼。
   * - 若為首次設置提現密碼，可不傳或傳空字串。
   */
  old_password?: string;
  /** 新提現密碼（必填） */
  new_password: string;
  /** 確認新提現密碼（必填，需與 new_password 相同） */
  confirm_password: string;
}

export interface UpdateWithdrawPasswordResponse {
  code?: number;
  message?: string;
  [key: string]: any;
}

/**
 * 修改 / 設置提現密碼
 * PUT /api/auth/me/withdraw-password
 */
export function updateWithdrawPassword(data: UpdateWithdrawPasswordPayload) {
  return http<UpdateWithdrawPasswordResponse>({
    method: 'PUT',
    url: 'auth/me/withdraw-password',
    data,
  });
}

