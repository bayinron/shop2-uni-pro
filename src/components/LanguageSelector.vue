<template>
    <view class="language-selector">
        <view class="language-icon">
            <uni-icons type="gear" size="24" color="#666"></uni-icons>
        </view>
        <picker mode="selector" :range="languageOptions" v-model="currentLanguageIndex" range-key="nativeName" @change="onLanguageChange" @click="localizePickerButtonsH5" class="language-picker">
            <view class="language-text">{{ displayLanguageName }}</view>
        </picker>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n, type SupportedLanguage } from '@/utils/i18n';

// 使用多语言组合式函数
const { currentLanguage, currentLanguageInfo, supportedLanguages, setLanguage, t } = useI18n();

// 语言选择器相关
const languageOptions = supportedLanguages;
const currentLanguageIndex = ref(0);

// 本地响应式状态，确保显示更新
const displayLanguageName = ref('');

// 初始化当前语言索引
const initLanguageIndex = () => {
    const index = languageOptions.findIndex((lang) => lang.code === currentLanguage);
    currentLanguageIndex.value = index >= 0 ? index : 0;
    updateDisplayLanguage();
};

// 更新显示的语言名称
const updateDisplayLanguage = () => {
    displayLanguageName.value = currentLanguageInfo.nativeName;
};

// 语言切换处理
const onLanguageChange = (e: any) => {
    const index = e.detail.value;
    currentLanguageIndex.value = index;
    const selectedLang = languageOptions[index];
    if (selectedLang) {
        setLanguage(selectedLang.code);
        // 立即更新显示
        displayLanguageName.value = selectedLang.nativeName;
        // setTimeout(() => {
        //     window.location.reload();
        // }, 500);

        // uni.setTabBarItem({
        //     index: 0,
        //     text: t('首页')
        // });
        // uni.setTabBarItem({
        //     index: 1,
        //     text: t('利息')
        // });
        // uni.setTabBarItem({
        //     index: 2,
        //     text: t('开始')
        // });
        // uni.setTabBarItem({
        //     index: 3,
        //     text: t('历史')
        // });
        // uni.setTabBarItem({
        //     index: 4,
        //     text: t('我的')
        // });
    }
};

// 监听语言变化事件
const handleLanguageChange = (lang: SupportedLanguage) => {
    const index = languageOptions.findIndex((l) => l.code === lang);
    if (index >= 0) {
        currentLanguageIndex.value = index;
        updateDisplayLanguage();
        setTimeout(() => {
           window.location.reload();
        }, 500);
    }
};

// 监听 currentLanguage 变化，确保索引同步
watch(
    () => currentLanguage,
    (newLang) => {
        const index = languageOptions.findIndex((l) => l.code === newLang);
        if (index >= 0) {
            currentLanguageIndex.value = index;
            updateDisplayLanguage();
        }
    },
    { immediate: true }
);

// 初始化语言索引
initLanguageIndex();

// 组件挂载时监听语言变化
onMounted(() => {
    uni.$on('languageChanged', handleLanguageChange);
});

// 组件卸载时移除监听
onUnmounted(() => {
    uni.$off('languageChanged', handleLanguageChange);
});

// H5: 使用原生 DOM 查询并设置 picker 按钮文案
const localizePickerButtonsH5 = () => {
    // #ifdef H5
    const trySet = () => {
        const cancelEl = document.querySelector('.uni-picker-action-cancel') as HTMLElement | null;
        const confirmEl = document.querySelector('.uni-picker-action-confirm') as HTMLElement | null;
        if (cancelEl) cancelEl.textContent = t('取消');
        if (confirmEl) confirmEl.textContent = t('确定');
        return !!(cancelEl && confirmEl);
    };
    let attempts = 0;
    const timer = setInterval(() => {
        attempts++;
        if (trySet() || attempts >= 10) {
            clearInterval(timer);
        }
    }, 50);
    // #endif
};
</script>

<style scoped lang="scss">
.language-selector {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 16rpx;

    .language-icon {
        margin-right: 12rpx;
        display: flex;
        align-items: center;
    }

    .language-picker {
        display: flex;
        align-items: center;

        .language-text {
            color: #666;
            font-size: 28rpx;
            font-weight: 500;
        }
    }
}
</style>
