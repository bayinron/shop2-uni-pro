import { defineStore } from 'pinia';
import { store } from '@/stores';
import { ref } from 'vue';
import globalTool from '@/utils/globalTool';
import {   type UserInfo,  authGetMe,  getHomeConfig  } from '@/api/index';
// import { getSystemConfig, type SystemConfig, } from '@/api';
import langData from '@/static/lang.json'


export const useUserStore = defineStore('user', () => {
    // state
    const userId = ref();
    const baseURL = import.meta.env.VITE_APP_BASE_URL;

    let wxCode = ref(); //服务器用来获取用户搜索历史记录的唯一id
    const chanyeRange = ref<Array<Object>>([]); // 用户权限编码集合 → 判断按钮权限
    let currentDomain = window.location.origin;
    if (currentDomain.includes('localhost')) {
        currentDomain = '';
    }
    const url = location.origin.indexOf('http://localhost') > -1 ? baseURL + '/' : location.origin + '/';

    // const yzmurl = location.origin +'/api/api/captcha?key=' ;
    const yzmurl = location.origin.indexOf('http://localhost') > -1 ? location.origin + '/api/api/captcha?key=' : location.origin + '/api/captcha?key=';
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
    const userInfo = ref<UserInfo>({
        "id": 106,
        "phone": "13111111111",
        "email": null,
        "username": "u_13111111111",
        "nickname": "u_13111111111",
        "avatar": null,
        "gender": null,
        "birthday": null,
        "status": 1,
        "invite_code_status": true,
        "level": 1,
        "credit_score": 100,
        "invite_code": null,
        "invited_by_code": null,
        "balance": "0.00",
        "last_login_ip": "45.192.2.32",
        "last_login_at": null,
        "email_verified_at": null,
        "phone_verified_at": null,
        "created_at": "2026-02-03 17:49:42",
        "updated_at": "2026-02-06 16:22:14",
        "deleted_at": null,
        "roles": [],
        "role_names": [],
        user_role: 'user',
        withdraw_status: false
    });
    const homeConfig = ref<any>({});
    function reqHomeConfig() {
        getHomeConfig().then((res: any) => {
            homeConfig.value = res;
        });
    }

    function setUserInfo(user: UserInfo) {
        userInfo.value = user;
    }

    function reqUserInfo() {
        authGetMe().then((res: any) => {
            userInfo.value = res;
        });
    }
    return {
        url,
        setUserInfo,
        userInfo,
        reqUserInfo
    };
});

// 非setup
export function useUserStoreHook() {
    return useUserStore(store);
}
