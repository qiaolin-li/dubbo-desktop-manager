

# 渲染端API

注册Vue组件

component(name, component)



### 数据源信息编辑组件

```js
/**
 * 注册一个数据源信息编辑组件
 * @param { string } type 数据源类型
 * @param { VueComponent } component Vue组件
 * @param { object} options 选项，
 *	options = {
 *		label: ""     // 展示的标题
 *	}
 */
registryDataSourceUpdateComponent(type, component, options);


// 注册一个数据源信息编辑组件
import Zookeeper                  from "@/renderer/views/edit/Zookeeper.vue";
appRenderer.registryDataSourceUpdateComponent("zookeeper", Zookeeper, { label: "Zookeeper" });


```



### 服务管理页面

```js
/**
 * 注册服务管理组件
 * @param {*} serviceType 服务类型
 * @param {*} component 组件
 * @param {*} options 配置选项
 */
registryServicePageComponent(serviceType, component, options) {
        
// 注册服务管理组件
import dubboPage                  from '@/renderer/views/dubbo/index.vue';
appRenderer.registryServicePageComponent('dubbo', dubboPage);
```



### 服务调用页面

```js
/**
 * 注册服务调用组件
 * @param {*} serviceType  服务类型
 * @param {*} component  组件
 * @param {*} options  配置选项
 */
registryServicInvokeComponent(serviceType, component, options) {
    
// 注册服务调用组件，方便直接打开调用页面    
import dubboInvoke                from "@/renderer/views/dubbo/dubbo-invoke.vue";
appRenderer.registryServicInvokeComponent('dubbo', dubboInvoke);
```





###  插件配置组件

```js
/**
 * 注册一个设置组件，方便用户配置
 * @param {*} label 设置的标题
 * @param {*} component vue组件
 * @param {*} options 选项
 *	options = {
 *		label: ""     // 展示的标题
 *	}
 */
registrySettingComponent(label, component, options) {

// 注册组件配置页面
import settings                   from '@/renderer/views/settings/index.vue';
appRenderer.registrySettingComponent("Dubbo Settings", settings, {});
```







## 配置

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



## 菜单

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





## 动作

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



## 事件

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

