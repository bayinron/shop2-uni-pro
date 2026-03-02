import { http } from '@/utils/request';

/**
 * 資金流水記錄 / 錢包流水相關 API
 *
 * 約定：
 * - 路徑均已去掉 `/api/` 前綴，實際由全局攔截器補上。
 * - 所有接口均需登入認證（token 由攔截器處理）。
 */

/**
 * =========================
 * 1. 資金流水報表 (明細)
 * =========================
 *
 * GET /api/balance-logs/my-logs
 * 路徑：balance-logs/my-logs
 */

export interface BalanceLogQuery {
  /** 流水類別行為過濾，如 'deposit' | 'commission' | ... */
  type?: string;
  /** 事件原始觸發點過濾，如 'order' | 'withdrawal' | 'deposit' | 'commission' */
  related_type?: string;
  /** 起始日期 YYYY-MM-DD */
  start_date?: string;
  /** 結束日期 YYYY-MM-DD */
  end_date?: string;
  /** 頁碼，默認 1 */
  page?: number;
  /** 每頁條數，默認 20 */
  limit?: number;
}

export interface BalanceLogItem {
  id: number;
  user_id: number;
  type: string;
  type_name: string;
  amount: string;           // 真實資金變化（字串避免前端捨入）
  amount_text: string;      // 已帶符號/貨幣符號的展示文本
  balance_before: string;
  balance_after: string;
  frozen_before: string;
  frozen_after: string;
  description?: string | null;
  related_id?: number | null;
  related_type?: string | null;
  created_at: string;
  [key: string]: any;
}

export interface BalanceLogListResponse {
  list: BalanceLogItem[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export function getMyBalanceLogs(params: BalanceLogQuery = {}) {
  return http<BalanceLogListResponse>({
    method: 'GET',
    url: 'balance-logs/my-logs',
    data: params,
  });
}

/**
 * =========================
 * 2. 時段統計總覽 (my-stats)
 * =========================
 *
 * GET /api/balance-logs/my-stats
 */

export interface BalanceLogStatsQuery {
  /** 起始日期 YYYY-MM-DD */
  start_date?: string;
  /** 結束日期 YYYY-MM-DD */
  end_date?: string;
}

export interface BalanceLogTypeStat {
  type: string;
  count: number;
  total: string;
}

export interface BalanceLogStats {
  income: string;               // 正向交易總和
  expense: string;              // 耗損絕對值總和
  net: string;                  // 淨利差 = income - expense
  type_stats: BalanceLogTypeStat[];
  [key: string]: any;
}

export function getMyBalanceLogStats(params: BalanceLogStatsQuery = {}) {
  return http<BalanceLogStats>({
    method: 'GET',
    url: 'balance-logs/my-stats',
    data: params,
  });
}

/**
 * =========================
 * 3. 流水類型字典 (type / related_type)
 * =========================
 *
 * GET /api/balance-logs/types
 * 方便前端動態獲取 type / related_type 字典與多語轉譯。
 */

export interface BalanceLogTypeDictItem {
  type: string;
  type_name: string;
  sign?: '+' | '-' | '±';
  [key: string]: any;
}

export function getBalanceLogTypes() {
  return http<BalanceLogTypeDictItem[]>({
    method: 'GET',
    url: 'balance-logs/types',
  });
}

/**
 * =========================
 * 4. 錢包精細快照 (wallet_transactions)
 * =========================
 *
 * 4.1 查詢所有幣種的精細流水
 * GET /api/wallet/transactions
 *
 * 4.2 查詢指定幣種的精細流水
 * GET /api/wallet/:currency/transactions
 */

export interface WalletTransactionQuery {
  /** 幣種代碼，如 'USDT'（只對 /wallet/transactions 有效） */
  currency?: string;
  /** 交易類型，如 'deposit' | 'withdraw' 等 */
  type?: string;
  /** 起始日期 YYYY-MM-DD */
  start_date?: string;
  /** 結束日期 YYYY-MM-DD */
  end_date?: string;
  /** 頁碼，默認 1 */
  page?: number;
  /** 每頁條數，默認 20，上限 100 */
  page_size?: number;
}

export interface WalletTransactionItem {
  id: number;
  user_id: number;
  currency: string;
  type: string;
  amount: string;           // Decimal -> string
  balance_before: string;
  balance_after: string;
  frozen_before: string;
  frozen_after: string;
  related_id: string | number | null;
  related_type: string | null;
  description?: string | null;
  status: 'success' | 'pending' | 'failed' | string;
  created_at: string;
  [key: string]: any;
}

export interface WalletTransactionListResponse {
  list: WalletTransactionItem[];
  total?: number;
  page?: number;
  page_size?: number;
  [key: string]: any;
}

// 4.1 查詢所有幣種的精細流水
export function getWalletTransactions(params: WalletTransactionQuery = {}) {
  return http<WalletTransactionListResponse>({
    method: 'GET',
    url: 'wallet/transactions',
    data: params,
  });
}

// 4.2 查詢指定幣種的精細流水
export function getWalletTransactionsByCurrency(
  currency: string,
  params: Omit<WalletTransactionQuery, 'currency'> = {},
) {
  return http<WalletTransactionListResponse>({
    method: 'GET',
    url: `wallet/${currency}/transactions`,
    data: params,
  });
}

