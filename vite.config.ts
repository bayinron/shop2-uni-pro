import { defineConfig, loadEnv, ConfigEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from "unplugin-auto-import/vite";
import path from "path";

export default defineConfig(async (env: ConfigEnv) => {
  const { mode } = env
  const envConfig = loadEnv(mode, process.cwd())
  const UnoCss = await import('unocss/vite').then(i => i.default)
  console.log('VITE_APP_BASE_URL:', envConfig.VITE_APP_BASE_URL)
  return {
    plugins: [
      uni(),
      // 配置 UnoCSS
      UnoCss(),
      AutoImport({
        imports: ["vue", "uni-app"], // 自动导入 Vue 和 UniApp 的 API
        dts: "src/types/auto-imports.d.ts", // 自动生成类型声明文件
        eslintrc: {
          enabled: true, // 生成 ESLint 配置文件
          filepath: './.eslintrc-auto-import.json', // ESLint 配置文件路径
        },
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/uni.scss";'
        }
      }
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: path.resolve(__dirname, "src"),
        },
      ],
    },
    server: {
      https: false, // 启用 HTTPS
      host: '0.0.0.0', // 设置开发服务器的 host
      port: 5022, // 设置开发服务器的端口
      proxy: {
        '/api': {
          target: envConfig.VITE_APP_BASE_URL, // 目标服务器
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '') // 可选：重写路径
        }
      }
    },
    build: {
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,  // 移除 console
          drop_debugger: true  // 移除 debugger
        }
      }
    }
  }
})
