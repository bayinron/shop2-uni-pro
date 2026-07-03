import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

/**
 * 統一檔案上傳 API
 *
 * 約定：
 * - 所有路徑均已去掉 `/api/` 前綴，交由全局攔截器統一加上。
 * - 需 JWT 認證（攔截器會自動帶上 Authorization）。
 * - 業務表單中的 *_url 欄位只能填入本接口回傳的 url，不可提交 blob: / data: 本地預覽網址。
 * - 正確流程：選檔 → POST /api/upload → 取得 url → 再提交業務表單（JSON / 普通表單）。
 */

const { t } = useI18n();

type UploadResponseData<T> = {
  code: string | number;
  message: string;
  data: T;
};

/**
 * =========================
 * 核心媒體庫上傳
 * =========================
 *
 * POST /api/upload
 * Content-Type: multipart/form-data
 */

/** 後端允許的 file_type 分類 */
export type UploadFileType =
  | 'img'
  | 'file'
  | 'video'
  | 'voice'
  | 'pdf'
  | 'excel'
  | 'app';

export interface UploadFilePayload {
  /** 本地臨時文件路徑（如 uni.chooseImage 返回的 tempFilePaths[0]） */
  filePath: string;
  /** 業務類型，決定副檔名與大小校驗策略 */
  file_type: UploadFileType;
  /** 批次上傳時的序號，響應會原樣返回 */
  index?: number;
}

export interface UploadFileResponse {
  /** media 實體紀錄 ID */
  id: number;
  /** 雲端永久訪問 URL，供業務表單 *_url 欄位使用 */
  url: string;
  file_type: UploadFileType;
  /** 檔案大小（KB） */
  size_kb: number;
  /** 用戶原始檔名 */
  original_name?: string;
  /** 僅在上傳時傳入 index 時返回 */
  index?: number;
}

function parseUploadData(raw: unknown): UploadFileResponse {
  if (typeof raw === 'string' && raw) {
    try {
      return JSON.parse(globalTool.Base64.decode(raw)) as UploadFileResponse;
    } catch {
      return JSON.parse(raw) as UploadFileResponse;
    }
  }
  return raw as UploadFileResponse;
}

function handleUploadError(
  res: UniApp.UploadFileSuccessCallbackResult,
  reject: (reason?: unknown) => void,
) {
  try {
    const body = JSON.parse(res.data) as UploadResponseData<unknown>;
    const code = Number(body.code);

    if (code === 401) {
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.redirectTo({ url: '/pages/login/login' });
      uni.showToast({
        icon: 'none',
        title: body.message || t('请求错误'),
      });
      reject(body);
      return;
    }

    if (code === 409) {
      uni.showToast({
        icon: 'none',
        title: body.message || t('用户在其他设备登录'),
      });
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.redirectTo({ url: '/pages/login/login' });
      reject(body);
      return;
    }

    if (code === 400 && body.message === '请先完成实名认证') {
      globalTool.showModal(
        t('温馨提示，请先实名'),
        () => {
          uni.navigateTo({ url: '/pages/auth/index' });
        },
        true,
      );
      reject(body);
      return;
    }

    if (code === 400 && body.message === '请先设置安全密码') {
      uni.navigateTo({ url: '/pages/changePassword' });
      reject(body);
      return;
    }

    uni.showToast({
      icon: 'none',
      title: body.message || t('请求错误'),
    });
    reject(body);
  } catch {
    uni.showToast({
      icon: 'none',
      title: t('请求错误'),
    });
    reject(res);
  }
}

/**
 * 上傳單一檔案至遠端物件儲存（S3 / MinIO）
 *
 * @example
 * const { data } = await uploadFile({
 *   filePath: tempFilePaths[0],
 *   file_type: 'img',
 * });
 * form.id_doc_front_url = data.url;
 */
export function uploadFile(
  payload: UploadFilePayload,
  options: { noLoading?: boolean } = {},
) {
  return new Promise<UploadResponseData<UploadFileResponse>>((resolve, reject) => {
    if (!payload.filePath) {
      reject(new Error('filePath is required'));
      return;
    }

    if (!options.noLoading) {
      uni.showLoading({
        title: t('加载中'),
        mask: true,
      });
    }

    const formData: Record<string, string> = {
      file_type: payload.file_type,
    };
    if (payload.index !== undefined) {
      formData.index = String(payload.index);
    }

    uni.uploadFile({
      url: 'upload',
      filePath: payload.filePath,
      name: 'file',
      formData,
      success(res) {
        try {
          const body = JSON.parse(res.data) as UploadResponseData<unknown>;
          if (Number(body.code) !== 0) {
            handleUploadError(res, reject);
            return;
          }

          const parsed: UploadResponseData<UploadFileResponse> = {
            ...body,
            data: parseUploadData(body.data),
          };

          if (!parsed.data?.url) {
            uni.showToast({
              icon: 'none',
              title: t('请求错误'),
            });
            reject(parsed);
            return;
          }

          resolve(parsed);
        } catch {
          uni.showToast({
            icon: 'none',
            title: t('请求错误'),
          });
          reject(res);
        }
      },
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: t('网络错误，换个网络试试'),
        });
        reject(err);
      },
      complete() {
        if (!options.noLoading) {
          uni.hideLoading();
        }
      },
    });
  });
}
