import type { IStylePathFactory } from '..'
/** 通过 node_modules 中的依赖判断library是否安装
 *
 * @description 实践过程中, 发现存在导出为 esm 的情况, 但是貌似 require 受影响. 这里采用一个最简单的处理逻辑, 去获取这个依赖的package.json, 以此来判断是否安装
 */
export declare const isInstalledDependency: (library: string, from?: string) => boolean
/** 创建默认的样式文件路径加载的工厂方法 */
export declare const createDefaultStylePathFactory: (opt: {
    root: string
    library: string
    styleDir: string
    extension: Array<string>
}) => IStylePathFactory
