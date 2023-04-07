import type { PluginContext, AcornNode } from 'rollup'
import type { TransformResult, Logger } from 'vite'
import type { INecessaryImportOptions, IStylePathFactory, IStyleType } from '.'
import { createDefaultStylePathFactory } from './utils'
import def from './parser/def'
import vue from './parser/vue'

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
    tranfromToBlock(id: string, code: string, opt: { ctx: PluginContext; root: string }): Promise<Array<IBlock>>
    /** 将传入代码块转为输出内容 */
    output(id: string, blocks: Array<IBlock>): Promise<TransformResult>
}

export class Transformer {
    /** 日志工具 */
    logger!: Logger

    /** rollup 构建上下文 */
    ctx!: PluginContext

    /** 项目根节点 (用于 vue/compiler-sfc 转换文件用) */
    root!: string

    /** 插件配置 */
    options!: Required<INecessaryImportOptions> & { extension: Array<IStyleType> }

    baseStyle?: string

    /** 用于文件转换的 parser */
    private parsers: Array<IParser> = [vue, def]

    /** 获取解析器 */
    private getParser(id: string, code: string): IParser | undefined {
        return this.parsers.find((parser) => parser.match(id, code))
    }

    /** 转换 */
    async transform(id: string, code: string): Promise<TransformResult | undefined> {
        const { root, ctx } = this
        const parser: IParser = this.getParser(id, code)!
        // ? 如果缺少对应的解析器, 那么跳过文件处理
        if (!parser) return
        this.logger.info(`necessary import > parser: ${parser.name}, file: ${id}`)
        if (this.options.logLevel === 'silent') console.time(`parser: ${parser.name}`)
        const blocks = await parser.tranfromToBlock(id, code, { ctx, root })
        for (const block of blocks) {
            if (['script', 'scriptsetup'].includes(block.type)) {
                const statement: string | undefined = this.appendStyleImport(block.source)
                if (statement) {
                    block.source = statement
                }
            }
        }
        if (this.options.logLevel === 'silent') console.timeEnd(`parser: ${parser.name}`)
        return parser.output(id, blocks)
    }

    /** 添加样式导入 */
    private appendStyleImport(source: string): string | undefined {
        const { library, noComponent } = this.options

        const rootNode = this.ctx.parse(source) as unknown as { body: Array<AcornNode> }
        const { body } = rootNode
        // @ 判断 node 节点, 是否为匹配到的组件库
        const isLibraryImport = (node: AcornNode): boolean => node.source.value === library
        // @ 匹配到的组件
        const components: Array<string> = []
        // > 从 ast node tree 中, 获取导入的组件
        for (const node of body) {
            if (node.type === 'ImportDeclaration' && isLibraryImport(node)) {
                for (const specifier of node.specifiers) {
                    if (specifier.imported?.name) {
                        const componentName: string = specifier.imported.name
                        components.push(componentName)
                    }
                }
            }
        }
        // > 将组件转化为样式导入语句
        const styleImportStatements: Array<string> = components
            // 跳过用户指定的非组件对象
            .filter((componentName: string): boolean => {
                return !(noComponent ?? []).includes(componentName)
            })
            .map((componentName: string): string | undefined => {
                return this.transformComponentNameToStyleImportStatement(componentName)
            })
            .filter((statemnet: string | undefined): boolean => !!statemnet) as Array<string>

        // ? 如果存在待导入的样式, 那么附加到源码上返回
        if (styleImportStatements.length) {
            // append source
            styleImportStatements.push(source)
            // ! vite 提供有 tree stacking 能力, 所以这里可以放心的多次添加公共样式
            if (this.baseStyle) {
                styleImportStatements.unshift(this.baseStyle as string)
            }
            return styleImportStatements.join('\n')
        }
    }

    /** 将 组件名转化为样式导入语句 */
    private transformComponentNameToStyleImportStatement(componentName: string): string | undefined {
        const { noFoundStyle } = this.options
        const stylePathFactory = this.createStylePathFactory()

        // 获取生成的路径信息
        const stylePath = stylePathFactory(componentName)
        if (stylePath) {
            this.logger.info(`necessary import > import '${stylePath}'`)
            return `import '${stylePath}';`
        } else {
            // ? 如果返回值是 null, 那么这个导入的对象是用户指定的非组件对象, 忽略导入
            // 这里主要处理 自定义的 stylePathFactory
            if (stylePath === null) return
            const message: string = `necessary import > 组件: '${componentName}' 未找到样式文件, 如果这不是一个组件, 那么需要添加 'noComponent' 配置`
            if (noFoundStyle === 'error') {
                throw new Error(message)
            } else if (noFoundStyle === 'warn') {
                this.logger.warn(message)
            } else {
                // skip by false
            }
        }
    }

    private createStylePathFactory(): IStylePathFactory {
        const { root } = this
        const { library, extension, styleDir } = this.options
        let stylePathFactory: IStylePathFactory
        if (typeof styleDir === 'function') {
            stylePathFactory = styleDir
        } else {
            stylePathFactory = createDefaultStylePathFactory({
                root,
                library,
                styleDir,
                extension
            })
        }
        return stylePathFactory
    }
    /** 获取 base 样式文件夹的导入语句
     *
     * @description 当设置启用时, 默认会在入口文件中注入检索的 base 样式
     * @type {true} 默认检索文件 `base.<extension>`
     * @type {string} 遵循base指定的样式文件名
     * @type {null|undefined} 忽略
     */
    public appendBaseStyleImportStatement(base?: true | string | null): void {
        // ? 忽略添加
        if (!base) return
        if (typeof base === 'string') {
            const isStatement: boolean = /import \['"]/.test(base)
            if (isStatement) {
                this.baseStyle = base
            } else {
                this.baseStyle = `import '${base}';`
            }
        } else {
            // 需要扫描库中包含的样式句
            const stylePathFactory: IStylePathFactory = this.createStylePathFactory()
            // 获取生成的路径信息
            const stylePath = stylePathFactory('base')
            if (stylePath) {
                this.baseStyle = `import '${stylePath}';`
            }
        }
        this.logger.info(`necessary import > ${this.options.library} base style: '${this.baseStyle}'`)
    }
}
