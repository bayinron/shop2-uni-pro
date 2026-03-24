<template>
    <div class="news_con_wrap">
        <div class="iframe_wrap">
            <web-view :src="url"></web-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const url = ref<string>('');

onLoad((options: any) => {
    url.value = options.url || '';
});
</script>

<style lang="scss" scoped>
.news_con_wrap {
    width: 100%;
    height: 100vh;
    background: #fff;
    overflow: hidden;

    .iframe_wrap {
        width: 100%;
        height: 100%;
        position: relative;
    }
}
</style>

