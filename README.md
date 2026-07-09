

<h1 align="center">
  <img src="./build/icons/icon.png" alt="Dubbo-Desktop-Manager" width="200">
  <br>Dubbo-Desktop-Manager<br>
</h1>
 <h4 align="center">开源、跨平台，让桌面应用拥有无限可能。</h4>

<p align="center">
  <a href="../../releases">Windows下载</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="../../releases">Mac 下载</a>
   &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="../../releases">Linux (自助编译)</a>
</p>
## 一、简介
一个开源、跨平台的桌面应用平台，通过开放的插件生态，让能力自由生长。

提供插件运行环境，开发者可以通过插件自由扩展平台能力。

> 当前版本内置 Dubbo Support 插件提供Dubbo管理能力，方便开发者在本地桌面端完成日常服务排查与调试工作。

- **项目管理**：支持创建项目、编辑项目、删除项目，打开项目页面
- **插件管理**：插件商店、已安装插件、本地开发插件管理，支持插件安装、卸载、加载、插件推荐等。
- **个性化设置**：支持语言、主题、界面字体、Java 运行环境、JVM 参数等基础配置。
- **插件扩展体系**：扩展项目、工具栏、状态栏、右键菜单、国际化资源。

<img src="./docs/images/home.png" alt="主页" />

![](./docs/images/pluginPage.png)

![](./docs/images/dubboProjectPage.png)

## 二、下载应用

[Windows下载](../../releases) | [Mac下载](../../releases)

由于设备有限，目前只构建了 `Windows` 和 `MacOS` 平台的包，`Linux` 和其他平台需要自行构建

[>>> 点我获得构建DDM的教程](./docs/build.md)



## 三、官方推荐插件

以下为推荐的插件列表，如果你开发了一个插件也可以提交 Issue 来加入它。

| 插件ID        | 插件说明          | 官方 | 推荐 | 内置 | 状态   |
| ------------- | ----------------- | ---- | ---- | ---- | ------ |
| dubbo-support | 支持dubbo接口管理 | ✅    | ✅    | ✅    | 已发布 |


插件市场持续完善中，目前默认仅展示官方推荐插件。
> 当然有胆子大的用户，非要安装未知插件，那么你可以开启开发模式，即可搜索到完整的插件列表，但是用户需自行判断插件是否安装。
>
> 开启开发模式：点击 设置 ==> 高级 ==> 开发者模式 ==> 保存 ==> 重启

[插件开发文档](./docs/buildPlugin.md)



## 四、FAQ

### 4.1、Mac出现：已损坏，无法打开
那是因为没给果子交保护费，需要打开终端执行如下命令
```bash
sudo xattr -d com.apple.quarantine /Applications/Dubbo-Desktop-Manager.app
```

### 4.2、如何配置 JDK17+
使用 JDK 17+ 需要配置如下 JVM 参数
```bash
 --add-opens java.management/java.lang.management=ALL-UNNAMED --add-opens jdk.management/com.sun.management.internal=ALL-UNNAMED --add-opens java.management/sun.management=ALL-UNNAMED --add-opens java.base/java.time=ALL-UNNAMED --add-opens java.base/java.util.concurrent=ALL-UNNAMED --add-opens java.base/java.util.concurrent.locks=ALL-UNNAMED --add-opens java.base/java.security=ALL-UNNAMED --add-opens java.base/jdk.internal.loader=ALL-UNNAMED --add-opens java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED --add-opens java.base/java.net=ALL-UNNAMED --add-opens java.base/sun.nio.ch=ALL-UNNAMED --add-exports java.base/sun.security.action=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.math=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.text=ALL-UNNAMED --add-opens java.base/sun.util.calendar=ALL-UNNAMED
```
![image](./docs/images/jdkParams.png)

## 五、参考资料
因为下面这些框架、博客才有这个工具的诞生

首先感谢 `PicGo` 作者 MARKSZのBlog 大佬，他的[Electron系列博客](https://molunerfinn.com/electron-vue-1/#Electron%E7%AE%80%E8%A6%81%E4%BB%8B%E7%BB%8D)，大而全，给了我很多参考的地方，也从里面CV了部分代码

插件模块参考：[PicGo](https://github.com/Molunerfinn/PicGo)、[Rubick](https://github.com/rubickCenter/rubick)

终端：https://www.codeprj.com/blog/c9bde01.html

分隔栏：https://github.com/PanJiaChen/vue-split-pane

JSON编辑器：仓库地址：https://github.com/loggerhead/json4u

NodeJs 调用 Java：https://gitee.com/robergroup/pdmaner

## 支持项目
如果本工具对你有帮助，欢迎通过小额打赏支持这个开源项目的持续维护与改进。
![](./src/renderer/assets/donate.png)
