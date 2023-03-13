/** vite-plugin-necessary-import
 *
 * @author halo951 (https://github.com/halo951)
 * @license MIT
 */
'use strict';

var glob = require('glob');
var vite = require('vite');
var np = require('node:path');
var mod = require('node:module');
var node_crypto = require('node:crypto');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var np__namespace = /*#__PURE__*/_interopNamespace(np);
var mod__namespace = /*#__PURE__*/_interopNamespace(mod);

const cache = new Map();
const getHash = (text) => {
    return node_crypto.createHash('sha256').update(text).digest('hex').substring(0, 8);
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
        const files = glob.globSync(extension, {
            matchBase: true,
            cwd: scanDir
        }).map((path) => vite.normalizePath(path));
        cache.set(id, files);
        return files;
    };
    return cache.get(id) ?? createLibraryCache();
};
/** 创建默认的样式文件路径加载的工厂方法 */
const createDefaultStylePathFactory = (opt) => {
    const { root, library, styleDir, extension } = opt;
    const scanDir = np__namespace.join(root, 'node_modules', library, styleDir);
    return (componentName) => {
        // dashName (破折号命名)
        const dashName = toDashCase(componentName);
        // lowerName (纯小写, 用来处理大小驼峰命名)
        const lowerName = componentName.toLowerCase();
        const files = getLibraryStyle(scanDir, extension)
            // 过滤包含组件名的样式
            .filter((normalizedPath) => {
            const splitedBaseNames = normalizedPath.split('/').map((name) => {
                return np__namespace.basename(name, np__namespace.extname(name));
            });
            return splitedBaseNames.some((name) => [dashName, lowerName].includes(name.toLowerCase()));
        })
            // 样式路径格式化
            .map((path) => {
            return vite.normalizePath(np__namespace.join(library, styleDir, path));
        })
            // 排序 (一般的库应该不影响)
            .sort((a, b) => {
            // a 与 b 的权重
            let weight = [0, 0];
            // 根据组件名在路径中的顺序, 越靠前的优先级越高
            weight[0] += a.replace(/[-]/, '').toLowerCase().indexOf(lowerName);
            weight[1] += b.replace(/[-]/, '').toLowerCase().indexOf(lowerName);
            // 根据 extension 优先级计算优先级
            weight[0] += extension.length - extension.indexOf(np__namespace.extname(a).replace(/.+?\./, ''));
            weight[1] += extension.length - extension.indexOf(np__namespace.extname(b).replace(/.+?\./, ''));
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
    const _require = mod__namespace.createRequire((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('utils.js', document.baseURI).href)));
    try {
        return from ? _require(_require.resolve(id, { paths: [from] })) : _require(id);
    }
    catch (e) { }
};
/** 通过 node_modules 中的依赖判断library是否安装 */
const isInstalledDependency = (library, from) => {
    return !!tryRequire(library, from);
};

exports.createDefaultStylePathFactory = createDefaultStylePathFactory;
exports.isInstalledDependency = isInstalledDependency;
