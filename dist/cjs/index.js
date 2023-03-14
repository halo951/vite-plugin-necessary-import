/** vite-plugin-necessary-import
 *
 * @author halo951 (https://github.com/halo951)
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vite = require('vite');
var mod = require('node:module');
var utils = require('./utils.js');
require('glob');
require('node:path');
require('node:crypto');

var es = {
    name: 'es',
    /** 匹配是否通过当前parser处理文件 */
    match(id) {
        return !!id.replace(/\?.*/, '').match(/\.js(x|)$/);
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(id, code) {
        return [{ type: 'script', source: code, map: null }];
    },
    async output(id, blocks) {
        return await vite.transformWithEsbuild(blocks[0].source, id, {});
    }
};

var ts = {
    name: 'ts',
    /** 匹配是否通过当前parser处理文件 */
    match(id) {
        return !!id.replace(/\?.*/, '').match(/\.ts(x|)$/);
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(id, code) {
        const { code: source, map } = await vite.transformWithEsbuild(code, id, {});
        return [{ type: 'script', source: source, map }];
    },
    async output(id, blocks) {
        return await vite.transformWithEsbuild(blocks[0].source, id, {});
    }
};

const _require = mod.createRequire((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href)));
const tryRequire = (id, from) => {
    try {
        return from ? _require(_require.resolve(id, { paths: [from] })) : _require(id);
    }
    catch (e) { }
};
/** 加载 vue 的 compiler */
const resolveCompiler = (root) => {
    // resolve from project root first, then fallback to peer dep (if any)
    const compiler = tryRequire('vue/compiler-sfc', root) || tryRequire('vue/compiler-sfc');
    if (!compiler) {
        throw new Error(`Failed to resolve vue/compiler-sfc.\n` +
            `@vitejs/plugin-vue2 requires vue (>=2.7.0) ` +
            `to be present in the dependency tree.`);
    }
    return compiler;
};
var vue2 = {
    name: 'vue2',
    /** 匹配是否通过当前parser处理文件 */
    match(id) {
        return !!id.replace(/\?.*/, '').match(/\.vue$/);
    },
    /** 将源码转换为代码块,  */
    async tranfromToBlock(id, code, { root }) {
        const compiler = resolveCompiler(root);
        const res = compiler.parse({
            filename: id,
            source: code,
            sourceMap: true,
            sourceRoot: root
        });
        const output = [];
        if (res.script) {
            output.push({ type: res.script.type, source: res.script.content, map: res.script.map });
        }
        if (res.scriptSetup) {
            output.push({ type: res.scriptSetup.type, source: res.scriptSetup.content, map: res.scriptSetup.map });
        }
        if (res.template) {
            output.push({ type: res.template.type, source: res.template.content, map: res.template.map });
        }
        if (res.styles?.length) {
            for (const style of res.styles) {
                output.push({ type: style.type, source: style.content, map: style.map });
            }
        }
        if (res.customBlocks?.length) {
            for (const block of res.customBlocks) {
                output.push({ type: block.type, source: block.content, map: block.map });
            }
        }
        if (output.length === 0) {
            output.push({ type: 'script', source: res.source, map: null });
        }
        return output;
    },
    async output(id, blocks) {
        return {
            code: blocks.map((block) => block.source).join('\n'),
            map: null
        };
    }
};

