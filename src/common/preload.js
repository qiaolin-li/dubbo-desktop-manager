// 在上下文隔离启用的情况下使用预加载
const { contextBridge, ipcRenderer } = require('electron')
const remote = require('@electron/remote');


contextBridge.exposeInMainWorld('myAPI', {
  clipboard: remote.clipboard,
  remote, 
  on: ipcRenderer.on
})

contextBridge.exposeInMainWorld("require", require);