import type * as _compiler from 'vue/compiler-sfc'
import type { IBlock, IParser } from '../transformer'
import type { TransformResult } from 'vite'

export default <IParser>{
    name: 'vue',
    /** 匹配是否通过当前parser处理文件 */
    match(id: string): boolean {
        return !!id.replace(/\?.*/, '').match(/\.vue$/)
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(id: string, code: string, { root }): Promise<Array<IBlock>> {
        return [{ type: 'script', source: code, map: null }]
    },
    async output(id: string, blocks: Array<IBlock>): Promise<TransformResult> {
        return {
            code: blocks.map((block) => block.source).join('\n'),
            map: null
        }
    }
}
