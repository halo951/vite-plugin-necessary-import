import type { RollupOptions, ModuleFormat } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import * as fs from 'node:fs'
import * as np from 'node:path'

const pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }))

const banner: string = `
/** ${pkg.name}
 *
 * @author ${pkg.author.name}(${pkg.author.url})
 * @license ${pkg.license}
 */`.trim()

/** export rollup.config */
export default async (): Promise<RollupOptions | Array<RollupOptions>> => {
    const formats: Array<ModuleFormat> = ['cjs', 'es']
    return {
        treeshake: false,
        strictDeprecations: false,
        input: 'src/index.ts',
        plugins: [
            typescript({ clean: true, useTsconfigDeclarationDir: true, abortOnError: true }),
            // compress
            terser()
        ],
        output: formats.map((format) => ({
            exports: 'auto',
            inlineDynamicImports: true,
            banner,
            format,
            file: np.join('dist', format, 'index.js')
        }))
    }
}
