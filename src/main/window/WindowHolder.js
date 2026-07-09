import path                                                  from 'path'
import { pathToFileURL }                                     from 'url'
import { Logger }                                            from '@/main/common/logger';
import appConfig                                             from "@/main/common/config/appConfig"
import Constant                                              from '@/main/common/Constant.js'
import { BrowserWindow, screen, ipcMain, nativeTheme}        from 'electron'

const logger = new Logger("ddm-WindowHolder");

const preloadPath = path.join(__dirname, '../preload/preload.js');

/**
 * 窗口管理器
 * 管理各种窗口，主窗口....
 */
class WindowHolder {

    #mainWinow = null;

    constructor(){
        this.init = false;
    }

    /**
     * 对外提供window对象
     * @returns {BrowserWindow} 返回当前的窗口对象
     */
    getWindow() {
        return this.#mainWinow;
    }

    /**
     * 向主窗口发送消息
     * @param {string} channel 
     * @param  {...any} args 
     */
    send(channel, ...args){
        if(this.#mainWinow?.webContents){
            this.#mainWinow.webContents.send(channel, ...args);
        }
    }

    /**
     * 创建主窗口
     */
    async createMainWindow() {
        // 获取主显示屏信息
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

        const mainWindowConfig = {
            width: Math.min(appConfig.getProperty("windowWidth") || 1200, screenWidth),
            height: Math.min(appConfig.getProperty("windowHeight") || 800, screenHeight),
            title: "Dubbo-Desktop-Manager",
            backgroundColor: this.getInitialBackgroundColor(),
            frame: false, // Use to linux
            titleBarStyle: 'hidden',
            autoHideMenuBar: true,
            webPreferences: {
                sandbox: false,
                webSecurity: false,
                preload: preloadPath
            }
        }

        if(Constant.IS_MAC){
            mainWindowConfig.titleBarOverlay = true;
        }

        this.#mainWinow  = new BrowserWindow(mainWindowConfig)
        this.createWindow(this.#mainWinow, this.buildWindowUrl())

        // 监听窗口大小改变
        this.#mainWinow.on('resize', () => {
            appConfig.setProperty("windowMaximized", this.#mainWinow.isMaximized());
            if (this.#mainWinow.isMaximized()) return;
            const { width, height } = this.#mainWinow.getBounds();
            appConfig.setProperty("windowWidth", width);
            appConfig.setProperty("windowHeight", height);
        });

        // 创建窗口后
        if (appConfig.getProperty("windowMaximized")) {
            this.#mainWinow.maximize();
        }

        this.#mainWinow.webContents.on('did-finish-load', () => {
            logger.info('主页面加载完成');
        });

    }

    buildWindowUrl(page = 'index.html', query = {}) {
        const baseUrl = process.env.ELECTRON_RENDERER_URL
            ? new URL(page, `${process.env.ELECTRON_RENDERER_URL}/`).toString()
            : pathToFileURL(path.join(__dirname, `../renderer/${page}`)).toString();
        const url = new URL(baseUrl);

        Object.keys(query).forEach(key => {
            if (query[key] != null && query[key] !== "") {
                url.searchParams.set(key, String(query[key]));
            }
        });

        return url.toString();
    }


    async createStandaloneJsonEditorWindow(title = "JSON Editor", query) {
        const standaloneWindow = new BrowserWindow({
            width: 1200,
            height: 820,
            minWidth: 720,
            minHeight: 480,
            title,
            backgroundColor: this.getInitialBackgroundColor(),
            autoHideMenuBar: true,
            webPreferences: {
                sandbox: false,
                webSecurity: false,
                webviewTag: true,
                preload: preloadPath
            }
        });

        return this.createWindow(standaloneWindow, this.buildWindowUrl('json-editor.html', query), false);
    }


    /**
     * 创建窗口
     * @param {*} newWindow 
     * @param {*} url 
     * @returns 
     */
    async createWindow(newWindow, url, openDevTools = true){
        const remote = require('@electron/remote/main');
        if(!this.init){
            remote.initialize()
            this.init = true;
        }
        remote.enable(newWindow.webContents);
        if(process.env.ELECTRON_RENDERER_URL && openDevTools){
            newWindow.webContents.openDevTools()
        }
        // Load the index.html when not in development
        newWindow.loadURL(url)
        return newWindow;
    }

    /**
     * 安装Vue DevTools工具
     */
    async instanllDevTools(){
        if (!Constant.IS_DEVELOPMENT) {
            return;
        }

        try {
            const devtoolsInstaller = await import('electron-devtools-installer');
            const installExtension = devtoolsInstaller.default || devtoolsInstaller;
            const VUEJS_DEVTOOLS = devtoolsInstaller.VUEJS_DEVTOOLS;
            if (typeof installExtension !== "function" || !VUEJS_DEVTOOLS) {
                return;
            }

            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            logger.error('Vue Devtools failed to install:', e.toString())
        }
    }

    
    getInitialBackgroundColor() {
        const themeMode = appConfig.getProperty("themeMode");
        const isDarkTheme = themeMode === "dark" || (themeMode !== "light" && nativeTheme.shouldUseDarkColors);
        return isDarkTheme ? "#202224" : "#f6f8fa";
    }
}

export default new WindowHolder();
