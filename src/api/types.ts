
export interface LotteryStatus {
    c_total: number; //总抽奖次数
    c_lave: number; //剩余抽奖次数
    c_ok: number; //已抽奖次数
    status: number; //1正常，0不可抽奖
}

/**
 * 目标站点（https://www.lcst-lerp.com/#/）首页接口类型
 * - banner: https://api.shsh-thai.com/api/v1/banner/list
 * - news:   https://api.shsh-thai.com/api/v1/newsInfo/list
 * - goods:  https://api.shsh-thai.com/api/v1/shopGoods/list?page=1&limit=20
 */

export type LerpApiResponse<T> = {
    code?: number | string;
    msg?: string;
    message?: string;
    data?: T;
    result?: T;
    rows?: T;
};

export interface LerpBannerItem {
    id?: number | string;
    title?: string;
    image?: string;
    img?: string;
    pic?: string;
    url?: string;
    link?: string;
    sort?: number;
}

export interface LerpNewsItem {
    id?: number | string;
    title?: string;
    content?: string;
    brief?: string;
    createdAt?: string;
    createTime?: string;
    updatedAt?: string;
}

export interface LerpPageResult<T> {
    list?: T[];
    rows?: T[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface LerpGoodsItem {
    id?: number | string;
    title?: string;
    name?: string;
    desc?: string;
    cover?: string;
    img?: string;
    images?: string[];
    price?: number | string;
    originalPrice?: number | string;
    sales?: number;
}
