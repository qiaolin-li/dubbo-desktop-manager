import path                                         from 'path'
import Constant                                     from '@/main/common/Constant.js'
import { BrowserWindow}                             from 'electron'
import { createProtocol }                           from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS }         from 'electron-devtools-installer'
import { setupTitlebar, attachTitlebarToWindow }    from 'custom-electron-titlebar/main'


class WindowHolder {

    constructor(){
        this.init = false;
        // Setup the titlebar
        if(!Constant.IS_MAC){
            setupTitlebar()
        }
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
            }
        }

        if(!Constant.IS_MAC){
            mainWindowConfig.webPreferences.sandbox = false;
            mainWindowConfig.webPreferences.preload = path.join(__dirname, 'preload.js');
        }
        this.window  = new BrowserWindow(mainWindowConfig)
        this.createWindow(this.window, url)

        // Attach listeners
        if(!Constant.IS_MAC){
            attachTitlebarToWindow(this.window)
        }
    }


    async createWindow(newWindow, url){
        const remote = require('@electron/remote/main');
        if(!this.init){
            remote.initialize()
            this.init = true;
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
    

    async instanllDevTools(){
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
}

export default new WindowHolder();