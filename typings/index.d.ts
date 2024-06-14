import type { Plugin, FilterPattern, LogLevel } from 'vite'
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
    /** 基础样式
     *
     * @description 当设置启用时, 默认会在入口文件中注入检索的 base 样式
     * @type {true} 默认检索文件 `base.<extension>`
     * @type {string} 遵循base指定的样式文件名
     * @type {null|undefined} 忽略
     */
    base?: true | string | null
}
/** vite 按需引用插件
 *
 * @description 参考 `babel-plugin-import`, 用于处理组件库按需应用功能在vite下的实现.
 * - rollup 原生具备 TreeStaking 优势. 在此前提下, 仅需要补全组件库的样式导入即具备按需引用功能
 *
 * @returns {Plugin}
 */
export declare const necessaryImport: (options: INecessaryImportOptions) => Plugin
