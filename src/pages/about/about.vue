<template>
  <view />
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';

onLoad(() => {
  uni.redirectTo({ url: '/pages/content/page?slug=about' });
});
</script>
