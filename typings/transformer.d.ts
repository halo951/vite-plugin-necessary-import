import type { PluginContext } from 'rollup'
import type { TransformResult, Logger } from 'vite'
import type { INecessaryImportOptions, IStyleType } from '.'
declare module 'rollup' {
    interface Position {
        line: number
        column: number
    }
    interface SourceLocation {
        start: Position
        end: Position
    }
    interface AcornNode {
        type: string
        start: number
        end: number
        loc: SourceLocation
        value: string
        raw: string
        name: string
        source: AcornNode
        imported: AcornNode
        local: AcornNode
        specifiers: Array<AcornNode>
    }
}
export interface IBlock {
    /** 代码块类型 */
    type: 'script' | 'scriptsetup' | string
    /** 原始代码块 */
    source: string
    /** 映射的map */
    map: any
    /** 待添加的语句 */
    prefix?: string
}
export interface IParser {
    /** parser name */
    name: string
    /** 匹配是否适用当前方案 */
    match(id: string, code: string): boolean
    /** 将源码转换为代码块,  */
    tranfromToBlock(
        id: string,
        code: string,
        opt: {
            ctx: PluginContext
            root: string
        }
    ): Promise<Array<IBlock>>
    /** 将传入代码块转为输出内容 */
    output(id: string, blocks: Array<IBlock>): Promise<TransformResult>
}
export declare class Transformer {
    /** 日志工具 */
    logger: Logger
    /** rollup 构建上下文 */
    ctx: PluginContext
    /** 项目根节点 (用于 vue/compiler-sfc 转换文件用) */
    root: string
    /** 插件配置 */
    options: Required<INecessaryImportOptions> & {
        extension: Array<IStyleType>
    }
    baseStyle?: string
    /** 用于文件转换的 parser */
    private parsers
    /** 获取解析器 */
    private getParser
    /** 转换 */
    transform(id: string, code: string): Promise<TransformResult | undefined>
    /** 添加样式导入 */
    private appendStyleImport
    /** 将 组件名转化为样式导入语句 */
    private transformComponentNameToStyleImportStatement
    private createStylePathFactory
    /** 获取 base 样式文件夹的导入语句
     *
     * @description 当设置启用时, 默认会在入口文件中注入检索的 base 样式
     * @type {true} 默认检索文件 `base.<extension>`
     * @type {string} 遵循base指定的样式文件名
     * @type {null|undefined} 忽略
     */
    appendBaseStyleImportStatement(base?: true | string | null): void
}
