import type { IStylePathFactory } from '..';
/** 创建默认的样式文件路径加载的工厂方法 */
export declare const createDefaultStylePathFactory: (opt: {
    root: string;
    library: string;
    styleDir: string;
    extension: Array<string>;
}) => IStylePathFactory;
/** 通过 node_modules 中的依赖判断library是否安装 */
export declare const isInstalledDependency: (library: string, from?: string) => boolean;
