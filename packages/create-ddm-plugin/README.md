# @ddm-center/create-plugin

`@ddm-center/create-plugin` 是 Dubbo Desktop Manager 的插件工程脚手架。

它只创建一种推荐工程形态：`renderer + main` mixed 插件。单独 renderer 或单独 main 的插件可以在生成后自行删除不需要的入口。

## 创建 JavaScript 插件

```bash
npm create @ddm-center/plugin my-plugin
```

也可以显式指定 JavaScript：

```bash
npm create @ddm-center/plugin my-plugin -- --js
```

如果插件名没有 `ddm-plugin-` 前缀，脚手架会自动补齐。例如 `my-plugin` 会生成 `ddm-plugin-my-plugin`。

## 生成目录

```text
ddm-plugin-my-plugin/
    src/main/index.js
    src/renderer/index.js
    src/renderer/views/Settings.vue
    src/i18n/index.js
    package.json
    jsconfig.json
    webpack.config.js
```

## 常用命令

```bash
npm install
npm run build
```

## 入口约定

生成的插件包含三个入口：

- `main`：主进程入口，默认输出 `dist/main.js`。
- `rendererMain`：渲染进程入口，默认输出 `dist/renderer.js`。
- `i18nMain`：国际化入口，默认输出 `dist/i18n.js`。

`package.json` 中会自动写入：

```json
{
    "main": "dist/main.js",
    "rendererMain": "dist/renderer.js",
    "i18nMain": "dist/i18n.js"
}
```

## 类型提示

生成的插件默认依赖：

```json
{
    "devDependencies": {
        "@ddm-center/plugin-api": "^0.0.1"
    }
}
```

`@ddm-center/plugin-api` 提供 `appMain`、`appView`、`MainEntry`、`RendererEntry` 等类型提示。运行时对象仍由 DDM 宿主注入。

## 参数

- `--js`：创建 JavaScript mixed 插件。
- `--language=js`：等同于 `--js`。
- `--force`：目标目录不为空时仍然写入。

当前脚手架暂不支持创建 TypeScript 工程。
