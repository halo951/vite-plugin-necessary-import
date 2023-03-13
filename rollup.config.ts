import typescript from 'rollup-plugin-typescript2'
import { GetManualChunkApi, RollupOptions } from 'rollup'
import pkg from './package.json'
import * as np from 'path'

const banner: string = `
/** ${pkg.name}
 *
 * @author ${pkg.author.name} (${pkg.author.url})
 * @license ${pkg.license}
 */`.trim()

/** export rollup.config */
export default (): RollupOptions => {
    const formats: Array<'cjs' | 'es'> = ['cjs', 'es']
    return {
        input: 'src/index.ts',
        plugins: [typescript({ clean: true, useTsconfigDeclarationDir: true, abortOnError: true })],
        output: formats.map((f) => ({
            format: f,
            dir: np.join('dist', f),
            exports: 'auto',
            banner,
            manualChunks: (id: string, api: GetManualChunkApi): string => {
                const abstractPath: string = np.relative(np.join(process.cwd(), 'src'), id)
                if (/^configs\\/.test(abstractPath)) {
                    return np.join('config', np.basename(id, '.ts'))
                }
                if (/rules\\/.test(abstractPath)) {
                    return 'rules'
                }
                if (/utils\\/.test(abstractPath)) {
                    return 'utils'
                }
                return `index`
            },
            chunkFileNames: (chunk) => {
                return chunk.name + '.js'
            }
        }))
    }
}