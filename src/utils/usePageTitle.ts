import { onMounted } from 'vue';
import { useI18n } from './i18n';
import { setPageTitle, PAGE_TITLE_MAP } from './pageTitle';

/**
 * 页面标题 composable
 * @param titleKey 翻译键名
 */
export function usePageTitle(titleKey: string) {
    const { t } = useI18n();
    
    onMounted(() => {
        setPageTitle(titleKey);
    });
    
    return {
        setTitle: (key: string) => setPageTitle(key),
        t
    };
}

/**
 * 根据页面路径自动设置标题的 composable
 * @param pagePath 页面路径
 */
export function useAutoPageTitle(pagePath?: string) {
    const { t } = useI18n();
    
    onMounted(() => {
        if (pagePath) {
            // 从页面路径中提取页面名称
            const pathParts = pagePath.split('/');
            const pageName = pathParts[pathParts.length - 1];
            
            // 根据页面名称设置对应的标题
            const titleKey = PAGE_TITLE_MAP[pageName];
            if (titleKey) {
                setPageTitle(titleKey);
            }
        }
    });
    
    return {
        setTitle: (key: string) => setPageTitle(key),
        t
    };
}
