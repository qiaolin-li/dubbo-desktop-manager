import { app, protocol, BrowserWindow, Menu, session } from 'electron'
import updateChecker from '@/main/common/autoupdate/updateChecker.js';
import windowHolder  from '@/main/common/holder/WindowHolder.js';
import Constant      from '@/main/common/Constant.js'
import logger        from '@/main/common/logger';
import template      from '@/main/menuList.js';
import apiExportor   from '@/main/api/index.js'
import appCore       from '@/main/AppCore.js';
import appConfig from "@/main/common/config/appConfig.js";
import pkg from '../../package.json'


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// 禁用同源策略
// app.commandLine.appendSwitch("disable-site-isolation-trials");
app.allowRendererProcessReuse = true;

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
app.setAboutPanelOptions({
  applicationName: "DDM",
  applicationVersion: pkg.version,
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
  if (BrowserWindow.getAllWindows().length === 0) {
    windowHolder.createMainWindow()
  }
})

// 这个方法将在Electron完成后被调用 
// 初始化并准备创建浏览器窗口。 
// 某些api只能在事件发生后使用。
app.on('ready', async () => {
 
  updateChecker();

  apiExportor.exportApi();
  
  if(!appConfig.hasProperty("javaHome")){
    appConfig.setProperty("javaHome", process.env.JAVA_HOME)
  }

  windowHolder.createMainWindow()
  windowHolder.instanllDevTools()

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
if (Constant.IS_DEVELOPMENT) {
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

process.on('uncaughtException', function (error) {
  logger.error(`发生了异常`, error);
  
})