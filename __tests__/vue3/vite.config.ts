import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { necessaryImport } from 'vite-plugin-necessary-import'

export default defineConfig({
    plugins: [
        vue(),
        necessaryImport({ library: 'meri-plus', logLevel: 'info' }),
        necessaryImport({ library: 'element-plus' }),
        necessaryImport({ library: 'ant-design-vue' }),
        necessaryImport({ library: 'vant' })
    ]
})
