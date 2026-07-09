# @ddm-center/plugin-api

`@ddm-center/plugin-api` 是 Dubbo Desktop Manager 插件开发的类型声明包。

它只提供类型和宿主注入模块声明，不包含 DDM 宿主运行时实现。插件运行时仍由 DDM 注入 `appMain`、`appView` 等模块。

## 安装

```bash
npm install -D @ddm-center/plugin-api
```

## 主进程入口

主进程插件入口通常对应 `package.json` 的 `main` 字段。

```ts
import type { MainEntry } from '@ddm-center/plugin-api';
import appMain            from 'appMain';

const entry: MainEntry = () => ({
    async install() {
        appMain.exportPluginService('helloService', {
            sayHello(name?: string) {
                return `Hello ${name || 'DDM'}`;
            },
        });
    },
});

export default entry;
```

## 渲染进程入口

渲染进程插件入口通常对应 `package.json` 的 `rendererMain` 字段。

```ts
import type { RendererEntry } from '@ddm-center/plugin-api';
import appView                from 'appView';

const entry: RendererEntry = () => ({
    async install() {
        const service = appView.referenceService<{ sayHello(name?: string): Promise<string> }>('helloService');
        const message = await service.sayHello('Plugin');

        appView.notify({
            title: 'Plugin',
            body: message,
        });
    },
});

export default entry;
```

## 虚拟模块

这个包声明了两个由宿主注入的虚拟模块：

- `appMain`：主进程插件宿主对象。
- `appView`：渲染进程插件宿主对象。

插件构建配置需要把它们作为 external 处理，不要把宿主实现打进插件产物。

## TypeScript 配置

```json
{
    "compilerOptions": {
        "moduleResolution": "node",
        "baseUrl": ".",
        "paths": {
            "appMain": ["node_modules/@ddm-center/plugin-api/appMain.d.ts"],
            "appView": ["node_modules/@ddm-center/plugin-api/appView.d.ts"]
        },
        "types": ["@ddm-center/plugin-api"]
    }
}
```

## 导出的主要类型

- `MainEntry`：主进程入口函数类型。
- `MainPlugin`：主进程宿主对象类型。
- `RendererEntry`：渲染进程入口函数类型。
- `RendererPlugin`：渲染进程宿主对象类型。
- `PluginInstallable`：插件入口返回的安装对象。
- `I18nRegistrar`：插件语言包注册器。
- `VueComponent`：Vue 2 组件类型。
