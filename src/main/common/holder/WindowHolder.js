import { BrowserWindow, ipcMain} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import Constant from '@/main/common/Constant.js'
import { setupTitlebar, attachTitlebarToWindow } from 'custom-electron-titlebar/main'

const path = require('path')

const isMac = process.platform === 'darwin'

// Setup the titlebar
setupTitlebar()

async function instanllDevTools(){
    // Install Vue Devtools
    if (!process.env.IS_TEST) {
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
    if(process.env.WEBPACK_DEV_SERVER_URL){
        newWindow.webContents.openDevTools()
    } else {
        createProtocol('app')
    }
    // Load the index.html when not in development
    newWindow.loadURL(url)
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
            frame: false, // Use to linux
            titleBarStyle: 'hidden',
            titleBarOverlay: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
                webviewTag: true,
                sandbox: false,
                // preload: path.join(__dirname, 'src/main/preload.js')
                preload: path.join(__dirname, 'preload.js')
            }
        }

        if(isMac){
            mainWindowConfig.titleBarStyle = 'hidden';
        }
        this.window  = new BrowserWindow(mainWindowConfig)
        createWindow(this.window, url)

        // Attach listeners
        attachTitlebarToWindow(this.window)
    }
}

const windowHolder = new WindowHolder();

export default windowHolder;