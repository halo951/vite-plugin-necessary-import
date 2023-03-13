import type * as _compiler from 'vue/compiler-sfc'
import type { IBlock, IParser } from '../transformer'
import type { TransformResult } from 'vite'
import { createRequire } from 'node:module'

const _require = createRequire(import.meta.url)

const tryRequire = (id: string, from?: string) => {
    try {
        return from ? _require(_require.resolve(id, { paths: [from] })) : _require(id)
    } catch (e) {}
}

/** 加载 vue 的 compiler */
const resolveCompiler = (root: string): typeof _compiler => {
    // resolve from project root first, then fallback to peer dep (if any)
    const compiler = tryRequire('vue/compiler-sfc', root) || tryRequire('vue/compiler-sfc')

    if (!compiler) {
        throw new Error(
            `Failed to resolve vue/compiler-sfc.\n` +
                `@vitejs/plugin-vue2 requires vue (>=2.7.0) ` +
                `to be present in the dependency tree.`
        )
    }

    return compiler
}

export default <IParser>{
    name: 'vue2',
    /** 匹配是否通过当前parser处理文件 */
    match(id: string): boolean {
        return !!id.replace(/\?.*/, '').match(/\.vue$/)
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(id: string, code: string, { root }): Promise<Array<IBlock>> {
        const compiler = resolveCompiler(root)
        const res = compiler.parse({
            filename: id,
            source: code,
            sourceMap: true,
            sourceRoot: root
        })
        const output = []

        if (res.script) {
            output.push({ type: res.script.type, source: res.script.content, map: res.script.map })
        }
        if (res.scriptSetup) {
            output.push({ type: res.scriptSetup.type, source: res.scriptSetup.content, map: res.scriptSetup.map })
        }
        if (res.template) {
            output.push({ type: res.template.type, source: res.template.content, map: res.template.map })
        }
        if (res.styles?.length) {
            for (const style of res.styles) {
                output.push({ type: style.type, source: style.content, map: style.map })
            }
        }
        if (res.customBlocks?.length) {
            for (const block of res.customBlocks) {
                output.push({ type: block.type, source: block.content, map: block.map })
            }
        }
        if (output.length === 0) {
            output.push({ type: 'script', source: res.source, map: null })
        }
        return output
    },
    async output(id: string, blocks: Array<IBlock>): Promise<TransformResult> {
        return {
            code: blocks.map((block) => block.source).join('\n'),
            map: null
        }
    }
}
