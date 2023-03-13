import type { IBlock, IParser } from '../transformer'
import { transformWithEsbuild, TransformResult } from 'vite'

export default <IParser>{
    name: 'es',
    /** 匹配是否通过当前parser处理文件 */
    match(id: string): boolean {
        return !!id.replace(/\?.*/, '').match(/\.js(x|)$/)
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(id: string, code: string): Promise<Array<IBlock>> {
        return [{ type: 'script', source: code, map: null }]
    },
    async output(id: string, blocks: Array<IBlock>): Promise<TransformResult> {
        return await transformWithEsbuild(blocks[0].source, id, {})
    }
}
