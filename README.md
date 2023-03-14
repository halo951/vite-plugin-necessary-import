# vite-plugin-necessary-import

> vite 按需引用插件

## testing

-   framework

    -   `vue@2.x.x` : vite + @vitejs/plugin-vue2 + vue(>=2.6.11)
        -   meri-design | ✔
        -   element-ui | ✔ (局限性: 组件内部引用 Icon 等基础组件时, 需要额外注册基础组件引用)
        -   vant@2.12.54 | ✔
        -   ant-design-vue@1.7.8 | ✔
    -   `vue2:js` : vite + @vitejs/plugin-vue2
    -   `vue3` : vite + @vitejs/plugin-vue | ✔
    -   `react` : vite + @vitejs/plugin-react | ✔
    -   `react:swc` : vite + @vitejs/plugin-react | ✔
    -   `svelte` : vite + @vitejs/plugin-svelte | ✔
    -   `vue2` : vite + @vitejs/plugin-vue2 | ✔

-   ui library

    -   element-ui
    -   element-plus
    -   meri-design
    -   vant
    -   ant-design-vue

## Usage

-   install

```bash
# npm
npm install vite-necessary-import -D
# pnpm
pnpm install vite-necessary-import -D
# yarn
yarn add vite-necessary-import --dev
```

-   config for vite.config.ts

```typescript
import { defineConfig } from 'vite'
import { necessaryImport } from 'vite-necessary-import'

export default defineConfig({
    plugins: [
        // element-ui
        necessaryImport({ library: 'element-ui' }),
        // antdv
        necessaryImport({ library: 'ant-design-vue' }),
        // vant
        necessaryImport({ library: 'vant' }),
        // meri-design
        necessaryImport({ library: 'meri-design' })
    ]
})
```

## 局限性

> 这里记录已知的局限定和对应的解决方案

1. `element-ui` 的 `<Progress>` 组件依赖 `<Icon>` 组件的样式, 这个工具并未去引用它. 需要额外注册 `<Icon />` 组件。这一行为可以放在`main.ts`中进行.

## QA

1.  适用范围

    -   假设你使用的组件库在迁移到 vite 前使用的`babel-plugin-import`, 那么你迁移到这个插件应该很容易. 这个库的配置方式, 是参考 `babel-plugin-import` 实现的。

    -   如果, 你使用的是自己实现的组件库, 那可以先尝试下, 如果样式导入不成功, 可以通过自定义`IStylePathFactory`来获取需要导入的样式.

    -   受我目前的项目类型影响, 我仅测试了如下文件的按需引用能力. `.vue` (包括: vue2, vue3), `.ts(x)`, `.js(x)`, 如果发现问题, 可以向我提 issues 反馈

2.  babel-plugin-import

    这个项目就是仿照 babel-plugin-import 实现的, 目的是希望原有使用 @vue/cli-service 构建的库能够平滑过渡到 vite

3.  为什么有了 `unplugin-auto-import` + `unplugin-vue-component` 方案, 还要再创建这个插件

    在这个插件创建之前, 我从`element-plus` 了解到 `unplugin-auto-import` + `unplugin-vue-component` 这套方案。他的机制时, 扫描使用的组件名, 如`<template>`中的组件, 让 resolver 根据组件名, 去匹配相关内容. 这套机制放在规范标准的库下面没有什么问题, 如:`antdv`, `element` 等， 这些组件库会为自己的组件增加命名前缀。但是, 一些小的组件库(比如我们团队的`meri-design`), 他的命名规范没有那么标准(没有命名前缀, 如:`<Button>`,`<Avatar>`这样 😂), 就比较难受了。

    另外, `unplugin-auto-import` + `unplugin-vue-component` 方案, 聚合了太多冗余的能力, 如: `动态的dts配置`, 我不太喜欢他把 dts 文件生成到项目根目录下的行为, 然后就搞了一个这个库~
