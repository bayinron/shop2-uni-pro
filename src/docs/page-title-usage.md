# 页面标题多语言使用指南

## 概述

本项目已经实现了页面标题的多语言支持。`pages.json` 中的中文标题已经改为英文标识符，并在各个页面中动态设置多语言标题。

## 使用方法

### 1. 在页面中使用动态标题

在页面的 `<script setup>` 中导入并使用 `usePageTitle`：

```vue
<script setup lang="ts">
import { usePageTitle } from '@/utils/usePageTitle';

// 设置页面标题
usePageTitle('登录'); // 传入翻译键名
</script>
```

### 2. 手动设置标题

如果需要动态更改标题，可以使用 `setPageTitle` 函数：

```vue
<script setup lang="ts">
import { setPageTitle } from '@/utils/pageTitle';

// 在某个事件中动态设置标题
const handleSomeEvent = () => {
    setPageTitle('新的标题键');
};
</script>
```

### 3. 使用全局方法

也可以通过全局方法设置标题：

```vue
<script setup lang="ts">
// 在组件中直接使用
this.$setPageTitle('标题键');
</script>
```

## 页面标题映射

所有页面标题的映射关系如下：

| 页面路径 | 英文标识符 | 翻译键 |
|---------|-----------|--------|
| pages/home/index | Home | 首页 |
| pages/login | Login | 登录 |
| pages/register | Register | 注册 |
| pages/wealth | Wealth | 利息 |
| pages/team | Team | 团队 |
| pages/regulation | Regulation | 规则 |
| pages/share | Share | 分享 |
| pages/recharge | Recharge | 充值 |
| pages/task | Task | 任务 |
| pages/history | History | 历史 |
| pages/profile | Profile | 我的 |
| pages/withdraw | Withdraw | 提现 |
| pages/fund/detail | Fund Detail | 资金明细 |
| pages/address | Address | 提现地址 |
| pages/investmentReport | Investment Report | 投资报告 |
| pages/user/info | User Info | 用户信息 |
| pages/video | Video Center | 视频中心 |
| pages/invitefriends | Invite Friends | 邀请好友 |
| pages/vip/level | VIP Level | 星级 |
| pages/address/add | Add Address | 添加地址 |
| pages/wealth/purchase | Purchase | 认购 |
| pages/auth/index | KYC Verification | 实名认证 |
| pages/changePassword | Security Password | 创建安全密码 |
| pages/videoShow | Video Player | 视频播放 |
| pages/create-order | Create Order | 创建订单 |
| pages/orderlist | Order List | 订单列表 |
| pages/task-detail | Task Detail | 任务详情 |
| pages/level-list | Level List | 等级列表 |
| pages/certificate | Certificate | 我的证书 |
| pages/aboutus | About Us | 关于我们 |
| pages/service | Service Terms | 服务条款 |

## TabBar 标题

TabBar 的标题也已经支持多语言：

| Tab 键 | 翻译键 |
|--------|--------|
| Home | 首页 |
| Wealth | 利息 |
| Start | 开始 |
| History | 历史 |
| Profile | 我的 |

## 注意事项

1. **翻译键必须存在**：确保在 `lang.json` 中存在对应的翻译键
2. **页面加载时机**：`usePageTitle` 会在页面 `onMounted` 时自动设置标题
3. **语言切换**：当用户切换语言时，页面标题会自动更新
4. **全局标题**：应用名称 "云数之家" 也会根据语言设置动态显示

## 添加新页面

当添加新页面时，需要：

1. 在 `pages.json` 中使用英文标识符作为 `navigationBarTitleText`
2. 在 `PAGE_TITLE_MAP` 中添加映射关系
3. 在 `lang.json` 中添加对应的翻译
4. 在页面中使用 `usePageTitle('翻译键')` 设置标题

## 示例

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
  </view>
</template>

<script setup lang="ts">
import { usePageTitle } from '@/utils/usePageTitle';

// 设置页面标题
usePageTitle('新页面标题');
</script>
```

这样，页面标题就会根据用户选择的语言自动显示对应的翻译。
