import type { PluginContext } from 'rollup'
import type { Plugin, FilterPattern, LogLevel, ResolvedConfig, TransformResult } from 'vite'
import { createFilter, createLogger } from 'vite'
import { Transformer } from './transformer'
import { isInstalledDependency } from './utils'

/** style 文件爱你路径生成的工厂方法
 *
 * @description 如果某个组件(如:导出的loading方法)
 *
 * @returns 当返回值为 undefined 时, 将抛出组件样式为找到异常。
 */
export type IStylePathFactory = (componentName: string) => string | undefined

export type IStyleType = 'css' | 'less' | 'saas' | 'scss' | string

export interface IViteCommonOptions {
    /** 扫描文件目录
     *
     * @default
     *  - src/ ** / *.ts
     *  - src/ ** / *.tsx
     *  - src/ ** / *.js
     *  - src/ ** / *.jsx
     *  - src/ ** / *.vue
     */
    include?: FilterPattern

    /** 排除文件目录 */
    exclude?: FilterPattern

    /** 日志输出等级
     *
     * @default {'warn'} 默认警告等级
     */
    logLevel?: LogLevel
}

export interface INecessaryImportOptions extends IViteCommonOptions {
    /** 组件库 */
    library: string

    /** 样式文件类型 (后缀名)
     *
     * @description 当 `styleDir` 参数值为 Function 时, 此参数失效
     *
     * @type {Array<IStyleType>} 指定包含哪种类型后缀的样式文件 (为了避免额外的问题, 这里仅允许传入 Array 类型参数)
     *
     * @default ` ['css','less', 'scss', 'sass']
     */
    extension?: Array<IStyleType>

    /** 从哪个文件夹扫描样式文件
     *
     * @type {string} 从哪个文件夹内扫描样式, 默认: `/`, 即 `/node_modules/<library>/ ** / <component name> / *.(style)`
     * @type {IStylePathFactory} 自定义样式导入路径的工厂方法
     *
     * @description 如果 `IStylePathFactory` 的返回值指定了文件后缀名, 那么 `style` 参数将失效
     */
    styleDir?: string | IStylePathFactory

    /** 指定哪些导入不是组件
     *
     * @description 这个参数用来处理一些方法导出的特殊情况, 当扫描到这些导入时, 将跳过样式注入
     */
    noComponent?: Array<string>

    /** 没有找到组件的样式文件怎么处理
     *
     * @type {'warn'} 仅弹出警告
     * @type {'error'} 抛出异常
     * @type {false} 忽略
     */
    noFoundStyle?: 'warn' | 'error' | false
}

/** vite 按需引用插件
 *
 * @description 参考 `babel-plugin-import`, 用于处理组件库按需应用功能在vite下的实现.
 * - rollup 原生具备 TreeStaking 优势. 在此前提下, 仅需要补全组件库的样式导入即具备按需引用功能
 *
 * @returns {Plugin}
 */
export const necessaryImport = (options: INecessaryImportOptions): Plugin => {
    const include: FilterPattern = options.include ?? ['src/**/*.ts(x|)', 'src/**/*.js(x|)', 'src/**/*.vue']
    const exclude: FilterPattern = options.exclude ?? []
    const logLevel: LogLevel = options.logLevel ?? 'warn'
    // @ 定义过滤器
    const filter = createFilter(include, exclude)
    // @ 定义日志工具
    const logger = createLogger(logLevel)
    // @ 定义按需加载的 transformer
    const transformer = new Transformer()

    return {
        name: 'vite-plugin:necessary-import',
        enforce: 'post',
        configResolved(config: ResolvedConfig): void {
            // ? 判断依赖项是否安装
            if (!isInstalledDependency(options.library, config.root)) {
                logger.warn(`> necessaryImport: The library '${options.library}' is not install.`)
            }
            // @ 考虑 monorepo 可能存在映射的关系, 默认的styleDir不便于获取 package.main 参数, 暂定为根路径
            const styleDir = options.styleDir ?? '/'
            let extension: Array<IStyleType> = ['css', 'less', 'scss', 'sass']
            // - 兼容不同写法的的文件扩展类型参数处理
            if (options.extension instanceof Array) {
                extension = options.extension
            }
            extension = extension.map((ext) => (ext.includes('*') ? ext : `*.${ext}`))
            transformer.root = config.root
            transformer.logger = logger
            transformer.options = {
                library: options.library,
                noFoundStyle: options.noFoundStyle ?? 'warn',
                noComponent: options.noComponent ?? [],
                include,
                exclude,
                logLevel,
                styleDir,
                extension
            }
        },
        buildStart(): void {
            transformer.ctx = this as unknown as PluginContext
        },
        /** lifecycle: 处理代码 */
        async transform(code: string, id: string): Promise<TransformResult | undefined> {
            // ? 过滤掉其他文件
            if (!filter(id)) return
            const res = await transformer.transform(id, code)
            return res
        }
    }
}
