import { http } from '@/utils/request';
import type {
    LerpApiResponse,
    LerpBannerItem,
    LerpGoodsItem,
    LerpNewsItem,
    LerpPageResult
} from './types';

export interface UserInfo {
    id: number;
    phone: string;
    email: string | null;
    username: string;
    nickname: string;
    avatar: string | null;
    gender: number | null;
    birthday: string | null;
    withdraw_status: boolean;
    status: number;
    invite_code_status: boolean;
    level: number;
    credit_score: number;
    invite_code: string | null;
    invited_by_code: string | null;
    balance: string;
    last_login_ip: string;
    last_login_at: string | null;
    email_verified_at: string | null;
    phone_verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    roles: any[];
    role_names: string[];
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

/**
 * =========================
 * 商城系統 API
 * =========================
 *
 * 文档中的路径形如：GET /api/mall/shops
 * 这里统一去掉 `/api/` 前缀，保持与拦截器拼接规则一致：
 *  - dev:  /api/api/{url}
 *  - prod: /api/{url}
 *
 * 注意：name 和 description 欄位會根據請求 Header X-Exchange-Locale 自動返回對應語言的內容。
 */

// ===== 公開接口（無需認證） =====

// 0. 獲取分類樹 - GET /api/mall/categories/tree
// 注意: name 欄位會根據 X-Exchange-Locale 自動翻譯。
export function getCategoryTree() {
    return http<any>({
        method: 'GET',
        url: 'mall/categories/tree'
    });
}

// 0.2 獲取分類下的商品列表 - GET /api/mall/categories/:id/products
export function getCategoryProducts(id: number) {
    return http<any>({
        method: 'GET',
        url: `mall/categories/${id}/products`
    });
}

// 0.1 獲取分類詳情 - GET /api/mall/categories/:id
export function getCategoryDetail(id: number) {
    return http<any>({
        method: 'GET',
        url: `mall/categories/${id}`
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

// ===== 公開接口（無需認證） =====

// 1. 獲取店鋪列表 - GET /api/mall/shops
// 注意 (多語系): name 和 description 欄位會根據請求 Header X-Exchange-Locale 自動返回對應語言的內容。
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
// 使用場景：首頁商品展示、商品搜索、分類瀏覽、價格篩選
export interface MallProductListParams {
    page?: number;        // 頁碼，默認 1
    limit?: number;       // 每頁數量，默認 20
    category_id?: number; // 分類 ID 篩選
    shop_id?: number;     // 店鋪 ID 篩選
    keyword?: string;     // 搜索關鍵詞
    min_price?: number;   // 最低價格
    max_price?: number;   // 最高價格
    sort?: 'latest' | 'price_asc' | 'price_desc' | 'popular'; // 排序方式：latest(最新上架，默認)、price_asc(價格由低到高)、price_desc(價格由高到低)、popular(熱門商品，按銷量)
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
// 可通過傳入 { noLoading: true } 關閉全局 loading（例如僅更新購物車角標時）
export function getMallCart(options: { noLoading?: boolean } = {}) {
    return http<any>({
        method: 'GET',
        url: 'mall/cart',
        ...options
    });
}

// 2. 添加商品到購物車 - POST /api/mall/cart
export interface MallCartAddPayload {
    product_id: number;
    quantity: number;
    selected_sku?: string; // 文档示例: "顏色:紅色,尺寸:L"
    shop_id: number;
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

// 5. 批量刪除購物車項目 - DELETE /api/mall/cart
export function deleteMallCartItems(ids: number[]) {
    return http<any>({
        method: 'DELETE',
        url: 'mall/cart',
        data: { ids }
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
/**
 * 訂單狀態流程：
 * pending (待付款) 
 *   → paid (已付款) 
 *   → processing (處理中) 
 *   → shipped (已發貨) 
 *   → delivered (已送達) 
 *   → completed (已完成)
 * 
 * 或
 * 
 * pending → cancelled (已取消)
 */
export type MallOrderStatus =
    | 'pending'      // 待付款
    | 'paid'         // 已付款
    | 'processing'   // 處理中
    | 'shipped'      // 已發貨
    | 'delivered'    // 已送達
    | 'completed'    // 已完成
    | 'cancelled';   // 已取消

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

/**
 * =========================
 * 身份驗證 API
 * =========================
 *
 * 文档中的路径形如：POST /api/auth/login
 * 这里统一去掉 `/api/` 前缀，保持与拦截器拼接规则一致：
 *  - dev:  /api/api/{url}
 *  - prod: /api/{url}
 */

// ===== 註冊 =====

export interface AuthRegisterPayload {
    // username: string;
    email: string;
    phone: string;
    password: string;
    captcha_id: string;
    captcha_code: string;
}

export interface AuthRegisterResponse {
    user: {
        id: number;
        username: string;
        email: string;
    };
    token: string;
}
//获取验证码
export function getCaptcha() {
    return http<any>({
        method: 'POST',
        url: 'captcha/create'
    });
}
// 1. 用戶註冊 - POST /api/register
export function authRegister(data: AuthRegisterPayload) {
    return http<AuthRegisterResponse>({
        method: 'POST',
        url: 'register',
        data
    });
}

// 2. 檢查用戶名是否可用 - POST /api/register/check-username
export function authCheckUsername(data: { username: string }) {
    return http<{ available: boolean }>({
        method: 'POST',
        url: 'register/check-username',
        data
    });
}

// 3. 檢查郵箱是否可用 - POST /api/register/check-email
export function authCheckEmail(data: { email: string }) {
    return http<{ available: boolean }>({
        method: 'POST',
        url: 'register/check-email',
        data
    });
}

// ===== 登入 / 登出 / 刷新 =====

export interface AuthLoginPayload {
    login: string;
    password: string;
}

export interface AuthLoginUser {
    id: number;
    username: string;
    nickname?: string;
    email?: string;
    avatar?: string | null;
}

export interface AuthLoginResponse {
    token: string;
    user: AuthLoginUser;
    user_type: string;
    expires_in: number;
    totp_required?: boolean;
    user_id?: number;
}

// 1. 用戶登入 - POST /api/auth/login
export function authLogin(data: AuthLoginPayload) {
    return http<AuthLoginResponse>({
        method: 'POST',
        url: 'auth/login',
        data
    });
}

// 1. 用戶登入（备用）- POST /api/auth/user-login
export function authUserLogin(data: AuthLoginPayload) {
    return http<AuthLoginResponse>({
        method: 'POST',
        url: 'auth/user-login',
        data
    });
}

// 2. 登出 - POST /api/auth/logout
export function authLogout() {
    return http<{ code: number; message: string }>({
        method: 'POST',
        url: 'auth/logout'
    });
}

// 3. 刷新 Token - POST /api/auth/refresh
export function authRefreshToken() {
    return http<any>({
        method: 'POST',
        url: 'auth/refresh'
    });
}

// ===== 用戶資料管理 =====

export interface AuthMeResponse {
    id: number;
    username: string;
    nickname?: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    gender?: 0 | 1 | 2;
    status?: 0 | 1;
    created_at?: string;
    roles?: any[];
    role_names?: string[];
}

// 1. 獲取當前用戶信息 - GET /api/auth/me
export function authGetMe() {
    return http<AuthMeResponse>({
        method: 'GET',
        url: 'auth/me'
    });
}

export interface AuthUpdateMePayload {
    real_name?: string;
    phone?: string;
    avatar?: string;
}

// 2. 更新個人資料 - PUT /api/auth/me
export function authUpdateMe(data: AuthUpdateMePayload) {
    return http<AuthMeResponse>({
        method: 'PUT',
        url: 'auth/me',
        data
    });
}

export interface AuthChangePasswordPayload {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

// 3. 修改密碼 - PUT /api/auth/me/password
export function authChangePassword(data: AuthChangePasswordPayload) {
    return http<{ code: number; message: string }>({
        method: 'PUT',
        url: 'auth/me/password',
        data
    });
}

// ===== TOTP 雙因素認證 =====

export interface TotpInitResponse {
    secret: string;
    qr_code: string;
    manual_entry: string;
}

// 1. 初始化 TOTP（首次設置）- GET /api/totp/init?user_id=1
export function totpInit(params: { user_id: number }) {
    return http<TotpInitResponse>({
        method: 'GET',
        url: 'totp/init',
        data: params
    });
}

// 2. 驗證並啟用 TOTP - POST /api/totp/verify-and-enable
export function totpVerifyAndEnable(data: { user_id: number; secret: string; code: string }) {
    return http<{ code: number; message: string }>({
        method: 'POST',
        url: 'totp/verify-and-enable',
        data
    });
}

// 3. TOTP 登入驗證 - POST /api/totp/verify-login
export function totpVerifyLogin(data: { user_id: number; code: string }) {
    return http<{ token: string } & Record<string, any>>({
        method: 'POST',
        url: 'totp/verify-login',
        data
    });
}

// ===== 用戶自行設置 TOTP（需認證） =====

// 1. 開始設置 - POST /api/totp/user/setup-init
export function totpUserSetupInit() {
    return http<TotpInitResponse>({
        method: 'POST',
        url: 'totp/user/setup-init'
    });
}

// 2. 驗證並完成設置 - POST /api/totp/user/setup-verify
export function totpUserSetupVerify(data: { code: string }) {
    return http<{ code: number; message: string }>({
        method: 'POST',
        url: 'totp/user/setup-verify',
        data
    });
}

// 3. 解綁 TOTP - DELETE /api/totp/user/unbind
export function totpUserUnbind(data: { password: string; code: string }) {
    return http<{ code: number; message: string }>({
        method: 'DELETE',
        url: 'totp/user/unbind',
        data
    });
}

/**
 * =========================
 * 收貨地址管理 API
 * =========================
 *
 * 文档中的路径形如：GET /api/user/addresses
 * 这里统一去掉 `/api/` 前缀，保持与拦截器拼接规则一致：
 *  - dev:  /api/api/{url}
 *  - prod: /api/{url}
 */

export interface UserAddress {
    id: number;
    user_id: number;
    receiver_name: string;
    receiver_phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    postal_code?: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

// 1. 獲取地址列表 - GET /api/user/addresses
export function getUserAddresses() {
    return http<any[]>({
        method: 'GET',
        url: 'user/addresses'
    });
}

// 2. 新增地址 - POST /api/user/addresses
export interface CreateUserAddressPayload {
    receiver_name: string;
    receiver_phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    postal_code?: string;
    is_default?: boolean;
}

export function createUserAddress(data: CreateUserAddressPayload) {
    return http<{ code: number; message: string; data: UserAddress }>({
        method: 'POST',
        url: 'user/addresses',
        data
    });
}

// 3. 更新地址 - PUT /api/user/addresses/:id
export interface UpdateUserAddressPayload {
    receiver_name?: string;
    receiver_phone?: string;
    province?: string;
    city?: string;
    district?: string;
    address?: string;
    postal_code?: string;
    is_default?: boolean;
}

export function updateUserAddress(id: number, data: UpdateUserAddressPayload) {
    return http<{ code: number; message: string; data: null }>({
        method: 'PUT',
        url: `user/addresses/${id}`,
        data
    });
}

// 4. 刪除地址 - DELETE /api/user/addresses/:id
export function deleteUserAddress(id: number) {
    return http<{ code: number; message: string; data: null }>({
        method: 'DELETE',
        url: `user/addresses/${id}`
    });
}

// 5. 設為預設地址 - PUT /api/user/addresses/:id/set-default
export function setDefaultUserAddress(id: number) {
    return http<{ code: number; message: string; data: null }>({
        method: 'PUT',
        url: `user/addresses/${id}/set-default`
    });
}


// 0.3 獲取商鋪分類列表
export function getShopCategories() {
    return http<any>({
        method: 'GET',
        url: 'mall/shop-categories'
    });
}

// 0.4 獲取指定分類下的商鋪列表
export function getShopCategoryShops(params: { page?: number; limit?: number; keyword?: string; category_id?: number }) {
    return http<any>({
        method: 'GET',
        url: `mall/shop-categories/${params.category_id}/shops`,
        data: params
    });
}

// 0.5 獲取我的商品列表 - GET /api/mall/my-shop/products
export interface MyShopProductsParams {
    page?: number;
    limit?: number;
    is_selling?: boolean;
    keyword?: string;
}

export function getMyShopProducts(params: MyShopProductsParams = {}) {
    return http<any>({
        method: 'GET',
        url: 'mall/my-shop/products',
        data: params
    });
}





// 3. 上傳頭像 - POST /api/auth/me/avatar
// 上傳當前用戶頭像，需要傳遞 multipart/form-data 格式（需認證）
export interface UploadAvatarResponse {
    url: string; // 上傳後頭像的完整 URL
}

/**
 * 上傳頭像
 * @param avatarFile 頭像圖片文件，支持 jpg、jpeg、png、gif、webp
 * @returns {Promise<UploadAvatarResponse>}
 */
export function uploadAvatar(avatarFile: File) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    return http<UploadAvatarResponse>({
        method: 'POST',
        url: 'auth/me/avatar',
        header: {
            'Content-Type': 'multipart/form-data'
            // Authorization 標頭由 http 請求全局處理或通過 token 注入
        },
        data: formData
    });
}

// 上傳單一檔案接口 - POST /api/upload

export type UploadFileType =
    | 'img'
    | 'file'
    | 'video'
    | 'voice'
    | 'pdf'
    | 'excel'
    | 'app';

export interface UploadFilePayload {
    file: File;
    file_type: UploadFileType;
    index?: number;
}

// 響應
export interface UploadFileResponse {
    id: number;
    url: string;          // 檔案完整訪問 URL
    file_type: UploadFileType;
    size_kb: number;      // 檔案大小（KB）
    original_name: string;// 原始檔名
    index?: number;       // 序號（僅在傳入 index 時返回）
}

/**
 * 上傳單一檔案
 * @param payload - { file, file_type, index }
 *   file: 要上傳的檔案 (File)
 *   file_type: 業務類型（img, file, video, voice, pdf, excel, app）
 *   index: 批次上傳時的序號（可選）
 */
export function uploadFile(payload: UploadFilePayload) {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('file_type', payload.file_type);
    if (payload.index !== undefined) {
        formData.append('index', String(payload.index));
    }
    return http<any>({
        method: 'POST',
        url: 'upload',
        header: {
            'Content-Type': 'multipart/form-data'
            // Authorization 標頭由 http 請求全局處理
        },
        data: formData
    });
}



/**
 * 商戶申請/重新提交商戶申請
 * POST /api/merchant-application
 * 注意：證件照片、銀行存摺及店鋪 LOGO 圖片須先通過 uploadFile 上傳取得 URL，再傳入此接口
 */

export interface MerchantApplicationPayload {
    applicant_name: string;         // 申請人真實姓名（必填）
    shop_name: string;              // 預期建立的商鋪名稱（必填）
    shop_description?: string;      // 商鋪介紹（可選）
    shop_category_id?: number;      // 店鋪類別 ID（可選，可通過 GET /api/mall/shop-categories 取得）
    id_doc_front_url: string;       // 身份證正面照片 URL（必填）
    id_doc_back_url: string;        // 身份證背面照片 URL（必填）
    bank_passbook_url: string;      // 銀行存摺照片 URL（必填）
    shop_logo_url?: string;         // 店鋪 Logo URL（可選）
}

export interface MerchantApplicationResponse {
    id: number;
    status: string;
    // ...其它回應字段
}

/**
 * 提交/重新提交商戶申請
 * @param payload - 商戶申請資料
 */
export function submitMerchantApplication(payload: MerchantApplicationPayload) {
    return http<any>({
        method: 'POST',
        url: '/merchant-application',
        header: {
            'Content-Type': 'application/json'
        },
        data: payload
    });
}