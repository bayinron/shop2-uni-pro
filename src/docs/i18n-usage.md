# 多语言功能使用指南

## 概述

本项目已集成完整的多语言功能，支持中文、英文、泰文和老挝文四种语言。

## 文件结构

```
src/
├── stores/modules/i18nStore.ts     # 多语言状态管理
├── utils/i18n.ts                   # 多语言工具函数
├── components/LanguageSwitcher.vue # 语言切换组件
├── static/lang.json               # 语言配置文件
└── pages/i18n-demo.vue            # 使用示例页面
```

## 使用方法

### 1. 在 Vue 组件中使用

```vue
<template>
  <view>
    <text>{{ $t('登录') }}</text>
    <button @click="handleClick">{{ $t('确定') }}</button>
  </view>
</template>

<script setup>
import { useI18n } from '@/utils/i18n';

const { t, currentLanguage, setLanguage } = useI18n();

const handleClick = () => {
  uni.showToast({
    title: t('操作成功'),
    icon: 'success'
  });
};
</script>
```

### 2. 在任何地方使用（非组件）

```typescript
import { $t, $setLang, $getLang } from '@/utils/i18n';

// 获取翻译文本
const loginText = $t('登录');

// 切换语言
$setLang('en');

// 获取当前语言
const currentLang = $getLang();
```

### 3. 使用语言切换组件

```vue
<template>
  <view>
    <!-- 直接使用组件 -->
    <language-switcher />
    
    <!-- 或者通过引用控制 -->
    <language-switcher ref="languageSwitcher" />
    <button @click="openLanguagePicker">切换语言</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const languageSwitcher = ref();

const openLanguagePicker = () => {
  languageSwitcher.value?.openPicker();
};
</script>
```

## 添加新的翻译

在 `src/static/lang.json` 文件中添加新的翻译：

```json
{
  "新功能": {
    "zh": "新功能",
    "en": "New Feature",
    "th": "ฟีเจอร์ใหม่",
    "la": "ຄຸນສົມບັດໃໝ່"
  }
}
```

## 支持的语言

| 语言代码 | 语言名称 | 本地名称 | 国旗 |
|---------|---------|---------|------|
| zh      | Chinese | 中文    | 🇨🇳  |
| en      | English | English | 🇺🇸  |
| th      | Thai    | ไทย     | 🇹🇭  |
| la      | Lao     | ລາວ     | 🇱🇦  |

## API 参考

### useI18n() 组合式函数

```typescript
const {
  t,                    // 翻译函数
  currentLanguage,      // 当前语言代码
  currentLanguageInfo,  // 当前语言信息
  supportedLanguages,   // 支持的语言列表
  setLanguage,          // 切换语言函数
  isLanguageSupported   // 检查语言支持函数
} = useI18n();
```

### I18nUtils 工具类

```typescript
import { I18nUtils } from '@/utils/i18n';

// 获取翻译
I18nUtils.t('登录');

// 切换语言
I18nUtils.setLanguage('en');

// 获取当前语言
I18nUtils.getCurrentLanguage();

// 获取当前语言信息
I18nUtils.getCurrentLanguageInfo();

// 检查语言支持
I18nUtils.isLanguageSupported('zh');

// 获取支持的语言列表
I18nUtils.getSupportedLanguages();
```

### 全局函数

```typescript
import { $t, $setLang, $getLang } from '@/utils/i18n';

$t('登录');        // 获取翻译
$setLang('en');    // 切换语言
$getLang();        // 获取当前语言
```

## 特性

- ✅ 自动检测系统语言
- ✅ 语言设置持久化存储
- ✅ 响应式语言切换
- ✅ 类型安全的 TypeScript 支持
- ✅ 优雅的语言切换组件
- ✅ 暗色主题适配
- ✅ 完整的错误处理
- ✅ 支持动态添加翻译

## 注意事项

1. 翻译键名建议使用中文，便于维护
2. 新增翻译后需要确保所有支持的语言都有对应的翻译
3. 语言切换会触发全局事件 `languageChanged`
4. 语言设置会自动保存到本地存储
5. 组件已全局注册，可在任何页面直接使用

## 示例页面

访问 `/pages/i18n-demo` 查看完整的使用示例和功能演示。
