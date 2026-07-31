<template>
  <view class="content-page">
    <view v-if="loading" class="state">
      <text class="state-text">{{ t('加载中') }}</text>
    </view>
    <view v-else-if="!htmlContent" class="state">
      <text class="state-text">{{ t('暂无数据') }}</text>
    </view>
    <view v-else class="content-card">
      <!-- #ifdef H5 -->
      <div class="html-body" v-html="htmlContent" />
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <rich-text class="html-body" :nodes="htmlContent" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getContentPageBySlug } from '@/api';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const loading = ref(true);
const htmlContent = ref('');
const pageTitle = ref('');

const SLUG_TITLE_KEY: Record<string, string> = {
  help: '帮助信息',
  about: '关于我们',
};

function pickHtml(data: any): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return (
    data.content ||
    data.html ||
    data.body ||
    data.page_content ||
    data?.page?.content ||
    ''
  );
}

function pickTitle(data: any, slug: string): string {
  const fromApi = data?.title || data?.name || data?.page_title || data?.page?.title;
  if (fromApi) return String(fromApi);
  const key = SLUG_TITLE_KEY[slug];
  return key ? t(key) : '';
}

async function loadPage(slug: string) {
  loading.value = true;
  htmlContent.value = '';
  try {
    const res: any = await getContentPageBySlug(slug);
    const data = res?.data ?? res?.result ?? res;
    htmlContent.value = pickHtml(data);
    pageTitle.value = pickTitle(data, slug);
    if (pageTitle.value) {
      uni.setNavigationBarTitle({ title: pageTitle.value });
    }
  } catch (_) {
    htmlContent.value = '';
  } finally {
    loading.value = false;
  }
}

onLoad((options: any) => {
  const slug = String(options?.slug || '').trim();
  if (!slug) {
    loading.value = false;
    return;
  }
  const fallbackKey = SLUG_TITLE_KEY[slug];
  if (fallbackKey) {
    uni.setNavigationBarTitle({ title: t(fallbackKey) });
  }
  loadPage(slug);
});
</script>

<style scoped lang="scss">
.content-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  box-sizing: border-box;
}

.state {
  padding: 120rpx 40rpx;
  text-align: center;
}

.state-text {
  font-size: 28rpx;
  color: #999;
}

.content-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  box-sizing: border-box;
}

.html-body {
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
  word-break: break-word;
  overflow-wrap: anywhere;

  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
  }

  :deep(p) {
    margin: 0 0 16rpx;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin: 12rpx 0;
    font-weight: 600;
    color: #222;
  }

  :deep(a) {
    color: #ee4d2d;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 36rpx;
    margin: 0 0 16rpx;
  }
}
</style>
