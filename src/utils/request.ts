/**
 * 添加拦截器:
 *   拦截 request 请求
 *   拦截 uploadFile 文件上传
 *
 * TODO:
 *   1. 非 http 开头需拼接地址
 *   2. 请求超时
 *   3. 添加小程序端请求头标识
 *   4. 添加 token 请求头标识
 */

import { useUserStore } from '@/stores/modules/userStore';
import globalTool from '@/utils/globalTool';
const baseURL = import.meta.env.VITE_APP_BASE_URL;
import { useI18n } from '@/utils/i18n';
const { t } = useI18n();
//服务器定义的url前缀
// 添加拦截器
const httpInterceptor = {
    // 拦截前触发
    invoke(options: UniApp.RequestOptions) {
        const isDev = import.meta.env.MODE === 'development';
        const rawUrl = String(options.url || '');
        const isAbsoluteUrl = /^https?:\/\//i.test(rawUrl);
        if (!isAbsoluteUrl) {
            if (isDev) {
                options.url = '/api/api/' + rawUrl; //代理的api 替换
            } else {
                options.url = '/api/' + rawUrl;
            }
        } else {
            options.url = rawUrl;
        }

        // 2. 请求超时, 默认 60s
        options.timeout = 15000;

        // 3. 添加小程序端请求头标识
        options.header = {
            ...options.header,
            'source-client': 'miniapp'
        };
        // 4. 添加 token 请求头标识
        const token = uni.getStorageSync('token');

        if (token) {
            options.header['Authorization'] = 'Bearer ' + token;
        }
        let lang = uni.getStorageSync('lang') || 'zh';

        // 兼容绝对 URL 与已有 query 参数
        const joiner = options.url.includes('?') ? '&' : '?';
        options.url = options.url + joiner + 'lang=' + lang;
    }
};
uni.addInterceptor('request', httpInterceptor);
uni.addInterceptor('uploadFile', httpInterceptor);

/**
 * 请求函数
 * @param  UniApp.RequestOptions
 * @returns Promise
 *  1. 返回 Promise 对象
 *  2. 获取数据成功
 *    2.1 提取核心数据 res.data
 *    2.2 添加类型，支持泛型
 *  3. 获取数据失败
 *    3.1 401错误  -> 清理用户信息，跳转到登录页
 *    3.2 其他错误 -> 根据后端错误信息轻提示
 *    3.3 网络错误 -> 提示用户换网络
 */
type Data<T> = {
    code: string;
    msg: string;
    result: T;
};
const notips = ['温馨提示，请先实名'];
// 2.2 添加类型，支持泛型
export const http = <T>(options: UniApp.RequestOptions) => {
    if (options.data && typeof options.data === 'object' && (options.data as any).page == 1) {
        uni.showLoading({
            title: t('加载中'),
            mask: true
        });
    }
    // 1. 返回 Promise 对象
    return new Promise<Data<T>>((resolve, reject) => {
        uni.showLoading({
            title: t('加载中'),
            mask: true
        });
        uni.request({
            ...options,
            // 响应成功
            success(res: any) {
                if (res.data.code != 0) {
                    if (res.data.code == 401) {
                        uni.clearStorage();
                        uni.redirectTo({
                            url: '/pages/login'
                        });

                        if (res.data.msg) {
                            uni.showToast({
                                icon: 'none',
                                title: res.data.msg || t('请求错误')
                            });
                        }
                        reject(res);
                    } else if (res.data.code == 400) {
                        if (res.data.msg == '请先完成实名认证') {
                            globalTool.showModal(
                                t('温馨提示，请先实名'),
                                () => {
                                    uni.navigateTo({
                                        url: '/pages/auth/index'
                                    });
                                },
                                true
                            );
                        } else if (res.data.msg == '请先设置安全密码') {
                            uni.navigateTo({
                                url: '/pages/changePassword'
                            });
                        } else
                            uni.showToast({
                                icon: 'none',
                                title: res.data.msg || t('请求错误')
                            });
                        reject(res);
                    } else if (res.data.code == 409) {
                        uni.showToast({
                            icon: 'none',
                            title: res.data.msg || t('用户在其他设备登录')
                        });
                        uni.clearStorage();
                        uni.redirectTo({
                            url: '/pages/login'
                        });
                        reject(res);
                    } else {
                        uni.showToast({
                            icon: 'none',
                            title: res.data.msg || t('请求错误')
                        });
                        reject(res);
                    }
                } else {
                    // const data = res.data.data ? JSON.parse(globalTool.Base64.decode(res.data.data)) : res.data.data;
                    const data = res.data.data;
                    if (res.header.refresh_token) {
                        uni.setStorageSync('token', res.header.refresh_token);
                    }
                    console.log(`${options.url}:`, data);
                    //if(res.data.result)
                    // 2.1 提取核心数据 res.data
                    resolve(data);
                }
            },
            // 响应失败
            fail(err) {
                uni.showToast({
                    icon: 'none',
                    title: t('网络错误，换个网络试试')
                });
                // uni.reLaunch({ url: '/pages/login' });
                reject(err);
            },
            complete() {
                uni.hideLoading();
            }
        });
    });
};
