import { useI18nStoreHook } from '@/stores/modules/i18nStore';

/**
 * 动态设置页面标题
 * @param titleKey 翻译键名
 */
export function setPageTitle(titleKey: string) {
    const i18nStore = useI18nStoreHook();
    const title = i18nStore.t(titleKey);
    
    // 设置导航栏标题
    uni.setNavigationBarTitle({
        title: title
    });
}

/**
 * 页面标题映射表
 * 将 pages.json 中的英文标识符映射到翻译键
 */
export const PAGE_TITLE_MAP: Record<string, string> = {
    'Home': '首页',
    'Login': '登录',
    'Register': '注册',
    'Wealth': '利息',
    'Team': '团队',
    'Regulation': '规则',
    'Share': '分享',
    'Recharge': '充值',
    'Task': '任务',
    'History': '历史',
    'Profile': '我的',
    'Withdraw': '提现',
    'Fund Detail': '资金明细',
    'Address': '提现地址',
    'Investment Report': '投资报告',
    'User Info': '用户信息',
    'Video Center': '视频中心',
    'Invite Friends': '邀请好友',
    'VIP Level': '星级',
    'Add Address': '添加地址',
    'Purchase': '认购',
    'KYC Verification': '实名认证',
    'Security Password': '创建安全密码',
    'Video Player': '视频播放',
    'Create Order': '创建订单',
    'Order List': '订单列表',
    'Task Detail': '任务详情',
    'Level List': '等级列表',
    'Certificate': '我的证书',
    'About Us': '关于我们',
    'Service Terms': '服务条款'
};

/**
 * 根据页面路径自动设置标题
 * @param pagePath 页面路径
 */
export function setPageTitleByPath(pagePath: string) {
    // 从页面路径中提取页面名称
    const pathParts = pagePath.split('/');
    const pageName = pathParts[pathParts.length - 1];
    
    // 根据页面名称设置对应的标题
    const titleKey = PAGE_TITLE_MAP[pageName];
    if (titleKey) {
        setPageTitle(titleKey);
    }
}

/**
 * TabBar 标题映射
 */
export const TAB_TITLE_MAP: Record<string, string> = {
    'Home': '首页',
    'Wealth': '利息',
    'Start': '开始',
    'History': '历史',
    'Profile': '我的'
};

/**
 * 设置 TabBar 标题
 * @param tabKey Tab 键名
 */
export function setTabTitle(tabKey: string) {
    const i18nStore = useI18nStoreHook();
    const title = i18nStore.t(TAB_TITLE_MAP[tabKey] || tabKey);
    
    // 注意：TabBar 的标题需要在 pages.json 中动态更新
    // 这里只是提供工具函数，实际更新需要重新设置 tabBar
    return title;
}
