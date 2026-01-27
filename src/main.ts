import { createSSRApp } from 'vue';
import App from './App.vue';
import 'uno.css';
import '@/styles/index.scss';
import '@/styles/common.scss';
import '@/static/fonts/iconfont.css'
import { useUserStoreHook } from '@/stores/modules/userStore';
import { useI18nStoreHook } from '@/stores/modules/i18nStore';
import { setPageTitle, PAGE_TITLE_MAP } from '@/utils/pageTitle';

import { setupStore } from '@/stores';
import CustomerService from '@/components/CustomerService.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';

export function createApp() {
    const app = createSSRApp(App);
    app.config.globalProperties.$test = () => {
        console.log('test----------------');
    };
    
    // 添加全局方法
    app.config.globalProperties.$setPageTitle = setPageTitle;
    app.config.globalProperties.$PAGE_TITLE_MAP = PAGE_TITLE_MAP;
    
    app.component('customer-service', CustomerService);
    app.component('language-switcher', LanguageSwitcher);

    setupStore(app);
    
    // 初始化多语言
    const i18nStore = useI18nStoreHook();
    i18nStore.initLanguage();
    
    // 初始化用户相关配置
    const userStore = useUserStoreHook();
    // userStore.reqConfig();
    
    return {
        app
    };
}
