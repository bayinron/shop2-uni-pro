import { http } from '@/utils/request';

/**
 * 支付與充值相關 API
 *
 * 說明：
 *  - 所有路徑均已去掉 `/api/` 前綴，交由全局攔截器統一加上。
 *  - 默認會自動帶上 token、語言等公共參數。
 */

/**
 * =========================
 * 多幣種錢包基礎
 * =========================
 */

/**
 * 幣種資訊
 * GET /api/wallet/currencies
 */
export interface WalletCurrency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_fiat: boolean;
  [key: string]: any;
}

export function getWalletCurrencies() {
  return http<WalletCurrency[]>({
    method: 'GET',
    url: 'wallet/currencies',
  });
}

/**
 * 餘額總覽
 * GET /api/wallet/balance
 */
export interface WalletBalanceItem {
  currency: string;
  available: string;
  frozen: string;
  balance: string;
  [key: string]: any;
}

export interface WalletBalanceOverviewResponse {
  list: WalletBalanceItem[];
  total_value_usd?: string | number;
  [key: string]: any;
}

export function getWalletBalanceOverview() {
  return http<WalletBalanceOverviewResponse>({
    method: 'GET',
    url: 'wallet/balance',
  });
}

/**
 * 查詢單一幣種餘額
 * GET /api/wallet/:currency/balance
 */
export function getWalletBalanceByCurrency(currency: string) {
  return http<WalletBalanceItem>({
    method: 'GET',
    url: `wallet/${currency}/balance`,
  });
}

/**
 * 幣種相互兌換
 * POST /api/wallet/convert
 */
export interface WalletConvertPayload {
  from_currency: string;
  to_currency: string;
  amount: number;
}

export function convertWalletCurrency(data: WalletConvertPayload) {
  return http<any>({
    method: 'POST',
    url: 'wallet/convert',
    data,
  });
}

/**
 * =========================
 * 支付渠道
 * =========================
 */

export type PaymentChannelType = 'manual' | 'online';

export interface PaymentChannel {
  id: number;
  name: string;
  type: string; // 如: 'crypto', 'bank', 等
  provider: string; // 如: 'manual', 'stripe', 等
  config: any | null;
  is_online: number;
  currency: string;
  account_name: string;
  account_detail: string;
  bank_name: string;
  branch_name: string;
  min_amount: string;
  max_amount: string;
  status: number;
  instructions: string;
  sort_order: number;
  bank_info: any | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}



/**
 * 獲取可用支付渠道列表
 * GET /api/payment-channels
 */
export function getPaymentChannels() {
  return http<any>({
    method: 'GET',
    url: 'payment-channels',
  });
}

/**
 * =========================
 * 充值申請（錢包入金）
 * =========================
 */

export interface WalletDepositPayload {
  /** 支付渠道 ID */
  channel_id: number;
  /** 貨幣代碼 (如: USD, CNY) */
  currency: string;
  /** 充值金額 */
  amount: number;
  /** 交易 ID（手動支付適用，可選） */
  tx_id?: string;
  /** 轉賬憑證圖片（手動支付適用，可選） */
  proof_img?: string;
}

export interface WalletDepositManualData {
  type: 'manual';
  deposit_id: number;
  instructions: string;
}

export interface WalletDepositRedirectData {
  type: 'redirect';
  redirect_url: string;
  session_id?: string;
}

export type WalletDepositPaymentType = 'manual' | 'stripe' | string;

export interface WalletDepositChannelSummary {
  id: number;
  name: string;
  is_online: boolean;
}

export interface WalletDepositResponse {
  deposit_id: number;
  payment_type: WalletDepositPaymentType;
  payment_data: WalletDepositManualData | WalletDepositRedirectData | Record<string, any>;
  channel: WalletDepositChannelSummary;
}

/**
 * 提交充值申請
 * POST /api/wallet/deposit
 *
 * 後端要求 multipart/form-data，因此這裡使用 FormData 組裝參數。
 */
export function submitWalletDeposit(payload: WalletDepositPayload) {
  return http<any>({
    method: 'POST',
    url: 'wallet/deposit',
    data: payload,
  });
}

/**
 * =========================
 * 銀行模板
 * =========================
 */

export type BankTemplateFieldType = 'text' | 'number' | 'date' | string;

export interface BankTemplateField {
  name: string;
  label: string;
  type: BankTemplateFieldType;
  required: boolean;
  placeholder?: string;
}

export interface BankTemplate {
  id: number;
  bank_name: string;
  country_code: string;
  fields: BankTemplateField[];
  is_active: boolean;
}

/**
 * 銀行模板查詢參數
 */
export interface GetBankTemplatesParams {
  /** 國家代碼篩選 (如: TW, CN, US) */
  country_code?: string;
}

/**
 * 獲取銀行模板列表
 * GET /api/bank-templates
 */
export function getBankTemplates(params: GetBankTemplatesParams = {}) {
  return http<BankTemplate[]>({
    method: 'GET',
    url: 'bank-templates',
    data: params,
  });
}

