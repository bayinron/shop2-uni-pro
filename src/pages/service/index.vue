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

/** 未 encode 整段 url 時，& 後參數會被拆到 options；在此拼回 */
function restoreKefuUrl(options: Record<string, any> = {}): string {
    let raw = options.url || '';
    try {
        // 路由可能帶入一次編碼形態
        if (raw && !/^https?:\/\//i.test(raw) && /%[0-9A-Fa-f]{2}/.test(raw)) {
            raw = decodeURIComponent(raw);
        }
    } catch (_) {}

    const passthroughKeys = ['siteKey', 'channel', 'visitor_id'];
    for (const key of passthroughKeys) {
        const val = options[key];
        if (val === undefined || val === null || val === '') continue;
        if (new RegExp(`[?&]${key}=`).test(raw)) continue;
        raw += (raw.includes('?') ? '&' : '?') + `${key}=${val}`;
    }
    return raw;
}

onLoad((options: any) => {
    url.value = restoreKefuUrl(options);
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

