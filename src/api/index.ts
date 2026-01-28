import { http } from '@/utils/request';
import type {
    LerpApiResponse,
    LerpBannerItem,
    LerpGoodsItem,
    LerpNewsItem,
    LerpPageResult
} from './types';

export interface UserInfo {
    reg_type: number; //账号类型：1手机注册，2用户名注册
    username: string; //账号或手机号
    area_code: string; //区号，reg_type=1时有值
    phone: string; //手机号，reg_type=1时有值
    lev: number; //等级
    balance: string; //账户余额  可交易
    balance_t: string; //提现余额 可提现
    agent_id: number; //代理ID、
    p1: number; //上1级ID
    p2: number; //上2级iD
    p3: number; //上3级ID
    auth_status: number; //实名状态：0未提交 ，1待审核，2通过，3拒绝
    invite_code_status: number; //邀请码状态
    recharge_total: string; //累计充值金额
    credit_num: number; //信用分
    avatar: string; //头像
    c_total: number; //可用抽奖次数
    invite_code: string; //邀请码。在invite_code_status且累计充值>0时为真实邀请码
    is_payassword: number; //是否已设置了提现密码。1已设置，0未设置
    lev_info: {
        //等级信息
        id: number;
        lev: number; //等级
        name: string; //等级名称
        icon: string; //图标
        daily_job_num: number; //每日可刷单次数
        limit_amount: string; //单次最小提现金额
        min_withdrawal: string; //单次最小提现金额
        max_withdrawal: string; //单次最大提现金额
        commission_rate: string; //佣金比例。示例0.00115即0.115%
        withdrawal_fee_rate: string; //提现手续费。示例0.03即3%
    };
}

//获取主页配置
export function getHomeConfig() {
    return http<any>({
        method: 'GET',
        url: 'Index/index'
    });
}

/**
 * 目标站点（https://www.lcst-lerp.com/#/）首页接口
 *
 * 你已做反向代理，因此这里**不写死域名**，只写接口路径。
 * 默认按目标站点接口形态拼：/api/v1/xxx
 * 而本项目拦截器会在开发态拼接为：/api/api/{url}
 * 所以这里传 `v1/...`，最终会变成：
 * - dev:  /api/api/v1/...   (由你的反代转发到 /api/v1/...)
 * - prod: /api/v1/...
 */

// banner 列表
export function lerpGetBannerList() {
    return http<any>({
        method: 'GET',
        url: 'v1/banner/list'
    });
}

// 公告/新闻列表（站点首页用于跑马灯/公告）
export function lerpGetNewsList() {
    return http<any>({
        method: 'GET',
        url: 'v1/newsInfo/list'
    });
}

// 商品列表（站点首页：page=1&limit=20）
export function lerpGetShopGoodsList(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return http<LerpApiResponse<LerpPageResult<LerpGoodsItem> | LerpGoodsItem[]>>({
        method: 'GET',
        url: 'v1/shopGoods/list',
        data: { page, limit }
    });
}



// 1. 獲取廣告列表 (公開) - GET /api/content/ads
export function getPublicAdList(params: { position: string; limit?: number }) {
    return http<any>({
        method: 'GET',
        url: 'content/ads',
        data: params
    });
}

// 2. 獲取文章列表 - GET /api/articles
export interface ArticleListParams {
    page?: number;
    per_page?: number;
    category?: string;
    category_id?: number;
    language?: string;
    tags?: string;
    search?: string;
    status?: number; // 示例中有 status=1 的用法
    is_featured?: number; // 示例中有 is_featured=1 的用法
}

export function getArticleList(params: ArticleListParams = {}) {
    return http<any>({
        method: 'GET',
        url: 'articles',
        data: params
    });
}

// 3. 獲取文章詳情 - GET /api/articles/:id
export function getArticleDetail(id: number) {
    return http<any>({
        method: 'GET',
        url: `articles/${id}`
    });
}

// 4. 獲取所有標籤 - GET /api/articles/tags
export function getAllArticleTags() {
    return http<any>({
        method: 'GET',
        url: 'articles/tags'
    });
}

// ===== 管理員接口（文章） =====

// 1. 創建文章 - POST /api/articles
export interface ArticlePayload {
    title: string;
    slug: string;
    summary: string;
    content: string;
    featured_image?: string;
    category?: string;
    category_id?: number;
    tags?: string[]; // 文档为数组
    language?: string;
    status?: number;
    is_featured?: boolean;
    sort_order?: number;
    published_at?: string;
}

