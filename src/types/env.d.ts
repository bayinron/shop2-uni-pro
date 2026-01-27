// src/types/env.d.ts
interface ImportMetaEnv {
  VITE_APP_BASE_URL: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
