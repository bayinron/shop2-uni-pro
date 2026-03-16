<template>
    <div class="recharge-page">
        <div class="recharge_warp1">
            <div class="recharge_header">
                <div class="title_section">
                    <h1>人民币充值</h1>
                    <div class="recharge_banner">
                        <span>联系客服获取充值信息</span>
                    </div>
                </div>
                <div class="illustration_section">
                    <img src="@/static/img2/txicon.png" alt="" />
                </div>
            </div>
            
            <view class="content">
                <div class="shu">
                    <!-- <div class="choose_money">
                        <div v-for="amount in amounts" :key="amount" :class="{ active: money === amount }" @click="selectAmount(amount)">
                            {{ amount }}
                        </div>
                    </div> -->
                    <view class="input_warp">
                        <input type="number" v-model="money" placeholder="请输入充值金额" />
                    </view>
                </div>

                <div class="recharge_warp3">
                    <span class="recharge-info-title">充值信息</span>

                    <div class="upload_section">
                        <div class="upload_title">上传付款凭证信息</div>
                        <div class="pz_img">
                            <view class="upload-wrapper" @click="chooseImage">
                                <image 
                                    v-if="previewImage" 
                                    :src="previewImage" 
                                    mode="widthFix"
                                    class="preview-image"
                                />
                                <view v-else class="upload-placeholder">
                                    <image 
                                        src="@/static/img/dxc.png" 
                                        mode="widthFix" 
                                        class="placeholder-icon"
                                    />
                                </view>
                                <view v-if="previewImage" class="delete-btn" @click.stop="deletePic">
                                    <text>×</text>
                                </view>
                            </view>
                        </div>
                    </div>

                    <div class="tips_section">
                        <div class="tips_title">温馨提示</div>
                        <div class="tips_content">由于充值会员过多，为方便会员充值，需要银行卡转账请在线客服索要专属收款银行卡号，为了实现到账成功，转账成功后请联系客服在线客服提供截图。</div>
                    </div>

                    <div class="zf">
                        <p class="goldbtn" @click="handleSubmit">已完成支付</p>
                    </div>
                </div>
            </view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { bankRecharge, getuserdetail } from '@/api';
import type { UserInfo } from '@/api/types';
import globalTool from '@/utils/globalTool';
const money  = ref<number>();


const selectAmount = (amount: number) => {
    money.value = amount;
};

const userInfo = ref<UserInfo>({} as UserInfo);
const src = ref('');
const previewImage = ref<string>('');
const url = ref<string | null>(null);
const type = ref<string | null>(null);

// 选择图片
const chooseImage = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            console.log('选择的图片路径:', tempFilePath);
            console.log('所有临时路径:', res.tempFilePaths);
            
            // 先验证图片是否可以访问
            uni.getImageInfo({
                src: tempFilePath,
                success: (info) => {
                    console.log('图片信息验证成功:', info);
                    previewImage.value = tempFilePath;
                    // 将图片转换为 base64
                    convertToBase64(tempFilePath);
                },
                fail: (err) => {
                    console.error('图片信息验证失败:', err);
                    uni.showToast({
                        title: '图片无效，请重新选择',
                        icon: 'none'
                    });
                }
            });
        },
        fail: (err) => {
            console.error('选择图片失败:', err);
            uni.showToast({
                title: '选择图片失败',
                icon: 'none'
            });
        }
    });
};

// 将图片转换为 base64
const convertToBase64 = (filePath: string) => {
    // #ifdef H5
    // H5 端使用 fetch + FileReader
    fetch(filePath)
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                src.value = base64data;
                console.log('H5 图片转换成功，base64 长度:', base64data.length);
            };
            reader.onerror = () => {
                console.error('FileReader 错误');
                uni.showToast({
                    title: '图片转换失败',
                    icon: 'none'
                });
            };
            reader.readAsDataURL(blob);
        })
        .catch(err => {
            console.error('fetch 错误:', err);
            uni.showToast({
                title: '图片读取失败',
                icon: 'none'
            });
        });
    // #endif
    
    // #ifdef APP-PLUS
    // App 端使用 plus.io 读取文件
    usePlusIO(filePath);
    // #endif
};