export function adminCreateArticle(data: ArticlePayload) {
    return http<any>({
        method: 'POST',
        url: 'articles',
        data
    });
}

// 2. 更新文章 - PUT /api/articles/:id
export function adminUpdateArticle(id: number, data: Partial<ArticlePayload>) {
    return http<any>({
        method: 'PUT',
        url: `articles/${id}`,
        data
    });
}

// 3. 刪除文章（軟刪除）- DELETE /api/articles/:id
export function adminSoftDeleteArticle(id: number) {
    return http<any>({
        method: 'DELETE',
        url: `articles/${id}`
    });
}

// 4. 永久刪除文章 - DELETE /api/articles/:id/force
export function adminForceDeleteArticle(id: number) {
    return http<any>({
        method: 'DELETE',
        url: `articles/${id}/force`
    });
}

// 5. 批量刪除（軟刪除）- POST /api/articles/batch-delete
export function adminBatchSoftDeleteArticles(ids: number[]) {
    return http<any>({
        method: 'POST',
        url: 'articles/batch-delete',
        data: { ids }
    });
}

// 6. 批量永久刪除 - POST /api/articles/batch-force-delete
export function adminBatchForceDeleteArticles(ids: number[]) {
    return http<any>({
        method: 'POST',
        url: 'articles/batch-force-delete',
        data: { ids }
    });
}

// 7. 發布文章 - PATCH /api/articles/:id/publish
export function adminPublishArticle(id: number) {
    return http<any>({
        // UniApp.RequestOptions 不包含 PATCH，后端一般也接受 POST 语义
        method: 'POST',
        url: `articles/${id}/publish`
    });
}

// 8. 取消發布 - PATCH /api/articles/:id/unpublish
export function adminUnpublishArticle(id: number) {
    return http<any>({
        method: 'POST',
        url: `articles/${id}/unpublish`
    });
}

// 9. 恢復已刪除文章 - PATCH /api/articles/:id/restore
export function adminRestoreDeletedArticle(id: number) {
    return http<any>({
        method: 'POST',
        url: `articles/${id}/restore`
    });
}

// ===== 廣告管理 API (管理員) =====

// 1. 獲取廣告列表 - GET /api/content/ads
export interface AdminAdListParams {
    page?: number;
    limit?: number;
    position?: string;
    type?: string;
    search?: string;
    status?: number;
}

export function adminGetAdList(params: AdminAdListParams = {}) {
    return http<any>({
        method: 'GET',
        url: 'content/ads',
        data: params
    });
}

// 2. 創建廣告 - POST /api/content/ads
export interface AdPayload {
    name: string;
    title: string;
    type: string;
    position: string;
    image_url?: string;
    link_url?: string;
    link_target?: '_blank' | '_self';
    start_time?: string;
    end_time?: string;
    priority?: number;
    status?: number;
}

export function adminCreateAd(data: AdPayload) {
    return http<any>({
        method: 'POST',
        url: 'content/ads',
        data
    });
}

// 3. 更新廣告 - PUT /api/content/ads/:id
export function adminUpdateAd(id: number, data: Partial<AdPayload>) {
    return http<any>({
        method: 'PUT',
        url: `content/ads/${id}`,
        data
    });
}

// 4. 刪除廣告 - DELETE /api/content/ads/:id
export function adminDeleteAd(id: number) {
    return http<any>({
        method: 'DELETE',
        url: `content/ads/${id}`
    });
}

// 5. 獲取可用廣告位置 - GET /api/content/ads/positions
export function adminGetAdPositions() {
    return http<any>({
        method: 'GET',
        url: 'content/ads/positions'
    });
}

// ===== 分類管理 =====

// 獲取分類樹 - GET /api/mall/categories/tree
export function getCategoryTree() {
    return http<any>({
        method: 'GET',
        url: 'mall/categories/tree'
    });
}

// 獲取分類列表 - GET /api/mall/categories
export interface CategoryListParams {
    page?: number;
    per_page?: number;
}

export function getCategoryList(params: CategoryListParams = {}) {
    return http<any>({
        method: 'GET',
        url: 'mall/categories',
        data: params
    });
}

// 獲取分類詳情 - GET /api/mall/categories/:id
export function getCategoryDetail(id: number) {
    return http<any>({
        method: 'GET',
        url: `mall/categories/${id}`
    });
}

/**
 * =========================
 * 商城系統 API
 * =========================
 *
 * 文档中的路径形如：GET /api/mall/shops
 * 这里统一去掉 `/api/` 前缀，保持与拦截器拼接规则一致：
 *  - dev:  /api/api/{url}
 *  - prod: /api/{url}
 */

