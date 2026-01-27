<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useI18n } from '@/utils/i18n';
const { t } = useI18n();
onLaunch(() => {
    console.log('App Launch');
});
onShow(() => {
    console.log('App Show');
});
onHide(() => {
    console.log('App Hide');
});
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
