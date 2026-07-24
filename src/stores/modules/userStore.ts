import { defineStore } from 'pinia';
import { store } from '@/stores';
import { ref } from 'vue';
import globalTool from '@/utils/globalTool';
import { type AuthMeResponse, type KefuLinkResponse, authGetMe, getHomeConfig, getKefuLink } from '@/api';
// import { getSystemConfig, type SystemConfig, } from '@/api';
import langData from '@/static/lang.json'


export const useUserStore = defineStore('user', () => {
    // state
    const userId = ref();
    const baseURL = import.meta.env.VITE_APP_BASE_URL;

    let wxCode = ref(); //服务器用来获取用户搜索历史记录的唯一id
    const chanyeRange = ref<Array<Object>>([]); // 用户权限编码集合 → 判断按钮权限
    const isH5 = typeof window !== 'undefined' && typeof location !== 'undefined';
    let currentDomain = isH5 ? window.location.origin : '';
    if (currentDomain.includes('localhost')) {
        currentDomain = '';
    }
    const url = isH5 && location.origin.indexOf('http://localhost') > -1
        ? baseURL + '/'
        : (isH5 ? location.origin + '/' : baseURL + '/');

    const yzmurl = isH5 && location.origin.indexOf('http://localhost') > -1
        ? location.origin + '/api/api/captcha?key='
        : (isH5 ? location.origin + '/api/captcha?key=' : baseURL + '/api/captcha?key=');
    // const langData = require('@/static/lang.json');
    const prefixUrl = ref(import.meta.env.VITE_APP_BASE_URL || currentDomain);
    const userdetail = ref<any>({});
    const showRecharge = ref(false);
    const langConfig = ref<any>({});
    
    function reqLangConfig() {
        return new Promise((resolve, reject) => {
            uni.request({
                url: '/static/lang.json',
                method: 'GET',
                success: (res) => {
                    if (res.statusCode === 200) {
                        langConfig.value = res.data;
                        resolve(res.data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                },
                fail: (err) => {
                    console.error('加载语言配置失败:', err);
                    reject(err);
                }
            });
        });
    }

    // const sysConf = ref<SystemConfig>({} as SystemConfig);
    // function getSysConf() {
    //     return new Promise<void>((resolve, reject) => {
    //         getSystemConfig().then((response: any) => {
    //             sysConf.value = response;
    //             resolve(response);
    //         });
    //     });
    // }
    const assetType = ref(0);
    function setAssetType(type: number) {
        assetType.value = type;
    }
    const userInfo = ref<AuthMeResponse>({
        id: 0,
        username: '',
        nickname: '',
        email: '',
        phone: '',
        avatar: '',
        gender: 0,
        status: 0,
        user_role: '',
        has_withdraw_password: false,
        wallet: {
            user_id: 0,
            balance_wallet: {
                balance: 0,
                frozen: 0,
                total: 0,
                balance_formatted: '',
                frozen_formatted: '',
                total_formatted: '',
            },
            settlement_wallet: {
                balance: 0,
                frozen: 0,
                total: 0,
                balance_formatted: '',
                frozen_formatted: '',
                total_formatted: '',
            },
            total: 0,
            total_formatted: '',
            balance_name: '',
            balance_symbol: '',
            updated_at: '',
        },
        created_at: '',
        updated_at: '',
        deleted_at: '',
        roles: [],
        role_names: [],
    });
    const homeConfig = ref<any>({});
    function reqHomeConfig() {
        getHomeConfig().then((res: any) => {
            homeConfig.value = res;
        });
    }

    /** 客服外部連結配置（啟動時預拉取） */
    const kefuConfig = ref<KefuLinkResponse>({
        enabled: false,
        label: '在線客服',
        url: '',
        external_url: '',
        open_type: 'external',
    });

    function reqKefuLink() {
        return getKefuLink()
            .then((res: any) => {
                const data = (res?.data ?? res) as KefuLinkResponse;
                if (data && typeof data === 'object') {
                    kefuConfig.value = {
                        enabled: !!data.enabled,
                        label: data.label || '在線客服',
                        url: data.url || data.external_url || '',
                        external_url: data.external_url || data.url || '',
                        open_type: data.open_type || 'external',
                    };
                }
                return kefuConfig.value;
            })
            .catch(() => kefuConfig.value);
    }

    /** 開啟客服外部連結（新分頁 / 系統瀏覽器） */
    function openKefu() {
        const link = kefuConfig.value.url || kefuConfig.value.external_url;
        if (!kefuConfig.value.enabled || !link) {
            return false;
        }
        // #ifdef H5
        window.open(link, '_blank');
        // #endif
        // #ifndef H5
        // @ts-ignore
        plus?.runtime?.openURL?.(link);
        // #endif
        return true;
    }

    function setUserInfo(user: AuthMeResponse) {
        userInfo.value = user;
    }

    function reqUserInfo() {
        return authGetMe().then((res: any) => {
            const data = res.data;
            // 新接口：钱包信息统一在 `wallet`，但页面仍使用 `userInfo.balance` 字段
            const wallet = data?.wallet;
            const walletBalance =
                wallet?.balance_wallet?.balance ??
                wallet?.balance; // 兼容旧结构
            if (walletBalance !== undefined && walletBalance !== null) {
                data.balance = Number(walletBalance).toFixed(2);
            } else if (wallet?.balance_wallet?.balance_formatted) {
                // 从类似 "฿7,578.00" 中提取数字
                data.balance = String(wallet.balance_wallet.balance_formatted).replace(/[^\d.-]/g, '');
            } else if (wallet?.balance_formatted) {
                // 旧结构：wallet.balance_formatted
                data.balance = String(wallet.balance_formatted).replace(/[^\d.-]/g, '');
            }
            userInfo.value = data;
            return data;
        });
    }
    return {
        prefixUrl,
        url,
        setUserInfo,
        userInfo,
        reqUserInfo,
        kefuConfig,
        reqKefuLink,
        openKefu,
    };
});

// 非setup
export function useUserStoreHook() {
    return useUserStore(store);
}
