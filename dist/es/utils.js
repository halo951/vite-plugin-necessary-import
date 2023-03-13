/** vite-plugin-necessary-import
 *
 * @author halo951 (https://github.com/halo951)
 * @license MIT
 */
import { globSync } from 'glob';
import { normalizePath } from 'vite';
import * as np from 'node:path';
import * as mod from 'node:module';
import { createHash } from 'node:crypto';

const cache = new Map();
const getHash = (text) => {
    return createHash('sha256').update(text).digest('hex').substring(0, 8);
};
/** 转化为破折号命名 */
const toDashCase = (name) => {
    return name.replace(/[A-Z]/g, (sub, charIndex) => {
        return (charIndex ? '-' : '') + sub.toLowerCase();
    });
};
/** 获取样式 */
const getLibraryStyle = (scanDir, extension) => {
    const id = getHash(JSON.stringify({ scanDir, extension }));
    const createLibraryCache = () => {
        const files = globSync(extension, {
            matchBase: true,
            cwd: scanDir
        }).map((path) => normalizePath(path));
        cache.set(id, files);
        return files;
    };
    return cache.get(id) ?? createLibraryCache();
};
/** 创建默认的样式文件路径加载的工厂方法 */
const createDefaultStylePathFactory = (opt) => {
    const { root, library, styleDir, extension } = opt;
    const scanDir = np.join(root, 'node_modules', library, styleDir);
    return (componentName) => {
        // dashName (破折号命名)
        const dashName = toDashCase(componentName);
        // lowerName (纯小写, 用来处理大小驼峰命名)
        const lowerName = componentName.toLowerCase();
        const files = getLibraryStyle(scanDir, extension)
            // 过滤包含组件名的样式
            .filter((normalizedPath) => {
            const splitedBaseNames = normalizedPath.split('/').map((name) => {
                return np.basename(name, np.extname(name));
            });
            return splitedBaseNames.some((name) => [dashName, lowerName].includes(name.toLowerCase()));
        })
            // 样式路径格式化
            .map((path) => {
            return normalizePath(np.join(library, styleDir, path));
        })
            // 排序 (一般的库应该不影响)
            .sort((a, b) => {
            // a 与 b 的权重
            let weight = [0, 0];
            // 根据组件名在路径中的顺序, 越靠前的优先级越高
            weight[0] += a.replace(/[-]/, '').toLowerCase().indexOf(lowerName);
            weight[1] += b.replace(/[-]/, '').toLowerCase().indexOf(lowerName);
            // 根据 extension 优先级计算优先级
            weight[0] += extension.length - extension.indexOf(np.extname(a).replace(/.+?\./, ''));
            weight[1] += extension.length - extension.indexOf(np.extname(b).replace(/.+?\./, ''));
            return -1 * (weight[0] - weight[1]);
        });
        if (files.length > 0) {
            return files[0];
        }
        else {
            return undefined;
        }
    };
};
const tryRequire = (id, from) => {
    const _require = mod.createRequire(import.meta.url);
    try {
        return from ? _require(_require.resolve(id, { paths: [from] })) : _require(id);
    }
    catch (e) { }
};
/** 通过 node_modules 中的依赖判断library是否安装 */
const isInstalledDependency = (library, from) => {
    return !!tryRequire(library, from);
};

export { createDefaultStylePathFactory as c, isInstalledDependency as i };
