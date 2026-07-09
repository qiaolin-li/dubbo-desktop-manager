# Statusbar Codex Handoff

## 目标

当前这轮开发是在整理底部状态栏扩展能力，目标是：

- 让状态栏走统一的 `createStatusbarItem(...)` 模型
- 用 `app-status-bar-item.vue` 作为单个状态栏项的宿主组件
- 支持：
  - `icon`
  - `text`
  - `tooltip`
  - `command`
  - `popover = { component, props }`
- 让插件侧能通过 `item.popover.component` 传自己的 Vue 组件


## 当前实现

### 1. 状态对象

文件：

- `src/renderer/layout/statusbar/AppStatusbarItem.js`

说明：

- `AppStatusbarItem` 已经从 `AppRenderer.js` 抽成单独的 JS 文件
- 负责维护状态栏项的运行时状态：
  - `icon`
  - `text`
  - `tooltip`
  - `command`
  - `warning`
  - `disabled`
  - `visible`
  - `popover`
- 还提供：
  - `show()`
  - `hide()`
  - `dispose()`
- setter 内部会调用 `appRendererCore.syncStatusbarItems()`


### 2. 状态栏项组件

文件：

- `src/renderer/layout/statusbar/app-status-bar-item.vue`

说明：

- 现在只接收一个 `item` prop
- 不再拆 `text/icon/tooltip/command/...` 单独传
- 组件内部直接使用：
  - `item.icon`
  - `item.text`
  - `item.tooltip`
  - `item.command`
  - `item.warning`
  - `item.disabled`
  - `item.popover`
- `popover` 目前通过 `el-popover` 实现
- 行为是：
  - hover 有 `popover` 时打开
  - click 有 `popover` 时也打开
  - click 同时会执行 `item.command`


### 3. 状态栏宿主

文件：

- `src/renderer/layout/AppStatusbar.vue`

说明：

- 左右两侧都改成：
  - `v-for="item in ..."`
  - `<app-status-bar-item :item="item.item" />`
- 不再把 `text/icon/tooltip/...` 一项项拆出来传

当前内置项仍然通过 `syncBuiltinStatusbarItems()` 手动灌值：

- `appUpdate`
- `pluginUpdate`
- `checkUpdate`
- `version`

大致字段：

- `appUpdate.icon = 'upload2'`
- `pluginUpdate.icon = 'box'`
- `checkUpdate.icon = checking ? 'loading' : 'refresh'`
- `version.icon = ''`


### 4. AppRenderer 与插件入口

文件：

- `src/renderer/core/AppRenderer.js`
- `src/renderer/core/plugin/AppRendenerPlugin.js`

说明：

- `AppRenderer` 已注册 `app-status-bar-item` 组件
- `createStatusbarItem(id, alignment, priority)` 已存在
- `AppRenderer` 内部会把状态项同步到 `layoutStore.statusbarItems`
- 插件侧 `createStatusbarItem(...)` 已经返回包装对象
- 插件给 `item.popover = { component, props }` 赋值时，会自动对 `component` 做 `wrapComponent()`


## 当前文档

文件：

- `docs/plugin/渲染端API.md`

已经补了基础示例：

```js
const item = appRenderer.createStatusbarItem('my-plugin-status', 'right', 20);
item.icon = 'link';
item.text = 'Ready';
item.tooltip = 'Plugin Ready';
item.command = () => console.log('clicked');
item.popover = {
    component: MyStatusPopover,
    props: {
        title: 'Plugin Ready',
    }
};
item.show();
```


## 已经确认想继续收薄的点

用户明确觉得现在这块仍然偏复杂，主要不满意点：

1. `app-status-bar-item` 不该做太多额外解析
2. 这块本质上只是：
   - 一个按钮
   - 一个图标
   - 一段文本
   - 一个 `el-popover`
3. 需要继续把状态栏逻辑收简单、收清晰


## 下一步建议

### 优先级最高

1. 继续收薄 `AppStatusbar.vue`
   - 现在 `syncBuiltinStatusbarItems()` 仍然比较重
   - 可以考虑把内置状态栏项初始化配置再整理一下

2. 检查 `app-status-bar-item.vue` 是否还需要进一步收口
   - 当前已经只接 `item`
   - 但 hover/click + `el-popover` 行为还可以继续斟酌

3. 在另一台机器上先让 Codex读这几个文件：
   - `src/renderer/layout/statusbar/AppStatusbarItem.js`
   - `src/renderer/layout/statusbar/app-status-bar-item.vue`
   - `src/renderer/layout/AppStatusbar.vue`
   - `src/renderer/core/AppRenderer.js`
   - `src/renderer/core/plugin/AppRendenerPlugin.js`


### 可选优化

1. 为 `popover` 再补一个最小示例组件
   - 方便验证插件弹层能否正常显示

2. 再补一轮文档
   - 明确 `item` 会自动传给 popover component

3. 清理命名/注释
   - 让“状态对象”、“宿主组件”、“宿主布局”三层职责更明显


## 校验情况

- 这轮做过 `git diff --check`
- 没有 patch/空白格式问题
- 完整 `npm run lint` 之前被仓库自身 ESLint `prettier` 配置缺失挡住，不是这块状态栏逻辑单独导致的


## 直接给下一台 Codex 的一句话

请继续整理 `dubbo-desktop-manager` 的底部状态栏实现，重点关注：

- `createStatusbarItem(...)`
- `AppStatusbarItem.js`
- `app-status-bar-item.vue`
- `AppStatusbar.vue`

目标是继续把这套状态栏实现收薄，让它更像“一个简单按钮 + 图标 + 文本 + el-popover”，减少不必要的中间层和手动同步样板代码。
