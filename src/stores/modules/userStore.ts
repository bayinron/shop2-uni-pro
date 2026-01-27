import { defineStore } from 'pinia';
import { store } from '@/stores';
import { ref } from 'vue';
import globalTool from '@/utils/globalTool';
import {   type UserInfo,  getHomeConfig  } from '@/api/index';
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
        reg_type: 2, //账号类型：1手机注册，2用户名注册
        username: 'test00001', //账号或手机号
        area_code: '', //区号，reg_type=1时有值
        phone: '', //手机号，reg_type=1时有值
        lev: 1, //等级
        balance: '0.0000', //账户余额
        balance_t: '0.0000', //提现余额
        agent_id: 0, //代理ID、
        p1: 1, //上1级ID
        p2: 0, //上2级iD
        p3: 0, //上3级ID
        auth_status: 0, //实名状态：0未提交 ，1待审核，2通过，3拒绝
        invite_code_status: 1, //邀请码状态
        recharge_total: '0.0000', //累计充值金额
        credit_num: 100, //信用分
        avatar: '/api/Up/v?u=/sysset/20250822/6df8d8864d5d9a2310592409f3bc958c.jpg', //头像
        c_total: 0, //可用抽奖次数
        invite_code: '********', //邀请码。在invite_code_status且累计充值>0时为真实邀请码
        is_payassword: 1, //是否已设置了提现密码。1已设置，0未设置
        lev_info: {
            //等级信息
            id: 1,
            lev: 1, //等级
            name: 'One Star Member', //等级名称
            icon: '/api/Up/v?u=/sysset/20250809/db5dd04c96cc0c817cd162b53e1e9910.jpg', //图标
            daily_job_num: 20, //每日可刷单次数
            limit_amount: '30.00000',
            min_withdrawal: '15.00000', //单次最小提现金额
            max_withdrawal: '10000.00000', //单次最大提现金额
            commission_rate: '0.00115', //佣金比例。示例0.00115即0.115%
            withdrawal_fee_rate: '0.03000' //提现手续费。示例0.03即3%
        }
    });
    const homeConfig = ref<any>({});
    function reqHomeConfig() {
        getHomeConfig().then((res: any) => {
            homeConfig.value = res;
        });
    }
    
    return {
        
        
    };
});

// 非setup
export function useUserStoreHook() {
    return useUserStore(store);
}
