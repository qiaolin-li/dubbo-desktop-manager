



注册Vue组件

component(name, component)



配置：

操作插件配置API

```javascript
$setPluginConfig(key, value) 
设置一个配置

$hasPluginConfig(key)
是否存在某个配置

$getPluginConfig(key) 
获取配置

$getPluginConfigs() 
获取当前插件所有配置
```



如果你想让用户可以设置参数，你可以使用 `addPluginSettingComponent(componentInfo)` 方法来设置面板

```javascript
# 向ddm平台注册一个设置组件，当用户打开设置页面时会将其渲染
appRendererCore.addPluginSettingComponent({
    name: "Dubbo Settings",
    componentName: 'dubbo-settings',
});
```





菜单：

增加左侧边栏菜单

```js
addMenu(location = 'top', menu) 

menu =  {
    label: i18n.t("menu.settings"),      //  名称
    icon: "el-icon-setting",			 //  图标
    componentName: "settings",			 //  需要打开的组件
    ready(mananger, self) {				 //  初始化逻辑
        ipcRenderer.on('openSettingsTabEvent', () => mananger.switchMenu(self));
    }
},
```



普通菜单：

普通菜单是为了插件扩展现有能力开放的，他可以嵌入现有能力，如扩展服务列表菜单、服务收藏菜单、历史调用记录菜单等...



TODO 这里需要补上图说明



```javascript menuConfig = {
addPluginMenu(menuConfig) 

menuConfig 字段如下：
*  id, 唯一ID，可不填
*  group,  菜单放到哪个分组下，可不填 
*  relativeMenu, 当前菜单放到哪个相对于哪个菜单的位置，可不填
*  anchor,  放到哪个位置，可不填，取值为：first、last、before、after，存在relativeMenu时 fisrt、last才会生效
*  menuInfo， 菜单信息（electron原生菜单）
*  }
```



i18n国际化

registryPluginLocal  (locale, message) 

插件可以注册自己的语言包，支持多语言，注册的key默认会加上 `pluginLocale.${pluginId}.`前缀，防止和系统语言包冲突



 $pluginT(key,  ....) 

插件可以使用该方法获取自己设置的语言包

 

$t(key,  ....)

如果插件需要获取系统的语言包，那么需要使用t方法







事件

on(event, callback)

once( event, callback ) 

off(event, callback) 

emit(event, ...args)







Vue.prototype.$remote = remote

Vue.prototype.$appConfig = appConfig

Vue.prototype.$dataSource = dataSource

Vue.prototype.$invokeHisotryRecord = invokeHisotryRecord

Vue.prototype.$excelExportUtils = excelExportUtils

Vue.prototype.$loading = loading

Vue.prototype.$appRenderer = this;



复制/粘贴

```js
# 将内容复制到剪贴板
$writeClipboard(text)
```

