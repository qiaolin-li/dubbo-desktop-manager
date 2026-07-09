# Collapse 折叠面板组件

`collapse` / `collapse-item` 用来在侧边栏中组织一组可折叠的面板，适合服务列表、收藏夹、调用历史、插件工具区这类纵向堆叠的场景。

这组组件支持：

- 任意数量的子面板
- 自定义标题
- 自定义工具栏
- 折叠 / 展开
- 纵向拖拽调整高度


## 一、组件位置

容器组件：

`src/renderer/components/collapse/index.vue`

子项组件：

`src/renderer/components/collapse/item.vue`


## 二、基础用法

```vue
<template>
  <collapse>
    <collapse-item title="API" :collapsible="false">
      <template slot="toolbar">
        <i class="el-icon-refresh" @click="refreshApi"></i>
      </template>

      <serviceTree />
    </collapse-item>

    <collapse-item title="我的收藏" :defaultHeight="220">
      <template slot="toolbar">
        <i class="el-icon-refresh" @click="refreshCollect"></i>
      </template>

      <collectList />
    </collapse-item>

    <collapse-item title="调用历史" :defaultHeight="200" :collapsed="true">
      <historyList />
    </collapse-item>
  </collapse>
</template>

<script>
import collapse from '@/renderer/components/collapse/index.vue';
import collapseItem from '@/renderer/components/collapse/item.vue';

export default {
  components: {
    collapse,
    collapseItem,
  },
  methods: {
    refreshApi() {},
    refreshCollect() {},
  },
};
</script>
```


## 三、组件结构

### 1. `collapse`

父容器组件，只负责管理：

- 子项注册
- 折叠状态切换
- 面板高度分配
- 拖拽时的高度联动

通常只需要把多个 `collapse-item` 放进去，不需要直接操作它的内部方法。


### 2. `collapse-item`

单个子面板组件，负责：

- 展示标题
- 展示工具栏
- 承载业务内容
- 触发折叠 / 展开


## 四、`collapse-item` 属性

### `title`

- 类型：`String`
- 默认值：`''`

标题插槽未传入时使用的默认标题文本。


### `defaultHeight`

- 类型：`Number`
- 默认值：`200`

子面板默认展开高度。


### `minHeight`

- 类型：`Number`
- 默认值：`120`

拖拽调整时允许的最小高度。


### `collapsible`

- 类型：`Boolean`
- 默认值：`true`

是否允许点击头部进行折叠和展开。


### `collapsed`

- 类型：`Boolean`
- 默认值：`false`

初始是否为折叠状态。


### `headerHeight`

- 类型：`Number`
- 默认值：`22`

头部区域固定高度。


## 五、插槽

### 默认插槽

面板主体内容。

```vue
<collapse-item title="服务列表">
  <serviceTree />
</collapse-item>
```


### `title`

自定义标题区域。

```vue
<collapse-item>
  <template slot="title">
    <span>自定义标题</span>
  </template>
</collapse-item>
```


### `toolbar`

自定义右侧工具栏区域。

```vue
<collapse-item title="收藏">
  <template slot="toolbar">
    <i class="el-icon-refresh" @click="refresh"></i>
  </template>
</collapse-item>
```


## 六、事件

### `collapse-change`

当面板折叠状态发生变化时触发。

返回值：

- `true`：当前已折叠
- `false`：当前已展开

示例：

```vue
<collapse-item
  title="调用历史"
  @collapse-change="handleCollapseChange">
  <historyList />
</collapse-item>
```

```js
methods: {
  handleCollapseChange(collapsed) {
    console.log('当前折叠状态:', collapsed);
  },
}
```


## 七、交互规则

这一节很重要，插件开发者如果要把自己的面板放进来，建议先看这里。

### 1. 拖拽规则

拖动下面的面板时，优先影响它上一个已展开的面板。

具体规则：

- 向上拖下面的面板时：
  - 先占用上一个已展开面板的高度
  - 如果上一个面板已经到 `minHeight`
  - 会继续向更上方的已展开面板借空间

- 向下拖下面的面板时：
  - 当前面板释放出来的高度
  - 优先还给上一个已展开面板

这套规则的目标，是让交互更接近 VS Code 左侧活动面板的感觉。


### 2. 折叠规则

折叠一个面板时，它释放出来的空间默认优先交给上一个已展开面板。

如果上面没有已展开面板，则交给下一个已展开面板。


### 3. 展开规则

展开一个面板时，它需要的空间优先从上一个已展开面板中取得。

如果上一个面板已经缩到最小高度，则继续向更上方的已展开面板借空间。


### 4. 拖拽条显示规则

只有当前面板上方存在已展开面板时，才会显示拖拽条。

这样可以避免上方全是折叠头时，继续拖出不合理的空白区域。


## 八、推荐用法

### 1. 顶部主面板建议不可折叠

例如服务列表、资源树这类主面板，通常建议：

```vue
<collapse-item title="API" :collapsible="false">
  <serviceTree />
</collapse-item>
```

这样可以避免用户把整个主工作区折叠掉。


### 2. 次级面板建议设置默认高度

例如收藏、历史、插件辅助信息等面板：

```vue
<collapse-item title="调用历史" :defaultHeight="200" :collapsed="true">
  <historyList />
</collapse-item>
```

这样首屏更稳定，用户也更容易理解布局。


### 3. 工具按钮建议放到 `toolbar`

例如刷新、过滤、清空、定位等操作，建议统一放在 `toolbar` 插槽中。

这样标题和工具区域的布局会更一致。


## 九、在插件中使用

如果插件扩展的是渲染端页面，可以直接在 Vue 页面里引入这两个组件：

```js
import collapse from '@/renderer/components/collapse/index.vue';
import collapseItem from '@/renderer/components/collapse/item.vue';
```

然后注册到当前页面组件：

```js
export default {
  components: {
    collapse,
    collapseItem,
  },
};
```


## 十、注意事项

1. `collapse-item` 必须作为 `collapse` 的直接子项使用。
2. 面板高度是纵向布局语义，所以请使用 `defaultHeight` / `minHeight`，不要把它理解成宽度。
3. 如果子内容本身也有滚动区域，建议内容组件内部自己处理滚动，不要在外层额外套多层高度不确定的容器。
4. 如果某个插件面板内容非常复杂，建议给它设置一个合理的 `minHeight`，避免拖拽时压缩到不可用。


## 十一、一个完整示例

```vue
<collapse>
  <collapse-item title="服务列表" :collapsible="false">
    <template slot="toolbar">
      <i class="el-icon-refresh" @click="refreshService"></i>
    </template>
    <serviceTree />
  </collapse-item>

  <collapse-item title="收藏" :defaultHeight="220">
    <template slot="toolbar">
      <i class="el-icon-star-off" @click="clearCollect"></i>
    </template>
    <collectList />
  </collapse-item>

  <collapse-item title="历史记录" :defaultHeight="200" :collapsed="true">
    <historyList />
  </collapse-item>
</collapse>
```


## 十二、当前实现说明

当前实现使用的是：

- 父组件统一管理子项注册
- 子项通过 `provide / inject` 接入父组件
- 高度分为“期望高度”和“实际渲染高度”
- 折叠、展开、拖拽都由父组件统一分配

如果未来需要增加：

- 手风琴模式
- 指定主面板
- `v-model` 控制展开项
- 高度持久化

可以继续在当前实现上扩展。
