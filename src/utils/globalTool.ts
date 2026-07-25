import { uploadFile, type UploadFileType } from '@/api/upload';
import { $t } from '@/utils/i18n';

// 兼容小程序端 wx 全局对象（用于文件系统等 API）
declare const wx: any;

export default {
    //针对姓名的隐私处理,如果姓名是3个字，隐藏中间一个字，如果2个字，隐藏最后一个字
    privacyName: (name: string) => {
        if (name.length === 3) {
            return name.substring(0, 1) + '*' + name.substring(2, 3);
        } else if (name.length === 2) {
            return name.substring(0, 1) + '*';
        }
        return name;
    },
    back: () => {
        var pages = getCurrentPages();
        if (pages.length > 1) {
            uni.navigateBack({
                delta: 1
            });
        } else {
            uni.switchTab({
                url: '/pages/home/index'
            });
        }
    },
    showModal: function (content: any, cb: Function, showCancel: boolean = false, title?: string, confirmText?: string, cancelText?: string) {
        uni.showModal({
            title: title || $t('提示'),
            content: content,
            showCancel: showCancel,
            confirmText: confirmText || $t('确定'),
            cancelText: cancelText || $t('取消'),
            success: function (res) {
                if (res.confirm && cb instanceof Function) {
                    cb();
                } else if (res.cancel) {
                    console.log($t('用户点击取消'));
                }
            }
        });
    },
    sendMsg: function (title: string) {
        uni.showToast({
            title: title,
            duration: 1500
        });
    },
    showToast: function (title: string, backHandler: Function | boolean = false, _icon: any = 'none') {
        if (_icon) {
            uni.showToast({
                title: title,
                duration: 1500,
                icon: _icon
            });
        } else
            uni.showToast({
                title: title,
                duration: 1500
            });
        if (typeof backHandler == 'function') {
            setTimeout(() => {
                backHandler();
            }, 1000);
        }
        if (typeof backHandler == 'boolean' && backHandler) {
            setTimeout(() => {
                this.back();
            }, 1500);
        }
    },
    checkLogin: function () {
        let token = uni.getStorageSync('token');
        if (token) {
            return true;
        } else {
            uni.reLaunch({
                url: '/pages/login/login'
            });
            return false;
        }
    },
    //base64转本地图片，将数据存储在本地
    base64ToSave: function (base64data: string, FILE_BASE_NAME = 'tmp_base64src') {
        const fsm = uni.getFileSystemManager();
        return new Promise((resolve, reject) => {
            //format这个跟base64数据的开头对应
            const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
            if (!format) {
                reject(new Error('ERROR_BASE64SRC_PARSE'));
            }
            const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
            const buffer = wx.base64ToArrayBuffer(bodyData);
            fsm.writeFile({
                filePath,
                data: buffer,
                encoding: 'binary',
                success() {
                    resolve(filePath);
                },
                fail() {
                    reject(new Error('ERROR_BASE64SRC_WRITE'));
                }
            });
        });
    },
    brightenKeyword: function (hText: string, text: string, color: string) {
        /**
         * 将 \ . ( ) 等等字符前面都加上 \
         * @param val string
         * @returns string
         */
        function eacapeReg(val: any) {
            return val.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\./g, '\\.').replace(/\+/g, '\\+').replace(/\*/g, '\\*').replace(/\$/g, '\\$').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\^/g, '\\^').replace(/\|/g, '\\|').replace(/\-/g, '\\-').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\?/g, '\\?').replace(/\!/g, '\\!').replace(/\,/g, '\\,');
        }
        if (hText && text) {
            /**
             * 全局匹配、不区分大小写
             */
            const Reg = new RegExp(eacapeReg(hText), 'gi');
            // const keys = this.queryKeys.reduce((t, v, ind) => {
            //     t += v;
            //     if (ind != this.queryKeys.length - 1) t += '|';
            //     return t;
            // }, '');
            const keys = hText;
            return text.replace(new RegExp(keys, 'gi'), function ($1) {
                return `<span style="color: ${color};">${hText === $1 ? hText : $1}</span>`;
            });
        } else {
            return text;
        }
    },
    deepCopy: function (obj: any) {
        return startCopy(obj);

        function startCopy(obj2: any) {
            let source: any;
            if (Object.prototype.toString.call(obj2) == '[object Array]' || Object.prototype.toString.call(obj2) == '[object Object]') {
                if (Object.prototype.toString.call(obj2) == '[object Array]') {
                    source = [];
                }
                if (Object.prototype.toString.call(obj2) == '[object Object]') {
                    source = {};
                }
                Object.keys(obj2).forEach((v) => {
                    if (Object.prototype.toString.call(obj2[v]) == '[object Object]' || Object.prototype.toString.call(obj2[v]) == '[object Array]') source[v] = startCopy(obj2[v]);
                    else source[v] = obj2[v];
                });
                return source;
            } else source = obj2;
            return source;
        }
    },
    numToChinese: function (num: number) {
        let numArr = [$t('一'), $t('二'), $t('三'), $t('四'), $t('五'), $t('六'), $t('七'), $t('八'), $t('九')];

        return numArr[num];
    },
    setStore: function (name: string, content: any) {
        if (!name) return;
        if (typeof content !== 'string') {
            content = JSON.stringify(content);
        }
        uni.setStorageSync(name, content);
    },

    //防抖
    debounce: function (func: Function, context: any, duration: number = 1000, immediate: boolean = false) {
        let timeout: any;

        return function (...args: any[]) {
            const later = () => {
                timeout = undefined;
                if (!immediate) {
                    func.apply(context, args);
                }
            };

            const callNow = immediate && !timeout;
            if (timeout) {
                console.log($t('点太快了'));
            }
            clearTimeout(timeout);
            timeout = setTimeout(later, duration);

            if (callNow) {
                func.apply(context, args);
            }
        };
    },

    copyText: function (text: string, tips?: string) {
        const successTips = tips || $t('已复制到剪贴板');
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    this.showToast(successTips);
                })
                .catch((err) => {
                    this.showToast($t('复制失败,请手动长按复制'));
                });
        } else {
            // TipsManger.getInstance().showTips('当前浏览器不支持粘贴板功能');
            this.fallbackCopyTextToClipboard(text, successTips);
        }
    },
    fallbackCopyTextToClipboard: function (text: string, tips: string) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            console.log('Fallback: Copying text command was ' + (successful ? 'successful' : 'unsuccessful'));
            this.showToast(tips);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            this.showToast($t('复制失败,请手动长按复制'));
        }
        document.body.removeChild(textArea);
    },
    Base64: {
        encode(str: string) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match: string, p1: string) {
                    return String.fromCharCode(parseInt('0x' + p1));
                }));
        },
        decode(str: string) {
            return decodeURIComponent(atob(str).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }
    },
    /** 媒體資源 URL 前綴（與 userStore.prefixUrl 邏輯一致） */
    getMediaPrefixUrl: function (): string {
        const baseURL = import.meta.env.VITE_APP_BASE_URL || '';
        const isH5 = typeof window !== 'undefined' && typeof location !== 'undefined';
        let currentDomain = isH5 ? window.location.origin : '';
        if (currentDomain.includes('localhost')) {
            currentDomain = '';
        }
        return baseURL || currentDomain;
    },
    /** 拼接前綴供前端圖片展示 */
    resolveMediaUrl: function (url: string): string {
        if (!url) return '';
        if (/^(https?:|blob:|data:)/i.test(url)) return url;
        const prefix = this.getMediaPrefixUrl();
        if (!prefix) return url;
        const base = prefix.replace(/\/+$/, '');
        const path = url.replace(/^\/+/, '');
        return `${base}/${path}`;
    },
    /** 去掉展示前綴，還原為 API 提交用的原始路徑 */
    stripMediaUrl: function (url: string): string {
        if (!url) return '';
        if (/^(blob:|data:)/i.test(url)) return url;
        const prefix = this.getMediaPrefixUrl();
        if (prefix) {
            const base = prefix.replace(/\/+$/, '');
            if (url.startsWith(`${base}/`) || url === base) {
                const stripped = url.slice(base.length);
                return stripped.startsWith('/') ? stripped : `/${stripped}`;
            }
        }
        return url;
    },
    /** 是否為有效上傳 URL（排除 blob / data 本地預覽） */
    isUploadedMediaUrl: function (url: string): boolean {
        if (!url || /^(blob:|data:)/i.test(url)) return false;
        const submitUrl = this.stripMediaUrl(url);
        return !!submitUrl && !/^(blob:|data:)/i.test(submitUrl);
    },
    /**
     * 選圖並上傳至 /api/upload，返回後端原始 url（不含展示前綴）
     * @param maxSizeMB 最大檔案大小（MB）
     * @param fileType 上傳類型，默認 img
     */
    chooseAndUploadImage: function (maxSizeMB = 3, fileType: UploadFileType = 'img'): Promise<string> {
        const maxSize = maxSizeMB * 1024 * 1024;
        return new Promise((resolve) => {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const tempFilePath = res.tempFilePaths[0];
                    uni.getFileInfo({
                        filePath: tempFilePath,
                        success: async (fileInfo) => {
                            if (fileInfo.size > maxSize) {
                                this.showToast(
                                    $t('图片大小不能超过 {size}MB').replace('{size}', String(maxSizeMB)),
                                    false,
                                    'none',
                                );
                                resolve('');
                                return;
                            }
                            try {
                                const { data } = await uploadFile({
                                    filePath: tempFilePath,
                                    file_type: fileType,
                                });
                                resolve(data?.url || '');
                            } catch {
                                resolve('');
                            }
                        },
                        fail: () => resolve(''),
                    });
                },
                fail: () => resolve(''),
            });
        });
    },
    upload: function (): Promise<any> {
        function decode(str: string) {
            return decodeURIComponent(atob(str).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }
        return new Promise((resolve, reject) => {
            uni.chooseImage({
                count: 1,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const localImg = res.tempFilePaths[0];
                    const token = uni.getStorageSync('token');
                    uni.uploadFile({
                        url: 'Upload/upfile?lang=zh',
                        filePath: localImg,
                        header: {
                            Authorization: 'Bearer ' + token
                        },
                        name: 'file',
                        formData: {
                            type: 'img',
                            folder:"shiming"//英文+数字。上传目录，不能为空，请根据业务自己写个目录，比如实名认证、用户头像等可以用不同目录区分。也可以是同一个
                        },
                        success: (res) => {
                            let data:any =  JSON.parse(res.data);
                            if (data.code == 200) {
                                let data2:any = decode(data.data);
                                let data3:any = JSON.parse(data2);
                                resolve(data3);
                            } else {
                                uni.showToast({
                                    title: data.msg,
                                    mask: true,
                                    icon: 'none',
                                    duration: 2000
                                });
                                reject(data.msg);
                            }
                        },
                        fail: (err) => {
                            reject(err);
                        }
                    });
                },
                fail: (err: any) => {
                    reject(err);
                }
            });
        });
    },
    /** @deprecated 請改用 chooseAndUploadImage */
    uploadAvatar: function (filePath: string): Promise<string> {
        return uploadFile({
            filePath,
            file_type: 'img',
        })
            .then(({ data }) => data?.url || '')
            .catch(() => '');
    },
    /** 選圖、限制大小並上傳，返回後端原始 url */
    chooseImageWithLimit: function (maxSizeMB: number = 3): Promise<string> {
        return this.chooseAndUploadImage(maxSizeMB, 'img');
    }
};
