import type { IBlock, IParser } from '../transformer'
import { transformWithEsbuild, TransformResult } from 'vite'

/** 默认解析器 */
export default <IParser>{
    name: 'default',
    /** 匹配是否通过当前parser处理文件 */
    match(id: string): boolean {
        return true
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(_id: string, code: string): Promise<Array<IBlock>> {
        return [{ type: 'script', source: code, map: null }]
    },
    async output(id: string, blocks: Array<IBlock>): Promise<TransformResult> {
        return await transformWithEsbuild(blocks[0].source, id, {})
    }
}
