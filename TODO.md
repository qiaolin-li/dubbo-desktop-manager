本文档用于记录需要做的事，防止忘记。


# 本期需要做的
1. 搞懂到底需要不要修正json, 文件: src\common\utils\JSONUtils.js 
```js
// 是不规范的json, 给有些字段或者值加上 ""
// TODO 2026年3月12日14:44:19，不知道当时写这个代码是因为什么场景，暂时注释掉，如果有需要再放开
// registryFormater((data) => {
//     data = data.replace(/(?:\s*['"]*)?([a-zA-Z0-9]+)(?:['"]*\s*)?:/g, "\"$1\":");
//     return formatJsonString(data);
//})
```
2. JSON 编辑器的撤销功能坏了   已完成
3. 看基础组件的代码，看看是否能够满足插件的需求，并且足够优雅
   3.1. collapse
   3.2. tree
   3.3. json-editer
   3.4. icon-button、icon-group、icon
   3.5. simple-dialog

4. 统一 app-page和tab的id主键问题，应该要使用同一种方式来确定主键
5. 在未确定解决安全问题之前，插件商店只能搜到安全的插件列表
6. 尝试不规则JSON，比如说java的 Map<Integer, String> 


# 未来需要做的
1. 优化图标方案，参考：iconpark、https://icones.js.org/collection/ri、https://remixicon.com/
3. 升级 vue3 + ts 
4. 优化 collapse 组件，如果子面板后面有展开的兄弟面板，并且当前子面板是关闭状态时，要求也可以拖动，但是影响的是后面打开最近的那个兄弟面板
5. 参考这个实现一个json参数可视化编辑功能， https://www.tianapi.com/json/
6. 升级到 better-sqlite3


