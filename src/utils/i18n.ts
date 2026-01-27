import { useI18nStoreHook, type SupportedLanguage } from '@/stores/modules/i18nStore';

/**
 * 多语言工具函数
 */
export class I18nUtils {
    /**
     * 获取翻译文本
     * @param key 翻译键
     * @param fallback 备用文本
     * @returns 翻译后的文本
     */
    static t(key: string, fallback?: string): string {
        const i18nStore = useI18nStoreHook();
        return i18nStore.t(key, fallback);
    }

    /**
     * 切换语言
     * @param lang 目标语言
     */
    static setLanguage(lang: SupportedLanguage): void {
        const i18nStore = useI18nStoreHook();
        i18nStore.setLanguage(lang);
    }

    /**
     * 获取当前语言
     * @returns 当前语言代码
     */
    static getCurrentLanguage(): SupportedLanguage {
        const i18nStore = useI18nStoreHook();
        return i18nStore.currentLanguage;
    }

    /**
     * 获取当前语言信息
     * @returns 当前语言信息
     */
    static getCurrentLanguageInfo() {
        const i18nStore = useI18nStoreHook();
        return i18nStore.currentLanguageInfo;
    }

    /**
     * 检查是否支持某个语言
     * @param lang 语言代码
     * @returns 是否支持
     */
    static isLanguageSupported(lang: string): lang is SupportedLanguage {
        const i18nStore = useI18nStoreHook();
        return i18nStore.isLanguageSupported(lang);
    }

    /**
     * 获取所有支持的语言
     * @returns 支持的语言列表
     */
    static getSupportedLanguages() {
        const i18nStore = useI18nStoreHook();
        return i18nStore.supportedLanguages;
    }
}

/**
 * 多语言组合式函数
 * 用于在 Vue 组件中使用
 */
export function useI18n() {
    const i18nStore = useI18nStoreHook();

    return {
        // 翻译函数
        t: i18nStore.t,
        
        // 当前语言
        currentLanguage: i18nStore.currentLanguage,
        
        // 当前语言信息
        currentLanguageInfo: i18nStore.currentLanguageInfo,
        
        // 支持的语言列表
        supportedLanguages: i18nStore.supportedLanguages,
        
        // 切换语言
        setLanguage: i18nStore.setLanguage,
        
        // 检查语言支持
        isLanguageSupported: i18nStore.isLanguageSupported
    };
}

/**
 * 全局多语言函数
 * 可以在任何地方使用，不需要在组件中
 */
export const $t = I18nUtils.t;

/**
 * 语言切换函数
 */
export const $setLang = I18nUtils.setLanguage;

/**
 * 获取当前语言函数
 */
export const $getLang = I18nUtils.getCurrentLanguage;
export  {type SupportedLanguage };

