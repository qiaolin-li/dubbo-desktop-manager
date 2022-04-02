
<h1 align="center">
  <img src="https://github.com/qiaolin-li/dubbo-desktop-manager/blob/master/build/icons/icon.png" alt="Dubbo-Desktop-Manager" width="200">
  <br>Dubbo-Desktop-Manager<br>
</h1>

<h4 align="center">一个Dubbo的桌面管理软件</h4>
<p align="center">
  <a href="https://github.com/qiaolin-li/dubbo-desktop-manager/releases/download/v1.0.0/Dubbo-Desktop-Manager-Setup-1.0.0.exe">Windows下载</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/qiaolin-li/dubbo-desktop-manager/releases/download/v1.0.0/Dubbo-Desktop-Manager-1.0.0.dmg">Mac Intel 芯片下载</a>
    &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/qiaolin-li/dubbo-desktop-manager/releases/download/v1.0.0/Dubbo-Desktop-Manager-1.0.0-arm64.dmg">Mac M1 芯片下载</a>
</p>

## 一、功能简介
- 支持多注册中心， zookeeper和nacos
- 支持服务名（接口名）搜索
- 可查看服务下所有的提供者和消费者
- 可调用服务提供者的方法
- 生成提供者方法的默认参数（参考dubbo-admin）
- 支持方法历史参数填充
- 支持生成invoke 命令
- 支持telnet直接连接到提供者

### 1.1、支持多注册中心
<img width="1200" alt="image" src="https://user-images.githubusercontent.com/32925394/156886911-c11fc055-b79a-43a2-acb5-30dcd3ae69bf.png">

### 1.3、服务搜索&查看服务下提供者和消费者
<img width="1200" alt="image" src="https://user-images.githubusercontent.com/32925394/156887094-2929b831-ec47-46ab-af74-8cbcc7e2619f.png">


### 1.4、生成提供者方法的默认参数&调用提供者方法
<img width="1200" alt="image" src="https://user-images.githubusercontent.com/32925394/156887141-c1a1200e-322d-4522-8eb6-6960a237d843.png">


### 1.4、直接telnet提供者
<img width="1200" alt="image" src="https://user-images.githubusercontent.com/32925394/156887160-157decab-b21c-44be-8240-17eb2ec85df8.png">


## 二、技术架构
NodeJs + Electron + vue + element-UI + Axios + neDB + zookeeper-client 

使用vue-electron的脚手架构建：https://nklayman.github.io/vue-cli-plugin-electron-builder/

代码展示：https://codemirror.net/

本地数据库 neDB：https://www.w3cschool.cn/nedbintro/nedbintro-x3jk27ml.html

## 三、如何构建它？
### 3.1、安装依赖
千万不要使用npm安装，可能会出错，一定要使用yarn安装
```
yarn install
```

### 3.2、运行
```
yarn electron:serve
```

### 3.3、构建应用
```
yarn electron:build
```

## 四、致谢
感谢 MARKSZのBlog 大佬Electron系列博客，让我少走了很多弯路
博客地址：https://molunerfinn.com/electron-vue-1/#Electron%E7%AE%80%E8%A6%81%E4%BB%8B%E7%BB%8D

终端参考自：https://www.codeprj.com/blog/c9bde01.html

分隔栏参考自：https://github.com/NebulaStudio/vue-split-pane
