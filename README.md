# vite-plugin-necessary-import

> vite 按需引用插件, 使用此插件能够以最小的改动, 为组件库提供 vite 按需引用支持

## 特性

-   api 设计参考 `babel-plugin-import`, 可以从`@vue/cli-service`脚手架上快速移植
-   与组件库弱相关, 按需引用特性不需要组件库指定特定的目录规范或实现 `resolver`

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
        necessaryImport({ library: 'meri-design' }),
        // 其他
        necessaryImport({ library: '<组件库的 name>' })
    ]
})
```

-   options

| option       | type                         | required | desc                                                   | default                      |
| ------------ | ---------------------------- | -------- | ------------------------------------------------------ | ---------------------------- |
| library      | string                       | ✔        | 需要按需引用的库名                                     |                              |
| include      | FilterPattern                |          | 扫描文件目录 (见源码注释)                              |                              |
| exclude      | FilterPattern                |          | 排除文件目录                                           | []                           |
| extension    | `Array<IStyleType>`          |          | 样式文件类型(扩展名)                                   | ['css','less','scss','sass'] |
| styleDir     | `string / IStylePathFactory` |          | 样式文件扫描目录(支持自定义, 为空时扫描库下面所有文件) | '/'                          |
| noComponent  | `Array<string>`              |          | 哪些导入的对象不是组件(忽略样式加载)                   | []                           |
| noFoundStyle | `'warn' / 'error' / false`   |          | 样式文件检索不到时, 如何处理                           | 'warn'                       |
| logLevel     | LogLevel                     |          | 打印日志等级(用于调试)                                 | 'warn'                       |

```
# include default
# ['src/**/*.ts(x|)', 'src/**/*.js(x|)', 'src/**/*.vue']
```

## 已测试场景

-   framework

    -   `vue@2.x` : vite + @vitejs/plugin-vue2 + vue(>=2.6.11)
        -   meri-design | ✔
        -   element-ui | ✔ ([存在局限性](#局限性))
        -   vant@2.12.54 | ✔
        -   ant-design-vue@1.7.8 | ✔
    -   `vue@3.x` : vite + @vitejs/plugin-vue
    -   `react` : vite + @vitejs/plugin-react
    -   `react+swc` : vite + @vitejs/plugin-react
    -   `svelte` : vite + @vitejs/plugin-svelte

-   ui library

    -   element-ui
    -   element-plus
    -   meri-design
    -   vant
    -   ant-design-vue
    -

## 局限性

> 这里记录已知的局限定和对应的解决方案

1. 部分组件使用了公共样式注册机制(包含: 组件间样式依赖及公共样式集), 按需加载时仅加载了组件样式, 公共样式需要另外注册.
    1. 目前已知的受影响组件库
        - `element-ui`
        - `meri-plus`
    2. 处理方案
        - 在入口文件(`main.ts`) 内引入公共样式
        - 或全局注册依赖缺少的依赖组件

## RoadMap

-   vite 其他类型模板测试
    -   `react`
    -   `react+swc`
    -   `svelte`
-   现有问题处理
    -   `element-ui` 组件样式依赖问题处理
-   待确认项
    -   `动态导入组件` 的样式导入问题

## QA

1.  适用范围

    -   假设你使用的组件库在迁移到 vite 前使用的`babel-plugin-import`, 那么你迁移到这个插件应该很容易. 这个库的配置方式, 是参考 `babel-plugin-import` 实现的。

    -   如果, 你使用的是自己实现的组件库, 那可以先尝试下, 如果样式导入不成功, 可以通过自定义`IStylePathFactory`来获取需要导入的样式.

    -   受我目前的项目类型影响, 我仅测试了如下文件的按需引用能力. `.vue` (包括: vue2, vue3), `.ts(x)`, `.js(x)`, 如果发现问题, 可以向我提 issues 反馈

2.  为什么有了 `unplugin-auto-import` + `unplugin-vue-component` 方案, 还要再创建这个插件

    在这个插件创建之前, 我从`element-plus` 了解到 `unplugin-auto-import` + `unplugin-vue-component` 这套方案。他的机制时, 扫描使用的组件名, 如`<template>`中的组件, 让 resolver 根据组件名, 去匹配相关内容. 这套机制放在规范标准的库下面没有什么问题, 如:`antdv`, `element` 等， 这些组件库会为自己的组件增加命名前缀。但是, 一些小的组件库(比如我们团队的`meri-design`), 他的命名规范没有那么标准(没有命名前缀, 如:`<Button>`,`<Avatar>`这样 😂), 就比较难受了。

    另外, `unplugin-auto-import` + `unplugin-vue-component` 方案, 聚合了太多冗余的能力, 如: `动态的dts配置`, 我不太喜欢他把 dts 文件生成到项目根目录下的行为, 然后就搞了一个这个库~

```

```
