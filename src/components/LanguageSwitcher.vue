<template>
    <view class="language-switcher">
        <!-- 语言切换按钮 -->
        <view class="language-button" @click="showLanguagePicker = true">
            <text class="language-flag">{{ currentLanguageInfo.flag }}</text>
            <text class="language-name">{{ currentLanguageInfo.nativeName }}</text>
            <text class="arrow">▼</text>
        </view>

        <!-- 语言选择弹窗 -->
        <uni-popup ref="languagePopup" type="bottom" :safe-area="false" @change="onPopupChange">
            <view class="language-picker">
                <view class="picker-header">
                    <text class="picker-title">{{ t('语言') }}</text>
                    <text class="picker-close" @click="closePicker">✕</text>
                </view>
                
                <view class="language-list">
                    <view 
                        v-for="lang in supportedLanguages" 
                        :key="lang.code"
                        class="language-item"
                        :class="{ active: lang.code === currentLanguage }"
                        @click="selectLanguage(lang.code)"
                    >
                        <text class="language-flag">{{ lang.flag }}</text>
                        <view class="language-info">
                            <text class="language-native">{{ lang.nativeName }}</text>
                            <text class="language-english">{{ lang.name }}</text>
                        </view>
                        <view v-if="lang.code === currentLanguage" class="check-icon">✓</view>
                    </view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n, type SupportedLanguage } from '@/utils/i18n';

// 使用多语言组合式函数
const { t, currentLanguage, currentLanguageInfo, supportedLanguages, setLanguage } = useI18n();

// 弹窗显示状态
const showLanguagePicker = ref(false);
const languagePopup = ref();

// 打开语言选择器
const openPicker = () => {
    showLanguagePicker.value = true;
    languagePopup.value?.open();
};

// 关闭语言选择器
const closePicker = () => {
    showLanguagePicker.value = false;
    languagePopup.value?.close();
};

// 选择语言
const selectLanguage = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    closePicker();
    
    // 显示切换成功提示
    uni.showToast({
        title: t('操作成功'),
        icon: 'success',
        duration: 1500
    });
};

// 弹窗状态变化
const onPopupChange = (e: any) => {
    if (!e.show) {
        showLanguagePicker.value = false;
    }
};

// 暴露方法给父组件
defineExpose({
    openPicker,
    closePicker
});
</script>

<style lang="scss" scoped>
.language-switcher {
    .language-button {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #f5f5f5;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
            background: #e8e8e8;
        }
        
        .language-flag {
            font-size: 16px;
            margin-right: 6px;
        }
        
        .language-name {
            font-size: 14px;
            color: #333;
            margin-right: 4px;
        }
        
        .arrow {
            font-size: 12px;
            color: #666;
            transition: transform 0.3s ease;
        }
    }
}

.language-picker {
    background: white;
    border-radius: 16px 16px 0 0;
    max-height: 60vh;
    
    .picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #f0f0f0;
        
        .picker-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        
        .picker-close {
            font-size: 20px;
            color: #666;
            cursor: pointer;
            padding: 4px;
        }
    }
    
    .language-list {
        padding: 8px 0;
        
        .language-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            
            &:hover {
                background: #f8f8f8;
            }
            
            &.active {
                background: #e3f2fd;
                
                .language-native {
                    color: #1976d2;
                    font-weight: 600;
                }
            }
            
            .language-flag {
                font-size: 24px;
                margin-right: 12px;
            }
            
            .language-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                
                .language-native {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 2px;
                }
                
                .language-english {
                    font-size: 12px;
                    color: #666;
                }
            }
            
            .check-icon {
                font-size: 18px;
                color: #1976d2;
                font-weight: bold;
            }
        }
    }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
    .language-switcher .language-button {
        background: #2a2a2a;
        color: #fff;
        
        &:hover {
            background: #3a3a3a;
        }
        
        .language-name {
            color: #fff;
        }
        
        .arrow {
            color: #ccc;
        }
    }
    
    .language-picker {
        background: #1a1a1a;
        
        .picker-header {
            border-bottom-color: #333;
            
            .picker-title {
                color: #fff;
            }
            
            .picker-close {
                color: #ccc;
            }
        }
        
        .language-list .language-item {
            &:hover {
                background: #2a2a2a;
            }
            
            &.active {
                background: #1e3a5f;
                
                .language-native {
                    color: #64b5f6;
                }
            }
            
            .language-info {
                .language-native {
                    color: #fff;
                }
                
                .language-english {
                    color: #aaa;
                }
            }
            
            .check-icon {
                color: #64b5f6;
            }
        }
    }
}
</style>
