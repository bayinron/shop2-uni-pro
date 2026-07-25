import { http } from '@/utils/request';

/**
 * 我的店鋪 API（03_My_Shop: 商家管理）
 *
 * 規則：
 * - 所有路徑均去掉 `/api/` 前綴，交由全局攔截器處理。
 * - 此模組下所有接口均需登入 Token 驗證。
 * - 所有 *_url 必須是 POST /api/upload 回傳的真實 URL，嚴禁 blob: / data:。
 */

/**
 * =========================
 * 一、商戶申請與狀態
 * =========================
 */

/** 提交 / 重新提交商戶申請 */
export interface MerchantApplicationPayload {
  /** 申請人真實姓名（必填） */
  applicant_name: string;
  /** 預期建立的商鋪名稱（必填） */
  shop_name: string;
  /** 店鋪主分類 ID（可選） */
  shop_category_id?: number;
  /** 店鋪介紹文案（可選） */
  shop_description?: string;
  /**
   * 身份證正面 URL（首次強驗）
   * 重送時若前次已有值可省略，後端自動沿用
   */
  id_doc_front_url?: string;
  /** 身份證背面 URL（首次強驗） */
  id_doc_back_url?: string;
  /** 存摺 / 銀行文件 URL（首次強驗） */
  bank_passbook_url?: string;
  /** 店鋪 Logo URL（選填） */
  shop_logo_url?: string;
}

export type MerchantApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface MerchantApplicationInfo {
  id: number;
  status: MerchantApplicationStatus;
  applicant_name?: string;
  shop_name?: string;
  shop_description?: string | null;
  shop_category_id?: number | null;
  shop_logo_url?: string | null;
  id_doc_front_url?: string | null;
  id_doc_back_url?: string | null;
  bank_passbook_url?: string | null;
  /** 被拒絕時管理員留下的原因 */
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  [key: string]: any;
}

/**
 * 1. 提交 / 重新提交商戶申請
 * POST /api/merchant-application
 *
 * 首次必須提交三張證件：id_doc_front_url、id_doc_back_url、bank_passbook_url。
 * 被拒絕後重送時，若前次該欄位已有值可省略（後端沿用）。
 */
export function submitMerchantApplication(payload: MerchantApplicationPayload) {
  return http<MerchantApplicationInfo>({
    method: 'POST',
    url: 'merchant-application',
    header: {
      'Content-Type': 'application/json',
    },
    data: payload,
  });
}

/**
 * 2. 獲取申請狀態
 * GET /api/merchant-application
 *
 * 取得使用者最新申請狀態；rejected 時可預填表單後重新送出。
 */
export function getLatestMerchantApplication() {
  return http<MerchantApplicationInfo>({
    method: 'GET',
    url: 'merchant-application',
  });
}

/** 我的店鋪資料（編輯表單預填） */
export interface MyShopProfile {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  /** 店鋪頭像完整 URL */
  logo?: string | null;
  /** 店鋪封面完整 URL */
  cover_image?: string | null;
  rating: string;
  status: string;
  [key: string]: any;
}

/**
 * 3. 獲取我的店鋪資料
 * GET /api/mall/my-shop/profile
 *
 * 尚未成為商戶時回 403「尚未成為商戶，請先提交商戶申請」。
 */
export function getMyShopProfile() {
  return http<MyShopProfile>({
    method: 'GET',
    url: 'mall/my-shop/profile',
  });
}

/** 更新我的店鋪資料（只更新有傳入的欄位） */
export interface UpdateMyShopProfilePayload {
  /** 店鋪名稱；若傳入則不可為空白，最長 100 字 */
  name?: string;
  /** 店鋪簡介；傳空字串等同清除 */
  description?: string;
  /** 頭像 URL（來自 /api/upload）；傳空字串等同移除 */
  logo?: string;
  /** 封面 URL（來自 /api/upload）；傳空字串等同移除 */
  cover_image?: string;
}

/**
 * 4. 更新我的店鋪資料
 * PUT /api/mall/my-shop/profile
 *
 * logo / cover_image 嚴禁傳 blob: / data:。
 * 一個可更新欄位都沒帶時回 400「請提供要更新的資料」。
 */
export function updateMyShopProfile(data: UpdateMyShopProfilePayload) {
  return http<MyShopProfile>({
    method: 'PUT',
    url: 'mall/my-shop/profile',
    data,
  });
}

/**
 * =========================
 * 二、商家商品管理（選品庫邏輯）
 * =========================
 *
 * 商家不可定義價格：original_price / sale_price 由平台管理員設定。
 * 商家僅能從平台商品池挑選商品，並自訂展示欄位（名稱、假銷量、上下架等）。
 */

