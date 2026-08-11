import { useI18nStoreHook } from '@/stores/modules/i18nStore';

/**
 * 动态设置页面导航栏标题
 * @param titleKey 翻译键（与 lang.json / pages.json 中文一致）
 */
export function setPageTitle(titleKey: string) {
    const i18nStore = useI18nStoreHook();
    const title = i18nStore.t(titleKey);
    uni.setNavigationBarTitle({ title });
}

/**
 * pages.json 路径 → 标题翻译键
 * 键与 pages.json 的 navigationBarTitleText 保持一致
 */
export const PAGE_TITLE_BY_PATH: Record<string, string> = {
    'pages/home/index': '主页',
    'pages/sort/sort': '类型',
    'pages/shop/shop': '店铺',
    'pages/mine/mine': '我的',
    'pages/login/login': '登录',
    'pages/register/register': '注册',
    'pages/order/order': '我的订单',
    'pages/order/create': '确认订单',
    'pages/goodsDetail/goodsDetail': '商品详情',
    'pages/goods/list': '商品列表',
    'pages/wallet/recharge': '充值',
    'pages/editUserInfo/editUserInfo': '编辑用户信息',
    'pages/address/list': '地址列表',
    'pages/address/add': '添加地址',
    'pages/cart/cart': '购物车',
    'pages/shop/myShop': '我的店铺',
    'pages/shop/home': '店铺首页',
    'pages/shop/myShopOrder': '店铺订单',
    'pages/shop/productManage': '商品管理',
    'pages/shop/apply': '申请成为商家',
    'pages/wallet/withdraw': '提现',
    'pages/wallet/wallet': '钱包',
    'pages/wallet/bank': '收款账户',
    'pages/shop/wholesale': '批发中心',
    'pages/wallet/editPayPwd': '修改支付密码',
    'pages/wallet/usdt': '收款账户',
    'pages/wallet/rechargeLog': '充值日志',
    'pages/wallet/withdrawLog': '提现日志',
    'pages/service/index': '客服',
    'pages/help/help': '帮助',
    'pages/about/about': '关于我们',
};

/** @deprecated 兼容旧调用，请优先用 PAGE_TITLE_BY_PATH */
export const PAGE_TITLE_MAP = PAGE_TITLE_BY_PATH;

/**
 * tabBar 文案（index 与 pages.json tabBar.list 顺序一致）
 */
export const TAB_BAR_ITEMS: Array<{ index: number; titleKey: string; pagePath: string }> = [
    { index: 0, titleKey: '首页', pagePath: 'pages/home/index' },
    { index: 1, titleKey: '类型', pagePath: 'pages/sort/sort' },
    { index: 2, titleKey: '购物车', pagePath: 'pages/cart/cart' },
    { index: 3, titleKey: '店铺', pagePath: 'pages/shop/shop' },
    { index: 4, titleKey: '我的', pagePath: 'pages/mine/mine' },
];

const TAB_PATH_SET = new Set(TAB_BAR_ITEMS.map((i) => i.pagePath));

export function isTabBarPage(pagePath?: string) {
    const path = (pagePath || '').replace(/^\//, '');
    return TAB_PATH_SET.has(path);
}

function getCurrentRoute(): string {
    try {
        const pages = getCurrentPages();
        const cur = pages[pages.length - 1] as any;
        return (cur?.route || '').replace(/^\//, '');
    } catch (_) {
        return '';
    }
}

/**
 * 根据当前路由设置导航栏标题
 */
export function applyNavigationBarTitle(pagePath?: string) {
    const path = (pagePath || getCurrentRoute()).replace(/^\//, '');
    const titleKey = PAGE_TITLE_BY_PATH[path];
    if (titleKey) {
        setPageTitle(titleKey);
    }
}

/** H5：直接改 DOM，避免 setTabBarItem 时机问题 */
function applyTabBarDomI18n() {
    // #ifdef H5
    try {
        const i18nStore = useI18nStoreHook();
        const selectors = [
            '.uni-tabbar__label',
            '.uni-tabbar-border .uni-tabbar__label',
            '.uni-tabbar .uni-tabbar__label',
            '[class*="tabbar"] [class*="label"]',
        ];
        let labels: NodeListOf<Element> | null = null;
        for (const sel of selectors) {
            const nodes = document.querySelectorAll(sel);
            if (nodes.length >= TAB_BAR_ITEMS.length) {
                labels = nodes;
                break;
            }
        }
        if (!labels || !labels.length) return false;
        TAB_BAR_ITEMS.forEach(({ index, titleKey }) => {
            const el = labels![index] as HTMLElement | undefined;
            if (el) el.textContent = i18nStore.t(titleKey);
        });
        return true;
    } catch (_) {
        return false;
    }
    // #endif
    // #ifndef H5
    return false;
    // #endif
}

function setTabBarItemsOnce() {
    const i18nStore = useI18nStoreHook();
    TAB_BAR_ITEMS.forEach(({ index, titleKey }) => {
        const text = i18nStore.t(titleKey);
        uni.setTabBarItem({
            index,
            text,
            // 不抛错：非 tab 页调用会 fail
            fail: () => {},
        });
    });
    applyTabBarDomI18n();
}

/**
 * 刷新底部 tabBar 多语言文案
 * 注意：必须在「tabBar 页面」里调用才稳定生效（App.onLaunch 太早会失败）
 */
export function applyTabBarI18n(force = false) {
    const route = getCurrentRoute();
    // 非 tab 页时 API 通常失败；仍尝试 DOM 兜底（H5）
    if (!force && route && !isTabBarPage(route)) {
        applyTabBarDomI18n();
        return;
    }

    setTabBarItemsOnce();
    // 延迟再设一次，覆盖 tabBar 晚于页面渲染的情况
    setTimeout(() => setTabBarItemsOnce(), 50);
    setTimeout(() => setTabBarItemsOnce(), 200);
}

/**
 * 语言切换后刷新导航标题 + tabBar
 */
export function refreshAppI18nChrome() {
    applyTabBarI18n(true);
    applyNavigationBarTitle();
}
