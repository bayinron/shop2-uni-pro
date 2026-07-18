/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string
  /** 默认语言：th / 泰语 / zh / 中文 */
  readonly VITE_APP_LANG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
