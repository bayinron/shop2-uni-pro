import { defineStore } from 'pinia';
import { store } from '@/stores';
import { ref, computed } from 'vue';
import langData from '@/static/lang.json';

// 支持的语言类型（本项目仅中文 / 泰语）
export type SupportedLanguage = 'zh' | 'th';

// 语言配置接口
export interface LanguageConfig {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

/** 解析环境变量 / 中文别名为语言代码，默认泰语 */
export function resolveAppLanguage(raw?: string): SupportedLanguage {
    const rawTrim = (raw ?? import.meta.env.VITE_APP_LANG ?? 'th').toString().trim();
    const value = rawTrim.toLowerCase();
    const map: Record<string, SupportedLanguage> = {
        th: 'th',
        thai: 'th',
        '泰语': 'th',
        'ไทย': 'th',
        zh: 'zh',
        cn: 'zh',
        chinese: 'zh',
        '中文': 'zh',
    };
    if (rawTrim === '泰语' || rawTrim === 'ไทย') return 'th';
    if (rawTrim === '中文') return 'zh';
    return map[value] || 'th';
}

export const useI18nStore = defineStore('i18n', () => {
    // 当前语言（默认泰语，实际以 env / 本地缓存为准）
    const currentLanguage = ref<SupportedLanguage>(resolveAppLanguage());

    // 语言数据
    const languageData = ref(langData);

    // 初始化语言设置
    function initLanguage() {
        const defaultLang = resolveAppLanguage();
        const savedLang = uni.getStorageSync('lang') as string;

        // 仅接受本项目支持的语言；旧缓存 en 等一律丢弃，回退到环境变量默认
        if (savedLang && SUPPORTED_LANGUAGES.some((lang) => lang.code === savedLang)) {
            currentLanguage.value = savedLang as SupportedLanguage;
            return;
        }

        currentLanguage.value = defaultLang;
        uni.setStorageSync('lang', defaultLang);
    }

    // 切换语言
    function setLanguage(lang: SupportedLanguage) {
        if (SUPPORTED_LANGUAGES.some((l) => l.code === lang)) {
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
            const row = translation as Record<string, string>;
            return (
                row[currentLanguage.value] ||
                row['th'] ||
                row['zh'] ||
                fallback ||
                key
            );
        }
        return fallback || key;
    }

    // 获取当前语言信息
    const currentLanguageInfo = computed(() => {
        return (
            SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage.value) ||
            SUPPORTED_LANGUAGES[0]
        );
    });

    // 检查是否支持某个语言
    function isLanguageSupported(lang: string): lang is SupportedLanguage {
        return SUPPORTED_LANGUAGES.some((l) => l.code === lang);
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
        isLanguageSupported,
    };
});

// 非setup
export function useI18nStoreHook() {
    return useI18nStore(store);
}