// App 端使用 plus.io 读取文件
const usePlusIO = (filePath: string) => {
    if (typeof plus === 'undefined' || !plus.io) {
        console.error('plus.io 不可用');
        uni.showToast({
            title: '当前环境不支持文件读取',
            icon: 'none'
        });
        return;
    }
    
    plus.io.resolveLocalFileSystemURL(filePath, (entry: any) => {
        entry.file((file: any) => {
            // 在 App 端使用 plus.io.FileReader
            const reader = new plus.io.FileReader();

            reader.onloadend = (evt: any) => {
                const base64data = evt.target?.result as string || (evt as any).result as string;
                if (base64data) {
                    src.value = base64data;
                    console.log('plus.io 转换成功，base64 长度:', base64data.length);
                    console.log('base64 前100个字符:', base64data.substring(0, 100));
                } else {
                    console.error('base64 数据为空');
                    uni.showToast({
                        title: '图片数据为空，请重试',
                        icon: 'none'
                    });
                }
            };

            reader.onerror = (err: any) => {
                console.error('plus.io.FileReader 错误:', err);
                uni.showToast({
                    title: '图片读取失败，请重试',
                    icon: 'none'
                });
            };

            reader.readAsDataURL(file);
        }, (err: any) => {
            console.error('entry.file 失败:', err);
            uni.showToast({
                title: '无法读取文件，请重新选择',
                icon: 'none'
            });
        });
    }, (err: any) => {
        console.error('resolveLocalFileSystemURL 失败:', err);
        uni.showToast({
            title: '文件路径无效，请重新选择',
            icon: 'none'
        });
    });
};

// 使用 uni.getFileSystemManager 读取文件（小程序端）
const useFileSystemManager = (filePath: string) => {
    // 检查 uni.getFileSystemManager 是否可用
    if (typeof uni.getFileSystemManager !== 'function') {
        console.error('uni.getFileSystemManager 不可用');
        uni.showToast({
            title: '当前平台不支持文件读取',
            icon: 'none'
        });
        return;
    }
    
    console.log('使用 getFileSystemManager 读取文件:', filePath);
    const fsm = uni.getFileSystemManager();
    
    fsm.readFile({
        filePath: filePath,
        encoding: 'base64',
        success: (res: any) => {
            console.log('readFile 成功，数据长度:', res.data?.length);
            if (!res.data) {
                console.error('读取的数据为空');
                uni.showToast({
                    title: '图片数据为空，请重试',
                    icon: 'none'
                });
                return;
            }
            
            // 判断图片类型
            let mimeType = 'image/jpeg';
            if (filePath.includes('.png') || filePath.toLowerCase().includes('png')) {
                mimeType = 'image/png';
            } else if (filePath.includes('.gif') || filePath.toLowerCase().includes('gif')) {
                mimeType = 'image/gif';
            }
            // 生成 base64 字符串，格式：data:image/png;base64,xxxxx
            const base64data = `data:${mimeType};base64,${res.data}`;
            src.value = base64data;
            console.log('图片转换成功，base64 长度:', base64data.length);
            console.log('base64 前100个字符:', base64data.substring(0, 100));
        },
        fail: (err: any) => {
            console.error('readFile 失败:', err);
            uni.showToast({
                title: '图片读取失败，请重试',
                icon: 'none'
            });
        }
    });
};

// 删除图片
const deletePic = () => {
    console.log('删除图片，清空 previewImage 和 src');
    previewImage.value = '';
    src.value = '';
};

const handleSubmit = () => {
    if (!money.value) {
        uni.showToast({
            title: '请输入转账金额',
            icon: 'none'
        });
        return;
    }

    if (!src.value) {
        uni.showToast({
            title: '请上传支付凭证',
            icon: 'none'
        });
        return;
    }

    bankRecharge(  money.value.toString(),  src.value,'','' ).then((data: any) => {
        globalTool.showToast(data.msg, true);
    }).catch((err: any) => {
        uni.showToast({
            title: err.msg,
            icon: 'none'
        });
    });
};
const getUrl = (_type: string) => {
    type.value = _type;
    const token = uni.getStorageSync('token');
    url.value = `/api/kefu_url.php?token=${token}&type=${_type}`;
    uni.navigateTo({
        url: `/pages/chatcon/index?url=${url.value}`
    });
    console.log(url.value);
};
const initData = () => {
    getuserdetail().then((data: any) => {
        userInfo.value = data;
        uni.setStorageSync('pay_pwd', data.pay_pwd);
    });
};

onShow(() => {
    initData();
});
</script>

<style lang="scss" scoped>
page {
    background-color: #000;
}

