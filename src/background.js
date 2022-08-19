'use strict'

import { app, protocol, BrowserWindow, Menu, MenuItem, globalShortcut, ipcMain, dialog, session } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')
import updateChecker from './utils/updateChecker.js';
import template from "./main/menuList.js";
import communication from "@/main/communication/index.js";
import connectRepository from "@/main/repository/connectRepository.js";
import invokeHisotryRecord from "@/main/repository/invokeHistoryRepository.js";
import appConfig from "@/main/repository/appConfig.js";
import {setWindow} from '@/main/holder/WindowHolder.js';
import invoke from "@/main/invoker/index.js";
import registry from "@/main/registry/index.js";
connectRepository.install(communication)
invokeHisotryRecord.install(communication)
invoke.install(communication)
appConfig.install(communication)
registry.install(communication)

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let init = false;

let window = null;
async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Dubbo-Desktop-Manager",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    }
  })

  window = win;
  setWindow(win);
  // win.webContents.openDevTools()
  const remote = require('@electron/remote/main');
  if (!init) {
    remote.initialize()
    init = true;
  }
  remote.enable(win.webContents);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

const menu = new Menu()
menu.append(new MenuItem({
  label: 'DDM',
  submenu: [{
    role: 'help',
    accelerator: process.platform === 'darwin' ? 'Cmd+F' : 'Alt+Shift+I',
    click: () => {
      dialog.showMessageBox({
        type: 'info',
        message: '成功!',
        detail: '你按下了一个全局注册的快捷键绑定.',
        buttons: ['好的']
      })
    }
  }]
}))

Menu.setApplicationMenu(menu)
Menu.setApplicationMenu(Menu.buildFromTemplate(template));

app.setAboutPanelOptions({
  applicationName: "DDM",
  applicationVersion: "1.0.0",
  version:"2022.02.22",
  website :"https://github.com/qiaolin-li/dubbo-desktop-manager",
  copyright:"Copyright © 2021-2099 QIAOLIN. All rights reserved."
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 这个方法将在Electron完成后被调用 
// 初始化并准备创建浏览器窗口。 
// 某些api只能在事件发生后使用。
app.on('ready', async () => {
 
  updateChecker();
  
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  // 统计时需要
  const xxx_filter = {
      urls: ["https://hm.baidu.com/*"]
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(xxx_filter, (details, callback)=> {
    details.requestHeaders['Referer'] = 'http://localhost:8080/'
    callback({ requestHeaders: details.requestHeaders })
  })

  // const ret = globalShortcut.register('CommandOrControl+X', () => {
  //   ('CommandOrControl+X is pressed')
  // }); 
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