class Transformer {
    /** 日志工具 */
    logger;
    /** rollup 构建上下文 */
    ctx;
    /** 项目根节点 (用于 vue/compiler-sfc 转换文件用) */
    root;
    /** 插件配置 */
    options;
    /** 用于文件转换的 parser */
    parsers = [vue2, ts, es];
    /** 获取解析器 */
    getParser(id, code) {
        return this.parsers.find((parser) => parser.match(id, code));
    }
    /** 转换 */
    async transform(id, code) {
        const { root, ctx } = this;
        const parser = this.getParser(id, code);
        // ? 如果缺少对应的解析器, 那么跳过文件处理
        if (!parser)
            return undefined;
        this.logger.info(`necessary import > parser: ${parser.name}, file: ${id}`);
        const blocks = await parser.tranfromToBlock(id, code, { ctx, root });
        for (const block of blocks) {
            if (['script', 'scriptsetup'].includes(block.type)) {
                const statement = this.appendStyleImport(block.source);
                if (statement) {
                    block.source = statement;
                }
            }
        }
        return parser.output(id, blocks);
    }
    /** 添加样式导入 */
    appendStyleImport(source) {
        const { library, noComponent } = this.options;
        const rootNode = this.ctx.parse(source);
        const { body } = rootNode;
        // @ 判断 node 节点, 是否为匹配到的组件库
        const isLibraryImport = (node) => node.source.value === library;
        // @ 匹配到的组件
        const components = [];
        // > 从 ast node tree 中, 获取导入的组件
        for (const node of body) {
            if (node.type === 'ImportDeclaration' && isLibraryImport(node)) {
                for (const specifier of node.specifiers) {
                    const componentName = specifier.imported.name;
                    components.push(componentName);
                }
            }
        }
        // > 将组件转化为样式导入语句
        const styleImportStatements = components
            // 跳过用户指定的非组件对象
            .filter((componentName) => {
            return !(noComponent ?? []).includes(componentName);
        })
            .map((componentName) => {
            return this.transformComponentNameToStyleImportStatement(componentName);
        })
            .filter((statemnet) => !!statemnet);
        // ? 如果存在待导入的样式, 那么附加到源码上返回
        if (styleImportStatements.length) {
            return [...styleImportStatements, source].join('\n');
        }
    }
    /** 将 组件名转化为样式导入语句 */
    transformComponentNameToStyleImportStatement(componentName) {
        const { noFoundStyle } = this.options;
        const stylePathFactory = this.createStylePathFactory();
        // 获取生成的路径信息
        const stylePath = stylePathFactory(componentName);
        if (stylePath) {
            return `import '${stylePath}';`;
        }
        else {
            // ? 如果返回值是 null, 那么这个导入的对象是用户指定的非组件对象, 忽略导入
            // 这里主要处理 自定义的 stylePathFactory
            if (stylePath === null)
                return;
            const message = `necessary import > 组件: '${componentName}' 未找到样式文件, 如果这不是一个组件, 那么需要添加 'noComponent' 配置`;
            if (noFoundStyle === 'error') {
                throw new Error(message);
            }
            else if (noFoundStyle === 'warn') {
                this.logger.warn(message);
            }
            else ;
        }
    }
    createStylePathFactory() {
        const { root } = this;
        const { library, extension, styleDir } = this.options;
        let stylePathFactory;
        if (typeof styleDir === 'function') {
            stylePathFactory = styleDir;
        }
        else {
            stylePathFactory = utils.createDefaultStylePathFactory({
                root,
                library,
                styleDir,
                extension
            });
        }
        return stylePathFactory;
    }
}

/** vite 按需引用插件
 *
 * @description 参考 `babel-plugin-import`, 用于处理组件库按需应用功能在vite下的实现.
 * - rollup 原生具备 TreeStaking 优势. 在此前提下, 仅需要补全组件库的样式导入即具备按需引用功能
 *
 * @returns {Plugin}
 */
const necessaryImport = (options) => {
    const include = options.include ?? ['src/main.ts', 'src/App.vue'];
    const exclude = options.exclude ?? [];
    const logLevel = options.logLevel ?? 'info';
    // @ 定义过滤器
    const filter = vite.createFilter(include, exclude);
    // @ 定义日志工具
    const logger = vite.createLogger(logLevel);
    // @ 定义按需加载的 transformer
    const transformer = new Transformer();
    return {
        name: 'vite-plugin:necessary-import',
        enforce: 'post',
        configResolved(config) {
            // ? 判断依赖项是否安装
            if (utils.isInstalledDependency(options.library, config.root)) {
                throw new Error(`> necessaryImport: The library '${options.library}' is not install.`);
            }
            // @ 考虑 monorepo 可能存在映射的关系, 默认的styleDir不便于获取 package.main 参数, 暂定为根路径
            const styleDir = options.styleDir ?? '/';
            let extension = ['css', 'less', 'scss', 'sass'];
            // - 兼容不同写法的的文件扩展类型参数处理
            if (options.extension instanceof Array) {
                extension = options.extension;
            }
            extension = extension.map((ext) => (ext.includes('*') ? ext : `*.${ext}`));
            transformer.root = config.root;
            transformer.logger = logger;
            transformer.options = {
                include,
                exclude,
                logLevel,
                styleDir,
                extension,
                noComponent: [],
                noFoundStyle: 'warn',
                ...options
            };
        },
        buildStart() {
            transformer.ctx = this;
        },
        /** lifecycle: 处理代码 */
        async transform(code, id) {
            // ? 过滤掉其他文件
            if (!filter(id))
                return;
            const res = await transformer.transform(id, code);
            return res;
        }
    };
};

exports.necessaryImport = necessaryImport;
