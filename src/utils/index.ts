import type { IStylePathFactory } from '..'
import { globSync } from 'glob'
import { normalizePath } from 'vite'
import * as np from 'node:path'
import mod from 'node:module'

const tryRequire = (id: string, from?: string): any => {
    const _require = mod.createRequire(import.meta.url)
    try {
        return from ? _require(_require.resolve(id, { paths: [from] })) : _require(id)
    } catch (e) {}
}

/** 通过 node_modules 中的依赖判断library是否安装
 *
 * @description 实践过程中, 发现存在导出为 esm 的情况, 但是貌似 require 受影响. 这里采用一个最简单的处理逻辑, 去获取这个依赖的package.json, 以此来判断是否安装
 */
export const isInstalledDependency = (library: string, from?: string): boolean => {
    return !!tryRequire(`${library}/package.json`, from)
}

const cache: Map<string, Array<string>> = new Map()

/** 转化为破折号命名 */
const toDashCase = (name: string): string => {
    return name.replace(/[A-Z]/g, (sub, charIndex: number) => {
        return (charIndex ? '-' : '') + sub.toLowerCase()
    })
}

/** 获取样式 */
const getLibraryStyle = (root: string, library: string, styleDir: string, extension: Array<string>): Array<string> => {
    const scanDir: string = np.join(root, 'node_modules', library, styleDir)
    const version: string = tryRequire(`${library}/package.json`, root)?.version || '*'
    const id: string = `${library}@${version}`
    const createLibraryCache = () => {
        const files: Array<string> = globSync(extension, {
            matchBase: true,
            cwd: scanDir
        }).map((path: string): string => normalizePath(path))
        cache.set(id, files)
        return files
    }
    return cache.get(id) ?? createLibraryCache()
}

/** 创建默认的样式文件路径加载的工厂方法 */
export const createDefaultStylePathFactory = (opt: {
    root: string
    library: string
    styleDir: string
    extension: Array<string>
}): IStylePathFactory => {
    const { root, library, styleDir, extension } = opt
    return (componentName: string): string | undefined => {
        // dashName (破折号命名)
        const dashName: string = toDashCase(componentName)
        // lowerName (纯小写, 用来处理大小驼峰命名)
        const lowerName: string = componentName.toLowerCase()

        const files: Array<string> = getLibraryStyle(root, library, styleDir, extension)
            // 过滤包含组件名的样式
            .filter((normalizedPath: string): boolean => {
                const splitedBaseNames: Array<string> = normalizedPath.split('/').map((name: string) => {
                    return np.basename(name, np.extname(name))
                })
                return splitedBaseNames.some((name: string) => [dashName, lowerName].includes(name.toLowerCase()))
            })
            // 样式路径格式化
            .map((path: string): string => {
                return normalizePath(np.join(library, styleDir, path))
            })
            // 排序 (一般的库应该不影响)
            .sort((a: string, b: string): number => {
                // a 与 b 的权重
                let weight: Array<number> = [0, 0]
                // 根据组件名在路径中的顺序, 越靠前的优先级越高
                weight[0] += a.replace(/[-]/, '').toLowerCase().indexOf(lowerName)
                weight[1] += b.replace(/[-]/, '').toLowerCase().indexOf(lowerName)
                // 根据 extension 优先级计算优先级
                weight[0] += extension.length - extension.findIndex((ext: string) => ext.includes(np.extname(a)))
                weight[1] += extension.length - extension.findIndex((ext: string) => ext.includes(np.extname(b)))
                return -1 * (weight[0] - weight[1])
            })
        if (files.length > 0) {
            return files[0]
        } else {
            return undefined
        }
    }
}
