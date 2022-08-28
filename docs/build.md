# 如何自己构建它？

# 一、技术架构

NodeJs + Electron + vue + element-UI + Axios + neDB + zookeeper-client 

使用vue-electron的脚手架构建：https://nklayman.github.io/vue-cli-plugin-electron-builder/

代码展示：https://codemirror.net/

本地数据库 neDB：https://www.w3cschool.cn/nedbintro/nedbintro-x3jk27ml.html



# 二、构建

千万不要使用npm安装，可能会出错，一定要使用yarn安装

###  1、安装依赖

```
yarn install
```

### 2、运行

```
yarn electron:serve
```

### 3、构建应用

```
yarn dev
```
