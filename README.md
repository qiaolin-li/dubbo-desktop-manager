<h1 align="center">
  <img src="./build/icons/icon.png" alt="Dubbo-Desktop-Manager" width="200">
  <br>Dubbo-Desktop-Manager<br>
</h1>
 <h4 align="center">一个Dubbo的桌面管理软件</h4>

<p align="center">
  <a href="../../releases">Windows下载</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/qiaolin-li/dubbo-desktop-manager/releases">Mac Intel 芯片下载</a>
    &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/qiaolin-li/dubbo-desktop-manager/releases">Mac M1 芯片下载</a>
</p>

## 一、功能简介
- 支持多注册中心（ zookeeper、nacos、dubbo-admin或dubbo-admin相同协议的服务）
- 支持多数据源同时管理
- 支持服务搜索、服务收藏、调用历史、服务提供者和消费者展示、 服务启用、禁用、配置编辑
- 支持服务调用（目前已支持dubbo、http等协议，如有需要可提）、快捷生成`invoke`命令、支持方法填充（历史参数、默认参数）
- 支持telnet直接连接到提供者


## 二、功能截图
![](./docs/images/20243333.gif)
![](./docs/images/202411111.gif)
![](./docs/images/20242222.gif)


## 三、如何自己构建DDM
[>>> 点我获得构建DDM的教程](./docs/build.md)

## 四、参考资料
因为下面这些框架、博客才有这个工具的诞生

首先感谢 MARKSZのBlog 大佬Electron系列博客，大而全，给了我很多参考的地方，也从里面CV了部分代码
博客地址：https://molunerfinn.com/electron-vue-1/#Electron%E7%AE%80%E8%A6%81%E4%BB%8B%E7%BB%8D

终端参考自：https://www.codeprj.com/blog/c9bde01.html

分隔栏参考自：https://github.com/PanJiaChen/vue-split-pane
