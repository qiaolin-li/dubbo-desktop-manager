

数据源：

registerDataSource (type,  dataSource) 



i18n国际化

registryPluginLocal  (locale, message) 

插件可以注册自己的语言包，支持多语言，注册的key默认会加上 `pluginLocale.${pluginId}.`前缀，防止和系统语言包冲突



 pluginT(key,  ....) 

插件可以使用该方法获取自己设置的语言包

 

t(key,  ....)

如果插件需要获取系统的语言包，那么需要使用t方法



暴露服务提供者

registry(name, target) 

注册服务提供者，注册了可以在渲染进程访问他的属性和方法。



通知

notify(data)

   