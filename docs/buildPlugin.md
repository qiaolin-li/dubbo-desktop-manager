

🤫🤫🤫🤫 由于精力有限，插件开发这个目前就随便写写，可以参考 `@ddm-center/plugin-api` 这个包来看宿主能力

也可以参考 [Dubbo Support](https://github.com/ddm-plugin/ddm-plugin-dubbo-support) 这个插件 



### 平台环境

- **Electron**：`25.9.x`
- **nodejs**：`18.x`
- **Chromium**：`114`
- **vuejs**：`2.6.x`
- **Element-UI**：`2.15.x`

系统架构基于 `Electron25` + `Vue2` + `Element-UI`，所以你可以很轻松的使用它来开发出想要的插件。



### 创建插件项目

你可以通过脚手架快捷创建一个插件工程，见：https://www.npmjs.com/package/@ddm-center/create-plugin

```
npm create @ddm-center/plugin my-plugin
```

如果插件名没有 `ddm-plugin-` 前缀，脚手架会自动补齐。例如 `my-plugin` 会生成 `ddm-plugin-my-plugin`。

**生成目录**

```js
ddm-plugin-my-plugin/
    src/main/index.js									  // 主进程入口
    src/renderer/index.js								// 渲染进程入口
    src/renderer/views/Settings.vue
    src/i18n/index.js										// 国际化入口，主进程和渲染进程都会加载它
    package.json												// 插件包信息
    jsconfig.json	
    webpack.config.js
```

**入口约定**

生成的插件包含三个入口：

- `main`：主进程入口，默认输出 `dist/main.js`。
- `rendererMain`：渲染进程入口，默认输出 `dist/renderer.js`。
- `i18nMain`：国际化入口，默认输出 `dist/i18n.js`。

`package.json` 中会自动写入：

```
{
    "main": "dist/main.js",
    "rendererMain": "dist/renderer.js",
    "i18nMain": "dist/i18n.js"
}
```



### 插件API

#### 主进程

​	运行环境 `nodejs 18` 、暴露服务（供渲染进程使用，配合 api 像调用本地方法）



#### 渲染进程能力

- **项目相关**：注册项目配置组件、注册项目页面、注册插件设置页
- **入口相关**： `ToolbarMenu` 、`StatusBar`
- **其他**： 引用主进程服务、打开 Dialog、`Notify`、配置相关操作、消息总线、插件语言包解析、右键菜单、复制、导出等
- **公共组件**：Element-UI全部组件、页面管理、JSON 编辑器（支持过滤和对比）、Telnet 终端



#### 主进程&渲染进程共享能力

- **国际化资源（i18n）**

