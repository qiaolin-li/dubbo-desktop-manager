import { BrowserWindow, ipcMain} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import Constant from '@/main/common/Constant.js'

const OPEN_WINDOW_CHANEL = "ipc-main-open-window";

async function instanllDevTools(){
    // Install Vue Devtools
    if (Constant.IS_DEVELOPMENT && !process.env.IS_TEST) {
        try {
          await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
          console.error('Vue Devtools failed to install:', e.toString())
        }
    }
}

let init = false;

async function createWindow(newWindow, url){
    const remote = require('@electron/remote/main');
    if(!init){
        remote.initialize()
        init = true;
    }
    remote.enable(newWindow.webContents);
    if(!process.env.WEBPACK_DEV_SERVER_URL){
        createProtocol('app')
    }
    // Load the index.html when not in development
    newWindow.loadURL(url)
    if (!process.env.IS_TEST) {
        newWindow.webContents.openDevTools()
    }
    return newWindow;
}


class WindowHolder {

    constructor(){
        instanllDevTools();
    }

    getWindow() {
        return this.window;
    }


    async createMainWindow() {

        const url = process.env.WEBPACK_DEV_SERVER_URL || 'app://./index.html' ;

        const mainWindowConfig = {
            width: 1200,
            height: 800,
            title: "Dubbo-Desktop-Manager",
            titleBarStyle: 'hidden',
            webPreferences: {
                // Use pluginOptions.nodeIntegration, leave this alone
                // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
                nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
                contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
                webSecurity: false
            }
        }
        this.window  = new BrowserWindow(mainWindowConfig)
        createWindow(this.window, url)
    }

    async createSettingWindow(){
        if(this.settingWindow && !this.settingWindow.isDestroyed()){
            this.settingWindow.focus();
            return;
        }

        const settingWindowConfig = {
            width: 800,
            height: 600,
            title: "设置",
            parent: this.window,
            webPreferences: {
                // Use pluginOptions.nodeIntegration, leave this alone
                // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
                nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
                contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
                webSecurity: false
            }
        }

        const url = process.env.WEBPACK_DEV_SERVER_URL ? `${process.env.WEBPACK_DEV_SERVER_URL}#setting` : 'app://./index.html#setting' ;

        this.settingWindow = new BrowserWindow(settingWindowConfig);
        createWindow(this.settingWindow, url)
    }
}

const windowHolder = new WindowHolder();


ipcMain.on(OPEN_WINDOW_CHANEL, async (event, invocation) => {
    windowHolder.createSettingWindow();
})

export default windowHolder;