// ===== 公開接口（無需認證） =====

// 1. 獲取店鋪列表 - GET /api/mall/shops
export interface MallShopListParams {
    page?: number; // 默認 1
    limit?: number; // 默認 15
    keyword?: string;
}

export function getMallShopList(params: MallShopListParams = {}) {
    return http<any>({
        method: 'GET',
        url: 'mall/shops',
        data: params
    });
}

// 2. 獲取店鋪詳情 - GET /api/mall/shops/:id
export function getMallShopDetail(id: number) {
    return http<any>({
        method: 'GET',
        url: `mall/shops/${id}`
    });
}

// 3. 獲取店鋪商品列表 - GET /api/mall/shops/:id/products
export interface MallShopProductsParams {
    page?: number;
    limit?: number;
    category_id?: number;
    keyword?: string;
}

export function getMallShopProducts(id: number, params: MallShopProductsParams = {}) {
    return http<any>({
        method: 'GET',
        url: `mall/shops/${id}/products`,
        data: params
    });
}

// 4. 獲取全局商品列表（所有店鋪）- GET /api/mall/products
export interface MallProductListParams {
    page?: number;
    limit?: number;
    category_id?: number;
    shop_id?: number;
    keyword?: string;
    min_price?: number;
    max_price?: number;
    sort?: 'latest' | 'price_asc' | 'price_desc' | 'popular';
}

export function getMallProductList(params: MallProductListParams = {}) {
    return http<any>({
        method: 'GET',
        url: 'mall/products',
        data: params
    });
}

// 5. 獲取商品詳情 - GET /api/mall/products/:id
export function getMallProductDetail(id: number) {
    return http<any>({
        method: 'GET',
        url: `mall/products/${id}`
    });
}

// ===== 購物車管理（需認證） =====

// 1. 獲取購物車 - GET /api/mall/cart
export function getMallCart() {
    return http<any>({
        method: 'GET',
        url: 'mall/cart'
    });
}

// 2. 添加商品到購物車 - POST /api/mall/cart
export interface MallCartAddPayload {
    product_id: number;
    quantity: number;
    selected_sku?: string; // 文档示例: "顏色:紅色,尺寸:L"
}

export function addMallCartItem(data: MallCartAddPayload) {
    return http<any>({
        method: 'POST',
        url: 'mall/cart',
        data
    });
}

// 3. 更新購物車項目 - PUT /api/mall/cart/:id
export interface MallCartUpdatePayload {
    quantity: number;
}

export function updateMallCartItem(id: number, data: MallCartUpdatePayload) {
    return http<any>({
        method: 'PUT',
        url: `mall/cart/${id}`,
        data
    });
}

// 4. 刪除購物車項目 - DELETE /api/mall/cart/:id
export function deleteMallCartItem(id: number) {
    return http<any>({
        method: 'DELETE',
        url: `mall/cart/${id}`
    });
}

// ===== 訂單管理（需認證） =====

// 1. 訂單預覽（試算）- POST /api/mall/orders/preview
export interface MallOrderPreviewByCart {
    cart_ids: number[];
    shop_id: number;
}

export interface MallOrderPreviewItem {
    product_id: number;
    quantity: number;
    sku?: string;
}

export interface MallOrderPreviewByItems {
    items: MallOrderPreviewItem[];
    shop_id: number;
}

export type MallOrderPreviewPayload = MallOrderPreviewByCart | MallOrderPreviewByItems;

export function previewMallOrder(data: MallOrderPreviewPayload) {
    return http<any>({
        method: 'POST',
        url: 'mall/orders/preview',
        data
    });
}

// 2. 創建訂單 - POST /api/mall/orders
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
    return http<any>({
        method: 'POST',
        url: 'mall/orders',
        data
    });
}

// 3. 獲取我的訂單列表 - GET /api/mall/orders
export type MallOrderStatus =
    | 'pending'
    | 'paid'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'processing'
    | 'delivered';

export interface MallOrderListParams {
    status?: MallOrderStatus;
    page?: number;
    limit?: number;
}

export function getMallOrderList(params: MallOrderListParams = {}) {
    return http<any>({
        method: 'GET',
        url: 'mall/orders',
        data: params
    });
}

// 4. 獲取訂單詳情 - GET /api/mall/orders/:id
export function getMallOrderDetail(id: number) {
    return http<any>({
        method: 'GET',
        url: `mall/orders/${id}`
    });
}