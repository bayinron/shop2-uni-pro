<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { applyTabBarI18n, refreshAppI18nChrome } from '@/utils/pageTitle';

onLaunch(() => {
    // App 启动时尚不在 tab 页，setTabBarItem 常会失败；延后到首屏 tab 渲染后再设
    setTimeout(() => applyTabBarI18n(true), 100);
    setTimeout(() => applyTabBarI18n(true), 400);
    uni.$on('languageChanged', () => {
        refreshAppI18nChrome();
        setTimeout(() => applyTabBarI18n(true), 100);
    });
});

onShow(() => {
    // 回前台时再同步（需已在 tab 页才稳）
    setTimeout(() => applyTabBarI18n(), 50);
});

onHide(() => {});
</script>
<style lang="scss">
@import '@climblee/uv-ui/index.scss';
page {
    background-color: #f0f8ff;
}
body {
    overscroll-behavior-y: none;
}
</style>