.recharge-page {
    background-color: #000;
    min-height: 100vh;
    width: 100%;
    position: relative;
    padding-bottom: 40rpx;
    padding-top: 0;
    margin-top: 0;
    
    /* 确保子元素也不会产生白色空隙 */
    * {
        box-sizing: border-box;
    }

    .recharge_warp1 {
        position: relative;
        
        .content {
            border-radius: 20rpx;
            padding: 20rpx 0;
            border: 1rpx solid #ffffff;
            width: 95%;
            margin: 0 auto;
        }
        
        .recharge_header {
            width: 90%;
            margin: 30rpx auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 20rpx;
            box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

            .title_section {
                flex: 1;
                margin-right: 30rpx;

                h1 {
                    font-size: 40rpx;
                    color: #ffffff;
                    font-weight: 700;
                    margin-bottom: 20rpx;
                    line-height: 1.2;
                }

                .recharge_banner {
                    background: linear-gradient(to right, #f9dfb7, #ffc676);
                    color: #855100;
                    font-size: 28rpx;
                    padding: 15rpx 25rpx;
                    border-radius: 15rpx;
                    display: inline-block;
                    font-weight: 600;
                    border: 2rpx dashed #855100;
                    position: relative;
                    
                    &::before {
                        content: '';
                        position: absolute;
                        top: -2rpx;
                        left: -2rpx;
                        right: -2rpx;
                        bottom: -2rpx;
                        background: linear-gradient(to right, #f9dfb7, #ffc676);
                        border-radius: 15rpx;
                        z-index: -1;
                    }
                }
            }

            .illustration_section {
                width: 180rpx;
                height: 180rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
            }
        }

        .shu {
            margin-top: 20rpx;

            .choose_money {
                width: 95%;
                margin: 0 auto;
                display: flex;
                flex-wrap: wrap;
                gap: 10rpx;
                justify-content: space-between;
                
                div {
                    width: 200rpx;
                    background: #fff;
                    font-size: 28rpx;
                    height: 70rpx;
                    line-height: 70rpx;
                    text-align: center;
                    border-radius: 12rpx;
                    margin-bottom: 20rpx;
                    box-shadow: 0 2rpx 10rpx rgba(51, 94, 248, 0.1);
                    transition: all 0.3s ease;

                    &.active {
                        background: #ae8c54;
                        color: #fff;
                        font-weight: 700;
                        box-shadow: 0 4rpx 15rpx rgba(51, 94, 248, 0.3);
                    }
                }
            }
        }
        .input_warp {
            width: 90%;
            height: 80rpx;
            margin: 20rpx auto 0;
            input {
                width: 100%;
                height: 100%;
                border: 1rpx solid #ffffff;
                border-radius: 10rpx;
                padding-left: 20rpx;
                color: #ffffff;
            }
        }
        .recharge_warp3 {
            width: 90%;
            margin: 20rpx auto 0;

            .recharge-info-title {
                display: block;
                margin: 30rpx 0;
                font-size: 32rpx;
                color: #fff;
                font-weight: 600;
            }

            .upload_section {
                background-color: #f9f1e5;
                padding: 20rpx;
                border-radius: 16rpx;
                margin-bottom: 20rpx;
                box-shadow: 0 2rpx 10rpx rgba(51, 94, 248, 0.1);
               
                .upload_title {
                    font-size: 32rpx;
                    color: #333;
                    font-weight: 600;
                    margin-bottom: 20rpx;
                }
               
                .pz_img {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                   
                    .upload-wrapper {
                        position: relative;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 200rpx;
                       
                        .upload-placeholder {
                            width: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                           
                            .placeholder-icon {
                                width: 50%;
                                display: block;
                            }
                        }
                       
                        .preview-image {
                            max-width: 100%;
                            border-radius: 8rpx;
                            display: block;
                        }
                       
                        .delete-btn {
                            position: absolute;
                            top: -10rpx;
                            right: -10rpx;
                            width: 50rpx;
                            height: 50rpx;
                            background-color: #ff4444;
                            border-radius: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            color: #fff;
                            font-size: 40rpx;
                            font-weight: bold;
                            z-index: 10;
                            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
                           
                            text {
                                line-height: 1;
                            }
                        }
                    }
                }
            }

            .tips_section {
                background-color: #f9f1e5;
                padding: 20rpx;
                margin-top: 40rpx;
                border-radius: 16rpx;
                box-shadow: 0 2rpx 10rpx rgba(51, 94, 248, 0.1);

                .tips_title {
                    font-size: 32rpx;
                    color: #333;
                    font-weight: 600;
                    margin-bottom: 20rpx;
                }

                .tips_content {
                    font-size: 28rpx;
                    color: #ff4444;
                    line-height: 1.6;
                }
            }

            .zf {
                width: 100%;
                margin: 60rpx auto;

                p {
                    width: 100%;
                    height: 96rpx;
                    line-height: 96rpx;
                    text-align: center;
                    font-weight: 700;
                    font-size: 32rpx;
                    border-radius: 48rpx;
                    box-shadow: 0 6rpx 20rpx rgba(51, 94, 248, 0.3);
                }
            }
        }
    }
}
</style>
