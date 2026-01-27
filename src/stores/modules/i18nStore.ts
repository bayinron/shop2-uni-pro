import { defineStore } from 'pinia';
import { store } from '@/stores';
import { ref, computed } from 'vue';
import langData from '@/static/lang.json';

// 支持的语言类型
export type SupportedLanguage = 'zh' | 'en' | 'th' | 'sgp';

// 语言配置接口
export interface LanguageConfig {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' }
];

export const useI18nStore = defineStore('i18n', () => {
    // 当前语言
    const currentLanguage = ref<SupportedLanguage>('zh');
    
    // 语言数据
    const languageData = ref(langData);
    
    // 初始化语言设置
    function initLanguage() {
        const savedLang = uni.getStorageSync('lang') as SupportedLanguage;
        if (savedLang && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLang)) {
            currentLanguage.value = savedLang;
        } else {
            // 根据系统语言自动设置
            const systemLang = uni.getSystemInfoSync().language;
            const detectedLang = detectLanguageFromSystem(systemLang);
            currentLanguage.value = detectedLang;
            uni.setStorageSync('lang', detectedLang);
        }
    }
    
    // 根据系统语言检测支持的语言
    function detectLanguageFromSystem(systemLang: string | undefined): SupportedLanguage {
        if (!systemLang) return 'zh';
        
        const langMap: Record<string, SupportedLanguage> = {
            'zh': 'zh',
            'zh-CN': 'zh',
            'zh-TW': 'zh',
            'en': 'en',
            'en-US': 'en',
            'en-GB': 'en',
            'th': 'th',
            'th-TH': 'th',
            'lo': 'la',
            'lo-LA': 'la'
        };
        
        return langMap[systemLang] || 'zh';
    }
    
    // 切换语言
    function setLanguage(lang: SupportedLanguage) {
        if (SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
            currentLanguage.value = lang;
            uni.setStorageSync('lang', lang);
            
            // 触发语言切换事件
            uni.$emit('languageChanged', lang);
        }
    }
    
    // 获取翻译文本
    function t(key: string, fallback?: string): string {
        const data = languageData.value;
        const translation = data[key as keyof typeof data];
        if (translation && typeof translation === 'object') {
            return translation[currentLanguage.value] || translation['zh'] || fallback || key;
        }
        return fallback || key;
    }
    
    // 获取当前语言信息
    const currentLanguageInfo = computed(() => {
        return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage.value) || SUPPORTED_LANGUAGES[0];
    });
    
    // 检查是否支持某个语言
    function isLanguageSupported(lang: string): lang is SupportedLanguage {
        return SUPPORTED_LANGUAGES.some(l => l.code === lang);
    }
    
    // 获取所有支持的语言
    const supportedLanguages = computed(() => SUPPORTED_LANGUAGES);
    
    return {
        // state
        currentLanguage,
        languageData,
        
        // getters
        currentLanguageInfo,
        supportedLanguages,
        
        // actions
        initLanguage,
        setLanguage,
        t,
        isLanguageSupported
    };
});

// 非setup
export function useI18nStoreHook() {
    return useI18nStore(store);
}