/**
 * =========================
 * 用戶收款方式管理
 * =========================
 */

export interface BindPaymentMethodPayload {
  name: string;
  /** 銀行模板 ID */
  bank_template_id: number;
  /** 帳戶信息（依模板字段而定） */
  details: Record<string, any>;
  /** 是否設為預設，默認 false */
  is_default?: boolean;
}

export interface UserPaymentMethod {
  id: number;
  /** 系統自動判定的類型：fiat（法幣）或 crypto（加密貨幣） */
  type: 'fiat' | 'crypto' | string;
  /** 用戶自訂的帳戶別名 */
  name: string;
  /** 是否為預設打款帳戶 */
  is_default: boolean;
  /** 帳戶詳細資訊，對應綁定時填入的 Key/Value */
  details: Record<string, any>;
  /**
   * 所屬銀行模板（type = fiat 時存在）
   *  - name: 銀行名稱
   *  - currency: 幣種
   *  - fields_config: 欄位定義
   */
  bank_template?: {
    id: number;
    name: string;
    currency: string;
    fields_config?: any;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

/**
 * 綁定收款方式
 * POST /api/user/payment-methods
 */
export function bindUserPaymentMethod(data: BindPaymentMethodPayload) {
  return http<any>({
    method: 'POST',
    url: 'user/payment-methods',
    data,
  });
}

/**
 * 獲取我的收款方式列表
 * GET /api/user/payment-methods
 */
export function getUserPaymentMethods(params?: { bank_template_id?: number }) {
  return http<UserPaymentMethod[]>({
    method: 'GET',
    url: 'user/payment-methods',
    data: params,
  });
}

/**
 * 設為預設收款方式
 * PATCH /api/user/payment-methods/:id/default
 *
 * UniApp 不直接支持 PATCH，後端通常接受 POST 來表達更新語義。
 */
export function setDefaultUserPaymentMethod(id: number) {
  return http<{ success?: boolean } & Record<string, any>>({
    method: 'POST',
    url: `user/payment-methods/${id}/default`,
  });
}

/**
 * 刪除收款帳戶
 * DELETE /api/user/payment-methods/:id
 */
export function deleteUserPaymentMethod(id: number) {
  return http<{ success?: boolean } & Record<string, any>>({
    method: 'DELETE',
    url: `user/payment-methods/${id}`,
  });
}

/**
 * =========================
 * 提現相關
 * =========================
 */

export interface WithdrawalRules {
  min_amount: number;
  max_amount: number;
  fee_rate: number;
  daily_limit: number;
  processing_time: string;
}

/**
 * 獲取提現規則
 * GET /api/system-config/withdrawal-rules
 */
export function getWithdrawalRules() {
  return http<WithdrawalRules>({
    method: 'GET',
    url: 'system-config/withdrawal-rules',
  });
}

/**
 * 主動向平台申請提現
 * POST /api/wallet/withdraw
 */
export interface WalletWithdrawPayload {
  amount: string | number;
  currency: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  withdraw_password: string;
}

export interface WalletWithdrawResponse {
  withdrawal_id: number;
  status: string; // pending
  status_text?: string;
  currency: string;
  amount: number;
  available?: number;
  frozen?: number;
  [key: string]: any;
}

export function submitWalletWithdraw(data: WalletWithdrawPayload) {
  return http<WalletWithdrawResponse>({
    method: 'POST',
    url: 'wallet/withdraw',
    data,
  });
}

/**
 * 查詢充值申請記錄與審核狀態
 * GET /api/wallet/deposits
 */
export interface WalletDepositListQuery {
  status?: number; // 0=審核中、1=已通過、2=已拒絕
  page?: number;
  limit?: number;
}

export interface WalletDepositListItem {
  id: number;
  currency: string;
  amount: string;
  proof_img?: string | null;
  tx_id?: string | null;
  status: number;
  status_text?: string;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface WalletDepositListResponse {
  list: WalletDepositListItem[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export function getWalletDeposits(params: WalletDepositListQuery = {}) {
  return http<WalletDepositListResponse>({
    method: 'GET',
    url: 'wallet/deposits',
    data: params,
  });
}

/**
 * 查詢提現申請記錄與審核狀態
 * GET /api/wallet/withdrawals
 */
export interface WalletWithdrawalListQuery {
  status?: number; // 0=審核中、1=已通過、2=已拒絕
  page?: number;
  limit?: number;
}

export interface WalletWithdrawalListItem {
  id: number;
  currency: string;
  amount: string;
  fee: string;
  actual_amount: string;
  method?: string;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  to_address?: string | null;
  tx_id?: string | null;
  status: number;
  status_text?: string;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface WalletWithdrawalListResponse {
  list: WalletWithdrawalListItem[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export function getWalletWithdrawals(params: WalletWithdrawalListQuery = {}) {
  return http<WalletWithdrawalListResponse>({
    method: 'GET',
    url: 'wallet/withdrawals',
    data: params,
  });
}

