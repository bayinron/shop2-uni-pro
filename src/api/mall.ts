import { http } from '@/utils/request';

/**
 * 商城系統 API
 *
 * 約定：
 * - 路徑均已去掉 `/api/` 前綴，實際由全局攔截器補上。
 * - 公開接口：無需登入；購物車/訂單：需 JWT。
 */

/**
 * =========================
 * 一、公開接口 (免登入)
 * =========================
 */

// ===== 分類管理 (Category) =====

// 1. 獲取分類樹 - GET /api/mall/categories/tree
export interface MallCategoryTreeNode {
  id: number;
  name: string;
  children?: MallCategoryTreeNode[];
  [key: string]: any;
}

export function getCategoryTree() {
  return http<MallCategoryTreeNode[]>({
    method: 'GET',
    url: 'mall/categories/tree',
  });
}

// 2. 獲取特定分類詳情 - GET /api/mall/categories/:id
export function getCategoryDetail(id: number) {
  return http<MallCategoryTreeNode>({
    method: 'GET',
    url: `mall/categories/${id}`,
  });
}

// 3. 獲取分類下的商品列表 - GET /api/mall/categories/:id/products
export function getCategoryProducts(id: number, params: { page?: number; limit?: number } = {}) {
  return http<any>({
    method: 'GET',
    url: `mall/categories/${id}/products`,
    data: params,
  });
}

// 4. 分類列表 - GET /api/mall/categories
export interface CategoryListParams {
  page?: number;
  per_page?: number;
}

export function getCategoryList(params: CategoryListParams = {}) {
  return http<MallCategoryTreeNode[]>({
    method: 'GET',
    url: 'mall/categories',
    data: params,
  });
}

// ===== 店鋪與商鋪分類 (Shop) =====

// 1. 獲取商鋪的專屬分類 - GET /api/mall/shop-categories
export interface MallShopCategory {
  id: number;
  name: string;
  [key: string]: any;
}

export function getShopCategories() {
  return http<MallShopCategory[]>({
    method: 'GET',
    url: 'mall/shop-categories',
  });
}

// 2. 該分類下的商鋪列表 - GET /api/mall/shop-categories/:id/shops
export interface MallShop {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  rating?: number;
  total_sales?: number;
  total_orders?: number;
  [key: string]: any;
}

export function getShopCategoryShops(params: {
  page?: number;
  limit?: number;
  keyword?: string;
  category_id?: number;
}) {
  return http<{ list: MallShop[]; total?: number }>({
    method: 'GET',
    url: `mall/shop-categories/${params.category_id}/shops`,
    data: params,
  });
}

// 3. 獲取所有店鋪清單 - GET /api/mall/shops
export interface MallShopListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  category_id?: number;
}

export function getMallShopList(params: MallShopListParams = {}) {
  return http<{ list: MallShop[]; total?: number }>({
    method: 'GET',
    url: 'mall/shops',
    data: params,
  });
}

// 4. 獲得單一店鋪面板詳情 - GET /api/mall/shops/:id
export function getMallShopDetail(id: number) {
  return http<MallShop>({
    method: 'GET',
    url: `mall/shops/${id}`,
  });
}

// 5. 取得該店鋪上架的所有商品列表 - GET /api/mall/shops/:id/products
export interface MallShopProductsParams {
  page?: number;
  limit?: number;
  category_id?: number;
  keyword?: string;
}

export interface MallProductListItem {
  id: number; // shop_products.id
  product_id: number;
  shop_id: number;
  name: string;
  description?: string;
  actual_price: number;
  display_sold_count: number;
  display_stock: number;
  available_stock: number;
  product?: Record<string, any> | null;
  shop?: Record<string, any> | null;
  [key: string]: any;
}

export function getMallShopProducts(id: number, params: MallShopProductsParams = {}) {
  return http<{ list: MallProductListItem[]; total?: number }>({
    method: 'GET',
    url: `mall/shops/${id}/products`,
    data: params,
  });
}

// ===== 全局商品列表與詳情 (Product) =====

export interface MallProductListParams {
  page?: number;
  limit?: number;
  category_id?: number;
  shop_id?: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: number;
  sort?: 'latest' | 'popular' | 'price_asc' | 'price_desc' | string;
}

export function getMallProductList(params: MallProductListParams = {}) {
  return http<{ list: MallProductListItem[]; total?: number }>({
    method: 'GET',
    url: 'mall/products',
    data: params,
  });
}

// ⚠️ 文档提醒：这里的 id 为 products 表主鍵（非列表頂層 shop_products.id）
export interface MallProductDetail {
  id: number; // products.id
  name: string;
  description?: string;
  [key: string]: any;
}

export function getMallProductDetail(id: number) {
  return http<MallProductDetail>({
    method: 'GET',
    url: `mall/products/${id}`,
  });
}

/**
 * =========================
 * 二、購物車管理 (Cart) - 需認證
 * =========================
 */

// 1. 獲取購物車摘要與清單 - GET /api/mall/cart
export interface MallCartItem {
  id: number;
  shop_id: number;
  product_id: number;
  quantity: number;
  selected_sku?: string | null;
  is_selected: boolean;
  [key: string]: any;
}

export interface MallCartResponse {
  items: MallCartItem[];
  total_amount: number;
  selected_amount: number;
  item_count: number;
  [key: string]: any;
}

