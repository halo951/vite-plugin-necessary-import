import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { necessaryImport } from 'vite-plugin-necessary-import'

export default defineConfig({
    plugins: [
        // vue2 transformer
        // vue(),
        vue2({
            exclude: ['node_modules/**']
        }),
        necessaryImport({ library: 'meri-design' }),
        necessaryImport({ library: 'element-ui' }),
        necessaryImport({ library: 'ant-design-vue' }),
        necessaryImport({ library: 'vant', logLevel: 'info', extension: ['less'] })
    ]
})
