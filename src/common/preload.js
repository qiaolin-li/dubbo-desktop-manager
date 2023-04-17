// 在上下文隔离启用的情况下使用预加载
const { contextBridge, ipcRenderer } = require('electron')
const remote = require('@electron/remote');

console.log("来了来了", remote);

contextBridge.exposeInMainWorld('myAPI', {
  clipboard: remote.clipboard,
  remote, 
  on: ipcRenderer.on
})

contextBridge.exposeInMainWorld("require", require);

console.log("走了走了", ipcRenderer.on);