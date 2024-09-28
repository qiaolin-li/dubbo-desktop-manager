# 服务端API

## 数据源

registerDataSource (type,  dataSource) 



## 服务暴露


暴露服务提供者，暴露的服务可以供渲染进程调用。

registry(name, target) 

注册服务提供者，注册了可以在渲染进程访问他的属性和方法。



## 通知

notify(data)



## 数据源提供者

```js
{
    // datasource: 数据源信息
    // keyword：用户输入的关键字，如果是数据源提供者配置 realTimeSearch = true，则false永远为空
    getServiceList: (datasource, keyword) =>{
        return {
            list: [{
                // 服务全类名
                serviceName: "indi.qiaolin.TestFacade" ,
                // 服务唯一标识, 如果不提供这个字段，将会使用 serviceName
                uniqueServiceName: "indi.qiaolin.TestFacade:1.0.0",
                // 服务类型
             	serviceType: "dubbo",   
            }],
      		separator: '.',   			// 如何将你的serviceName分割成树，
      		packageSeparator: '.'		// 分割出来的包合并时的分隔符
        }
    }

    // invocation = {
    // 		methodInfo: 方法信息
    // 		params: 调用的参数
    // 		invokerType: telnet、java、或者为空，
	// }
    invokeMethod(datasource, service, provder, invocation){

    }

    // 这里还可以扩展自己服务需要的方法, 以Dubbo为例有如下方法：获取提供者、获取消费者、启用提供者、禁用提供者....
    
}

```

