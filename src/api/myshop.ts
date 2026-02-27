import { http } from '@/utils/request';

/**
 * 我的店鋪相關 API
 *
 * 規則：
 * - 所有路徑均去掉 `/api/` 前綴，交由全局攔截器處理。
 * - 所有接口均需認證（攔截器會自動帶上 token）。
 */

/**
 * =========================
 * 商戶申請
 * =========================
 */

export interface MerchantApplicationPayload {
  applicant_name: string;        // 申請人真實姓名（必填）
  shop_name: string;             // 預期建立的商鋪名稱（必填）
  shop_description?: string;     // 商鋪介紹（可選）
  shop_category_id?: number;     // 店鋪類別 ID（可選）
  id_doc_front_url?: string;     // 身份證正面照片 URL（首次必填）
  id_doc_back_url?: string;      // 身份證背面照片 URL（首次必填）
  bank_passbook_url?: string;    // 銀行存摺照片 URL（首次必填）
  shop_logo_url?: string;        // 店鋪 Logo URL（可選）
}

export type MerchantApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing';

export interface MerchantApplicationInfo {
  id: number;
  user_id: number;
  status: MerchantApplicationStatus;
  applicant_name: string;
  shop_name: string;
  shop_description?: string | null;
  shop_logo_url?: string | null;
  shop_category_id?: number | null;
  id_doc_front_url?: string | null;
  id_doc_back_url?: string | null;
  bank_passbook_url?: string | null;
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

/**
 * 提交 / 重新提交商戶申請
 * POST /api/merchant-application
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
 * 查詢最新商戶申請狀態
 * GET /api/merchant-application
 */
export function getLatestMerchantApplication() {
  return http<MerchantApplicationInfo>({
    method: 'GET',
    url: 'merchant-application',
  });
}

/**
 * =========================
 * 商品管理
 * =========================
 */

// 1. 商品池（可上架的商品）
export interface MyShopPoolParams {
  page?: number;
  limit?: number;
  keyword?: string;
  category_id?: number;
}

export function getMyShopProductPool(params: MyShopPoolParams = {}) {
  return http<any>({
    method: 'GET',
    url: 'mall/my-shop/pool',
    data: params,
  });
}

// 2. 我的商品列表
export interface MyShopProductsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  is_selling?: boolean;
}

// 0.5 獲取我的商品列表 - GET /api/mall/my-shop/products
export interface MyShopProductsParams {
    page?: number;
    limit?: number;
    is_selling?: boolean;
    keyword?: string;
}
export interface MyShopProduct {
    id: number;
    shop_id: number;
    product_id: number;
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
        id: number;
        shop_id: number;
        category_id: number;
        sku: string | null;
        name: string;
        description: string;
        cover_image: string | null;
        stock: number;
        reserved_stock: number;
        original_price: string;
        sale_price: string;
        free_shipping_quantity: number | null;
        free_shipping_amount: number | null;
        fees: number | null;
        sold_count: number;
        view_count: number;
        display_sold_type: string;
        display_sold_modifier: string;
        status: string;
        is_featured: number;
        logistics_provider_id: number | null;
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
    }
}

export interface MyShopProductsResponse {
    code: number;
    message: string;
    data: {
        list: MyShopProduct[];
        total: number;
        page: number;
        limit: number;
    };
}
export function getMyShopProducts(params: MyShopProductsParams = {}) {
  return http<any>({
    method: 'GET',
    url: 'mall/my-shop/products',
    data: params,
  });
}

// 3. 添加商品到店鋪
export interface AddMyShopProductPayload {
  product_id: number;
}

export function addProductToMyShop(data: AddMyShopProductPayload) {
  return http<any>({
    method: 'POST',
    url: 'mall/my-shop/products',
    data,
  });
}

// 4. 移除商品（product_id）
export function removeMyShopProduct(productId: number) {
  return http<any>({
    method: 'DELETE',
    url: `mall/my-shop/products/${productId}`,
  });
}

// 5. 更新商品展示配置
export type DisplaySoldType = 'exact' | 'add_value' | 'add_percent' | 'multiply';

export interface UpdateProductDisplayConfigPayload {
  display_sold_type?: DisplaySoldType;
  display_sold_modifier?: number;
}

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

// 6. 切換上下架狀態
export interface UpdateProductStatusPayload {
  is_selling: boolean;
}

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
 * 店鋪統計
 * =========================
 */

export interface MyShopStats {
  total_sales: number;
  total_orders: number;
  total_products: number;
  selling_products: number;
  pending_orders: number;
  processing_orders: number;
}

/**
 * 獲取店鋪統計數據
 * GET /api/mall/my-shop/stats
 */
export function getMyShopStats() {
  return http<MyShopStats>({
    method: 'GET',
    url: 'mall/my-shop/stats',
  });
}

/**
 * =========================
 * 財務管理
 * =========================
 */

// 1. 銷售報表
export interface MyShopSalesParams {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export function getMyShopSales(params: MyShopSalesParams = {}) {
  return http<any>({
    method: 'GET',
    url: 'mall/my-shop/financial/sales',
    data: params,
  });
}

// 2. 分紅記錄
export type CommissionStatus = 'pending' | 'settled' | 'paid';

export interface MyShopCommissionParams {
  status?: CommissionStatus;
  page?: number;
  limit?: number;
}

export function getMyShopCommissions(params: MyShopCommissionParams = {}) {
  return http<any>({
    method: 'GET',
    url: 'mall/my-shop/financial/commissions',
    data: params,
  });
}

// 3. 財務摘要
export interface MyShopFinancialSummary {
  pending_commission: number;
  settled_commission: number;
  paid_commission: number;
  available_balance: number;
  total_earnings: number;
}

export function getMyShopFinancialSummary() {
  return http<MyShopFinancialSummary>({
    method: 'GET',
    url: 'mall/my-shop/financial/summary',
  });
}

// 5. 提領到錢包
export interface MyShopWithdrawPayload {
  amount: number;
  currency: string;
  remark?: string;
}

export interface MyShopWithdrawResponse {
  id?: number;
  amount: number;
  currency: string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export function withdrawMyShopToWallet(data: MyShopWithdrawPayload) {
  return http<MyShopWithdrawResponse>({
    method: 'POST',
    url: 'mall/my-shop/financial/withdraw',
    data,
  });
}

