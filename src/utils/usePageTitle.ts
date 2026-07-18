import { onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useI18n } from './i18n';
import { setPageTitle, PAGE_TITLE_BY_PATH, applyNavigationBarTitle } from './pageTitle';

/**
 * 页面标题 composable：进入页面时设置导航栏标题
 * @param titleKey 翻译键名（中文 key）
 */
export function usePageTitle(titleKey: string) {
    const { t } = useI18n();

    const apply = () => setPageTitle(titleKey);

    onShow(() => {
        apply();
    });

    onMounted(() => {
        apply();
    });

    return {
        setTitle: (key: string) => setPageTitle(key),
        t,
    };
}

/**
 * 根据页面路径自动设置标题
 */
export function useAutoPageTitle(pagePath?: string) {
    const { t } = useI18n();

    onShow(() => {
        applyNavigationBarTitle(pagePath);
    });

    onMounted(() => {
        applyNavigationBarTitle(pagePath);
    });

    return {
        setTitle: (key: string) => setPageTitle(key),
        t,
        PAGE_TITLE_BY_PATH,
    };
}
