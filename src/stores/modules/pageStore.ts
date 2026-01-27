import { defineStore } from 'pinia';
// import { loginApi } from '../../api';
import { store } from '@/stores';
import { ref } from 'vue';

export const usePageStore = defineStore('page', () => {
    // state
    const cyCodes = ref([]); //产业代码
    const setCyCodes = (data: any) => {
        cyCodes.value = data;
    };
    

    const zixunContent = ref('');
    const setZixunContent = (data: string) => {
        zixunContent.value = data;
    };
    

    /**
     * 登录调用
     *
     * @param {LoginData}
     * @returns
     */
    function login(loginData: any) {
        return new Promise<void>((resolve, reject) => {
            // loginApi(loginData)
            //     .then((response: any) => {
            //         // sessionStorage.setItem('tokenName', response.data.tokenName);
            //         // sessionStorage.setItem('sessionid', response.data.sessionid);
            //         // router.push({
            //         //     path: '/'
            //         // });
            //         resolve();
            //     })
            //     .catch((error: any) => {
            //         reject(error);
            //     });
        });
    }

    return {
        setCyCodes,
        setZixunContent,
        zixunContent
     
    };
});

// 非setup
export function usePageStoreHook() {
    return usePageStore(store);
}
