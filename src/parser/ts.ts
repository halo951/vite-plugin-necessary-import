import type { IBlock, IParser } from '../transformer'
import { transformWithEsbuild, TransformResult } from 'vite'

export default <IParser>{
    name: 'ts',
    /** 匹配是否通过当前parser处理文件 */
    match(id: string): boolean {
        return !!id.replace(/\?.*/, '').match(/\.ts(x|)$/)
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(id: string, code: string): Promise<Array<IBlock>> {
        const { code: source, map } = await transformWithEsbuild(code, id, {})
        return [{ type: 'script', source: source, map }]
    },
    async output(id: string, blocks: Array<IBlock>): Promise<TransformResult> {
        return await transformWithEsbuild(blocks[0].source, id, {})
    }
}
