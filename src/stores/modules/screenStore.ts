import { defineStore } from 'pinia';
import { store } from '@/stores';
import { ref } from 'vue';

export const useScreenStore = defineStore('screen', () => {
    // state
    const screenHeight = ref();
    const menuRect = ref(); //小程序胶囊位置信息
    function getHomePageHeight() {
         
        // #ifdef MP-WEIXIN
        menuRect.value = uni.getMenuButtonBoundingClientRect();
        // #endif
        // #ifndef MP-WEIXIN
        menuRect.value = {"top":"24px","height":"30px"};      
        // #endif
 

        // 使用 uni.getSystemInfo 获取屏幕高度
        uni.getSystemInfo({
            success: (res) => {
                screenHeight.value = res.windowHeight;

                // 使用 uni.getMenuButtonBoundingClientRect 获取 tabBar 的位置信息
                // const menuButtonInfo = uni.getMenuButtonBoundingClientRect();

                // if (menuButtonInfo) {
                //     // 计算主页高度（排除 tabBar）
                //     const tabBarHeight = screenHeight - menuButtonInfo.bottom;
                //     console.log('主页高度（不包括 tabBar）:', tabBarHeight);
                // } else {
                //     console.log('未找到 tabBar 信息');
                // }
            },
            fail: (err) => {
                console.log('获取屏幕高度失败', err);
            }
        });
    }

    return {
        getHomePageHeight,
        screenHeight,
        menuRect
    };
});

// 非setup
export function useScreenStoreHook() {
    return useScreenStore(store);
}