/** 平台商品池查詢參數 */
export interface MyShopPoolParams {
  page?: number;
  /** 未帶時預設 20 */
  limit?: number;
  /** 搜尋關鍵字（比對商品名稱） */
  keyword?: string;
  /**
   * 商品分類 ID（product_categories.id）
   * 請用 GET /api/mall/categories，不可用店鋪分類 shop-categories
   */
  category_id?: number;
}

/**
 * 1. 獲取平台商品池（可選取、尚未加入本店的商品）
 * GET /api/mall/my-shop/pool
 */
export function getMyShopProductPool(params: MyShopPoolParams = {}) {
  return http<any>({
    method: 'GET',
    url: 'mall/my-shop/pool',
    data: params,
  });
}

/** 我的店鋪商品清單查詢參數 */
export interface MyShopProductsParams {
  page?: number;
  /** 未帶時預設 20 */
  limit?: number;
  keyword?: string;
  /** 是否正在上架中 */
  is_selling?: boolean;
}

export interface MyShopProduct {
  id: number | string;
  shop_id: number | string;
  /** 平台商品實體主鍵，後續 config / status / DELETE 皆用此欄位 */
  product_id: number | string;
  custom_name: string | null;
  custom_description: string | null;
  custom_stock: number;
  is_selling: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  sold_count: number;
  sales_amount: string;
  display_sold_type: string;
  display_sold_modifier: string;
  is_featured: number;
  featured_order: number;
  product: {
    id: number | string;
    shop_id: number | string;
    category_id: number | string;
    sku: string | null;
    name: string;
    description: string;
    cover_image: string | null;
    stock: number;
    reserved_stock: number;
    original_price: string;
    sale_price: string;
    discount_type: string;
    discount_value: string;
    storage_type: string;
    weight: string;
    shipping_fee: string;
    free_shipping_quantity: number | null;
    free_shipping_amount: number | null;
    fees: number | string | null;
    sold_count: number;
    view_count: number;
    display_sold_type: string;
    display_sold_modifier: string;
    status: string;
    is_featured: number;
    logistics_provider_id: number | string | null;
    payment_methods: any;
    coupon_applicable: number;
    min_purchase_discount: any;
    group_buy_config: any;
    flash_sale_config: any;
    version: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_unlimited_stock: number;
    images: any[];
    display_sold_count: number;
    /** 唯讀計算欄位（請求時請用 custom_stock） */
    display_stock: number;
  };
}