export function getMallCart(options: { noLoading?: boolean } = {}) {
  return http<MallCartResponse>({
    method: 'GET',
    url: 'mall/cart',
    ...options,
  });
}

// 2. 加入新商品 - POST /api/mall/cart
export interface MallCartAddPayload {
  shop_id: number;
  product_id: number;
  quantity: number;
  /** 文档字段为 sku；项目历史字段为 selected_sku，这里兼容两者 */
  sku?: string;
  selected_sku?: string;
}

export function addMallCartItem(data: MallCartAddPayload) {
  return http<MallCartResponse>({
    method: 'POST',
    url: 'mall/cart',
    data,
  });
}

// 3. 更新單筆資料 - PUT /api/mall/cart/:id
export interface MallCartUpdatePayload {
  quantity: number;
}

export function updateMallCartItem(id: number, data: MallCartUpdatePayload) {
  return http<MallCartResponse>({
    method: 'PUT',
    url: `mall/cart/${id}`,
    data,
  });
}

// 4. 移除單筆紀錄 - DELETE /api/mall/cart/:id
export function deleteMallCartItem(id: number) {
  return http<MallCartResponse>({
    method: 'DELETE',
    url: `mall/cart/${id}`,
  });
}

// 5. 大批清除項目 - DELETE /api/mall/cart
export function deleteMallCartItems(ids: number[]) {
  return http<MallCartResponse>({
    method: 'DELETE',
    url: 'mall/cart',
    data: { ids },
  });
}

/**
 * =========================
 * 三、買家訂單管理 (Order) - 需認證
 * =========================
 */

// 0. 訂單試算 (下單前預覽) - POST /api/mall/orders/preview
export interface MallOrderPreviewByCart {
  cart_ids: number[];
  shop_id?: number;
}

export interface MallOrderPreviewItem {
  product_id: number;
  quantity: number;
  sku?: string;
}

export interface MallOrderPreviewByItems {
  items: MallOrderPreviewItem[];
  shop_id?: number;
}

export type MallOrderPreviewPayload = MallOrderPreviewByCart | MallOrderPreviewByItems;

export function previewMallOrder(data: MallOrderPreviewPayload) {
  return http<any>({
    method: 'POST',
    url: 'mall/orders/preview',
    data,
  });
}

// 1. 創建訂單 (結帳下單) - POST /api/mall/orders
export interface MallOrderAddress {
  receiver_name: string;
  receiver_phone: string;
  city: string;
  district: string;
  address: string;
}

export interface MallCreateOrderPayload {
  cart_ids: number[];
  shop_id: number;
  address: MallOrderAddress;
  remark?: string;
}

export function createMallOrder(data: MallCreateOrderPayload) {
  return http<MallOrder[]>({
    method: 'POST',
    url: 'mall/orders',
    data,
  });
}

// 2. 我的訂單列表 - GET /api/mall/orders
export type MallOrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | string;

export interface MallOrderListParams {
  status?: MallOrderStatus;
  page?: number;
  limit?: number;
}

export interface MallOrderItem {
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

export interface MallOrder {
  id: number;
  order_no: string;
  status: MallOrderStatus;
  payment_status: 'unpaid' | 'paid' | 'refunding' | 'refunded' | string;
  subtotal: string;
  shipping_fee: string;
  discount_amount: string;
  fee_amount: string;
  total_amount: string;
  paid_amount: string;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: Record<string, any>;
  logistics_provider?: string;
  tracking_number?: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  payment_time?: string | null;
  buyer_remark?: string | null;
  shop: {
    id: number;
    name: string;
    logo?: string;
    rating?: number;
    [key: string]: any;
  };
  items: MallOrderItem[];
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface MallOrderListResponse {
  list: MallOrder[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export function getMallOrderList(params: MallOrderListParams = {}) {
  return http<MallOrderListResponse>({
    method: 'GET',
    url: 'mall/orders',
    data: params,
  });
}

// 3. 查看單筆訂單 - GET /api/mall/orders/:id
export function getMallOrderDetail(id: number) {
  return http<MallOrder>({
    method: 'GET',
    url: `mall/orders/${id}`,
  });
}

// 4. 訂單付款 - POST /api/mall/orders/:id/pay
export function payMallOrder(id: number, data: { payment_method?: string } = {}) {
  return http<any>({
    method: 'POST',
    url: `mall/orders/${id}/pay`,
    data,
  });
}

// 5. 取消訂單 - POST /api/mall/orders/:id/cancel
export function cancelMallOrder(id: number) {
  return http<any>({
    method: 'POST',
    url: `mall/orders/${id}/cancel`,
  });
}

// 6. 確認收貨 - POST /api/mall/orders/:id/confirm
export function confirmMallOrder(id: number) {
  return http<any>({
    method: 'POST',
    url: `mall/orders/${id}/confirm`,
  });
}

// 7. 申請退款 - POST /api/mall/orders/:order_id/items/:item_id/refund
export function applyMallOrderItemRefund(orderId: number, itemId: number, data: { reason: string }) {
  return http<any>({
    method: 'POST',
    url: `mall/orders/${orderId}/items/${itemId}/refund`,
    data,
  });
}

// 8. 查詢退款狀態 - GET /api/mall/orders/:order_id/items/:item_id/refund
export function getMallOrderItemRefund(orderId: number, itemId: number) {
  return http<any>({
    method: 'GET',
    url: `mall/orders/${orderId}/items/${itemId}/refund`,
  });
}
