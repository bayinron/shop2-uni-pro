<template>
    <uni-nav-bar left-icon="left" @clickLeft="back" color="#fff" :title="title" style="position: absolute; top: 0; left: 0; width: 100%" backgroundColor="transparent" fixed :border="false"> </uni-nav-bar>
</template>
<script setup lang="ts">
import globalTool from '@/utils/globalTool';

const props = withDefaults(defineProps<{
    title: string;
}>(), {
    title: ''
});
const back = () => {
    globalTool.back();
};
</script>