export interface MyShopProductsResponse {
  list: MyShopProduct[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 2. 我的店鋪商品清單
 * GET /api/mall/my-shop/products
 */
export function getMyShopProducts(params: MyShopProductsParams = {}) {
  return http<MyShopProductsResponse>({
    method: 'GET',
    url: 'mall/my-shop/products',
    data: params,
  });
}

export interface AddMyShopProductPayload {
  /** 平台原始實體商品 ID；價格自動繼承平台 */
  product_id: number;
}

/**
 * 3. 加入 / 選取商品至我的店鋪
 * POST /api/mall/my-shop/products
 */
export function addProductToMyShop(data: AddMyShopProductPayload) {
  return http<any>({
    method: 'POST',
    url: 'mall/my-shop/products',
    data,
  });
}

/**
 * 4. 將商品下架並移出鋪子
 * DELETE /api/mall/my-shop/products/:product_id
 *
 * @param productId products 表主鍵（列表中的 product_id，非頂層 id）
 */
export function removeMyShopProduct(productId: number) {
  return http<any>({
    method: 'DELETE',
    url: `mall/my-shop/products/${productId}`,
  });
}

/** 假銷量修飾法 */
export type DisplaySoldType = 'exact' | 'add_value' | 'add_percent' | 'multiply';

/**
 * 更新商品的商家展示配置
 * Response 中展示庫存欄位名為 display_stock（唯讀）；
 * Request 必須使用 custom_stock。
 */
export interface UpdateProductDisplayConfigPayload {
  /** 商家自定顯示名稱，覆寫 name */
  custom_name?: string;
  /** 商家自定商品說明，覆寫 description */
  custom_description?: string;
  /** 前台展示庫存數字（不影響實際 stock） */
  custom_stock?: number;
  /**
   * exact / add_value / add_percent / multiply
   * exact 且 modifier 為 0 時，退回商品主檔顯示銷量設定
   */
  display_sold_type?: DisplaySoldType;
  /** 與 display_sold_type 搭配的修飾基準值 */
  display_sold_modifier?: number;
}

/**
 * 5. 更新商品的商家展示配置
 * PUT /api/mall/my-shop/products/:product_id/config
 */
export function updateMyShopProductDisplayConfig(
  productId: number,
  data: UpdateProductDisplayConfigPayload,
) {
  return http<any>({
    method: 'PUT',
    url: `mall/my-shop/products/${productId}/config`,
    data,
  });
}

export interface UpdateProductStatusPayload {
  /** 是否開放前台購買 */
  is_selling: boolean;
}

/**
 * 6. 切換上下架狀態
 * PUT /api/mall/my-shop/products/:product_id/status
 */
export function updateMyShopProductStatus(
  productId: number,
  data: UpdateProductStatusPayload,
) {
  return http<any>({
    method: 'PUT',
    url: `mall/my-shop/products/${productId}/status`,
    data,
  });
}

/**
 * =========================
 * 三、店舖訂單管理
 * =========================
 */

/** 店鋪統計總覽（三段巢狀：sales / behavior / products） */
export interface MyShopStats {
  sales: {
    /** 已付款且未取消訂單的 total_amount 加總 */
    total_revenue: number;
    /** 平台抽成手續費加總 */
    total_platform_fee: number;
    /** total_revenue - total_platform_fee */
    net_revenue: number;
    /** 已付款且未取消的訂單筆數 */
    order_count: number;
    /** 不重複買家人數 */
    customer_count: number;
  };
  behavior: {
    total_views: number;
    /** 累計停留秒數 */
    total_duration: number;
    visitor_count: number;
  };
  products: {
    total: number;
    /** 已發布（published）的商品數 */
    published: number;
  };
}

/**
 * 1. 店鋪統計總覽
 * GET /api/mall/my-shop/stats
 *
 * 不提供 total_sales / pending_orders 等平面欄位。
 * 待出貨請改用 GET mall/my-shop/orders?status=paid。
 */
export function getMyShopStats() {
  return http<MyShopStats>({
    method: 'GET',
    url: 'mall/my-shop/stats',
  });
}

export interface MyShopOrderBuyer {
  id: number;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  [key: string]: any;
}

export interface MyShopOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image_url: string;
  sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  discount_amount: string;
  refund_status: string;
  refund_amount: string;
  [key: string]: any;
}

export interface MyShopOrder {
  id: number;
  order_no: string;
  status: string;
  payment_status: 'unpaid' | 'paid' | 'refunding' | 'refunded' | string;
  subtotal: string;
  shipping_fee: string;
  discount_amount: string;
  total_amount: string;
  paid_amount: string;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: Record<string, any>;
  buyer: MyShopOrderBuyer;
  items: MyShopOrderItem[];
  created_at: string;
  logistics_provider?: string | null;
  tracking_number?: string | null;
  [key: string]: any;
}

export interface GetMyShopOrdersParams {
  /** 訂單狀態篩選（同商城訂單狀態機） */
  status?: string;
  payment_status?: 'unpaid' | 'paid' | 'refunding' | 'refunded' | string;
  /** 訂單編號模糊搜尋 */
  order_no?: string;
  page?: number;
  limit?: number;
}

export interface MyShopOrderListResponse {
  list: MyShopOrder[];
  total: number;
  page: number;
  limit: number;
  [key: string]: any;
}

/**
 * 2. 店鋪訂單列表（賣家視角）
 * GET /api/mall/my-shop/orders
 */
export function getMyShopOrders(params: GetMyShopOrdersParams = {}) {
  return http<MyShopOrderListResponse>({
    method: 'GET',
    url: 'mall/my-shop/orders',
    data: params,
  });
}

/**
 * 3. 店鋪訂單詳情（賣家視角）
 * GET /api/mall/my-shop/orders/:id
 */
export function getMyShopOrderDetail(orderId: number) {
  return http<MyShopOrder>({
    method: 'GET',
    url: `mall/my-shop/orders/${orderId}`,
  });
}

/** 賣家發貨請求參數 */
export interface ShipMyShopOrderPayload {
  /** 物流供應商名稱 */
  logistics_provider?: string;
  /** 物流追蹤編號 */
  tracking_number?: string;
}

/**
 * 4. 賣家發貨
 * POST /api/mall/my-shop/orders/:id/ship
 *
 * 前提：訂單 status 必須為 paid；成功後 status 變為 shipped。
 */
export function shipMyShopOrder(orderId: number, data: ShipMyShopOrderPayload = {}) {
  return http<MyShopOrder>({
    method: 'POST',
    url: `mall/my-shop/orders/${orderId}/ship`,
    data,
  });
}

/**
 * =========================
 * 四、店鋪營收與財務
 * =========================
 */

export interface MyShopSettlementWallet {
  /** 結算錢包可用餘額（即舊文檔口中的可提現餘額） */
  balance: number;
  frozen: number;
}

/**
 * 商家內部財務總覽
 * 注意：無 available_balance；也無 pending_commission 等舊欄位名。
 */
export interface MyShopFinancialSummary {
  /** 訂單尚未完成、狀態為 pending（待結算）的分紅金額 */
  pending_amount: number;
  /** 已結算、尚未撥款（settled）的分紅金額 */
  settled_amount: number;
  /** 已撥付（paid）的累計分紅金額 */
  paid_amount: number;
  /** pending + settled + paid */
  total_earned: number;
  settlement_wallet: MyShopSettlementWallet;
}

/**
 * 1. 商家內部財務總覽
 * GET /api/mall/my-shop/financial/summary
 */
export function getMyShopFinancialSummary() {
  return http<MyShopFinancialSummary>({
    method: 'GET',
    url: 'mall/my-shop/financial/summary',
  });
}

/** 銷售報表彙總維度 */
export type MyShopSalesGroupBy = 'day' | 'month' | 'product';

export interface MyShopSalesParams {
  /** 起始日期 YYYY-MM-DD，未帶預設 30 天前 */
  start_date?: string;
  /** 結束日期 YYYY-MM-DD，未帶預設今日 */
  end_date?: string;
  /** day（預設）/ month / product；不支援分頁 */
  group_by?: MyShopSalesGroupBy;
}

export interface MyShopSalesDayItem {
  date: string;
  order_count: number;
  total_amount: number | string;
  total_fee: number | string;
  [key: string]: any;
}

export interface MyShopSalesProductItem {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number | string;
  [key: string]: any;
}

export interface MyShopSalesResponse {
  list: Array<MyShopSalesDayItem | MyShopSalesProductItem>;
  summary: Record<string, any>;
}

/**
 * 2. 銷售報表明細
 * GET /api/mall/my-shop/financial/sales
 *
 * 不支援分頁（page / limit 會被忽略）。
 */
export function getMyShopSales(params: MyShopSalesParams = {}) {
  return http<MyShopSalesResponse>({
    method: 'GET',
    url: 'mall/my-shop/financial/sales',
    data: params,
  });
}

export type CommissionStatus = 'pending' | 'settled' | 'paid';

export interface MyShopCommissionParams {
  status?: CommissionStatus;
  page?: number;
  /** 未帶時預設 15 */
  limit?: number;
}

/**
 * 3. 分紅撥款紀錄
 * GET /api/mall/my-shop/financial/commissions
 */
export function getMyShopCommissions(params: MyShopCommissionParams = {}) {
  return http<any>({
    method: 'GET',
    url: 'mall/my-shop/financial/commissions',
    data: params,
  });
}

/**
 * 4. 申請撥款（保留接口，空實作）
 * POST /api/mall/my-shop/financial/apply-payout
 *
 * 僅回傳成功訊息，不會建立撥款單、不改變分紅狀態。
 * 前端請勿依賴此接口推進結算；兌現請用 withdrawMyShopEarnings。
 */
export function applyMyShopPayout() {
  return http<{ code: number; message: string; data: null }>({
    method: 'POST',
    url: 'mall/my-shop/financial/apply-payout',
  });
}

/**
 * 商家提現參數（與 POST /api/wallet/withdraw 完全一致）
 */
export interface MyShopWithdrawPayload {
  /** 支付密碼（未設定需先 PUT /api/auth/me/withdraw-password） */
  withdraw_password: string;
  /** 幣種代碼，如 USDT */
  currency: string;
  amount: number;
  /** 收款帳戶 ID；留白則使用預設帳戶 */
  payment_method_id?: number;
  remark?: string;
}

export interface MyShopWithdrawResponse {
  withdrawal_id?: number;
  id?: number;
  amount: number;
  currency: string;
  status?: string;
  status_text?: string;
  created_at?: string;
  [key: string]: any;
}

/**
 * 5. 商家提現
 * POST /api/mall/my-shop/financial/withdraw
 *
 * 已委派至錢包提現流程，參數與行為同 POST /api/wallet/withdraw。
 */
export function withdrawMyShopToWallet(data: MyShopWithdrawPayload) {
  return http<MyShopWithdrawResponse>({
    method: 'POST',
    url: 'mall/my-shop/financial/withdraw',
    data,
  });
}

/** @deprecated 請使用 withdrawMyShopToWallet */
export const withdrawMyShopEarnings = withdrawMyShopToWallet;
