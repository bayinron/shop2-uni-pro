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
 * 單錢包餘額明細
 */
export interface WalletBalanceDetail {
  balance: number | string;
  frozen: number | string;
  total: number | string;
  balance_formatted: string;
  frozen_formatted: string;
  total_formatted: string;
  [key: string]: any;
}

/**
 * 用戶當前餘額
 * GET /api/wallet/balance
 * 返回 balance_wallet（系統餘額）與 settlement_wallet（結算錢包）
 */
export interface WalletBalanceOverviewResponse {
  user_id: number;
  balance_wallet: WalletBalanceDetail;
  settlement_wallet: WalletBalanceDetail;
  total: number | string;
  total_formatted: string;
  balance_name: string;
  balance_symbol: string;
  updated_at: string;
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
export interface WalletBalanceItem {
  currency: string;
  available: string;
  frozen: string;
  balance: string;
  [key: string]: any;
}

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
 * 用戶收款方式管理（單一帳戶政策）
 *
 * 每位用戶僅能綁定一組收款帳戶，綁定後即鎖定。
 * 用戶端只能新增一次，之後無法自行修改、刪除或更換；
 * 任何異動一律由管理員在後台處理。
 *
 * 注意：被管理員停用（status = 0）的帳戶不會出現在 GET 列表中，
 * 但仍佔用綁定名額——此時列表為空而 POST 會回 403，
 * 前端需依 POST 錯誤訊息提示聯繫客服，不可僅憑列表為空就判定可綁定。
 * =========================
 */

/**
 * 綁定收款帳戶請求參數
 * POST /api/user/payment-methods
 *
 * is_default 已移除：單一帳戶必然是預設帳戶，傳入會被忽略。
 */
export interface BindPaymentMethodPayload {
  /** 收款姓名 */
  account_name: string;
  /** 收款帳號 */
  account_number: string;
  /** 銀行名稱 */
  bank_name: string;
}

/**
 * 用戶收款帳戶
 * GET /api/user/payment-methods 響應項
 *
 * 單一帳戶政策下正常情況只會有 0 或 1 筆：
 * 空陣列 = 尚未綁定（可顯示「新增收款帳戶」）；
 * 已有 1 筆 = 顯示帳戶資訊與「如需變更請聯繫客服」。
 */
export interface UserPaymentMethod {
  /** 收款帳戶記錄 ID */
  id: number;
  /** 收款姓名 */
  account_name: string;
  /** 收款帳號 */
  account_number: string;
  /** 銀行名稱 */
  bank_name: string;
  /** 是否為預設打款帳戶；單一帳戶時固定為 true */
  is_default: boolean;
  /** 1=啟用（列表僅回傳 status = 1 的帳戶） */
  status: number;
  [key: string]: any;
}

/**
 * 綁定收款帳戶
 * POST /api/user/payment-methods
 *
 * 每位用戶最多綁定一組，綁定成功後自動成為預設收款帳戶。
 *
 * 錯誤：
 *  - 401 用戶未登入
 *  - 403 您已綁定收款帳戶，如需變更請聯繫客服由管理員處理
 *  - 400 請輸入收款姓名／請輸入帳號／請輸入銀行名稱
 */
export function bindUserPaymentMethod(data: BindPaymentMethodPayload) {
  return http<UserPaymentMethod>({
    method: 'POST',
    url: 'user/payment-methods',
    data,
  });
}

/**
 * 查詢已綁定的收款帳戶列表
 * GET /api/user/payment-methods
 *
 * 回傳當前登入用戶有效（status = 1）的收款帳戶，正常為 0 或 1 筆。
 */
export function getUserPaymentMethods() {
  return http<UserPaymentMethod[]>({
    method: 'GET',
    url: 'user/payment-methods',
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
 * 可提現幣種
 * GET /api/wallet/withdraw-currencies
 */
export function getWithdrawCurrencies() {
  return http<WalletCurrency[]>({
    method: 'GET',
    url: 'wallet/withdraw-currencies',
  });
}

/**
 * 主動向平台申請提現（出金）
 * POST /api/wallet/withdraw
 *
 * 從用戶 SYS balance 錢包凍結指定金額（含手續費），建立提現申請等待審核。
 * 來源錢包固定為 balance；不再讀取 payment_method_id、payout_currency、
 * wallet_type、account_name、account_number、bank_name——收款帳戶由後端
 * 依用戶已綁定的有效帳戶自動帶入；未綁定時回 HTTP 403「請先綁定收款帳戶」。
 */
export interface WalletWithdrawPayload {
  /** 以 SYS 系統餘額計算的提現金額；建議傳數字字串，後端兼容 JSON number */
  amount: string | number;
  /** 提現／收款幣種代碼；SYS 按 1:1，其他幣種需已設定 SYS → 該幣種匯率 */
  currency: string;
  /** 用戶支付密碼（未設定需先 PUT /api/auth/me/withdraw-password） */
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
    data: {
      amount: typeof data.amount === 'number' ? String(data.amount) : String(data.amount).trim(),
      currency: String(data.currency).trim(),
      withdraw_password: String(data.withdraw_password),
    },
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

/**
 * =========================
 * 店鋪訂單發貨
 * =========================
 */

export interface ShipMyShopOrderPayload {
  /** 物流供應商名稱 */
  logistics_provider?: string;
  /** 物流追蹤編號 */
  tracking_number?: string;
}

/**
 * 賣家發貨
 * POST /api/mall/my-shop/orders/:id/ship
 *
 * 前提：訂單 status 必須為 pending_shipment；成功後 status 變為 pending_receipt。
 */
export function shipMyShopOrder(orderId: number, data: ShipMyShopOrderPayload = {}) {
  return http<any>({
    method: 'POST',
    url: `mall/my-shop/orders/${orderId}/ship`,
    data,
  });
}

