// src/types/env.d.ts
interface ImportMetaEnv {
  VITE_APP_BASE_URL: string;
  /** 默认语言：th / 泰语 / zh / 中文 */
  VITE_APP_LANG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
