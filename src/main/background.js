import { app, shell, protocol, BrowserWindow, Menu, session, dialog}   from 'electron'
import windowHolder                                                    from '@/main/window/WindowHolder';
import Constant                                                        from '@/main/common/Constant.js'
import { Logger }                                                      from '@/main/common/logger';
import template                                                        from '@/main/menuList.js';
import appCore                                                         from '@/main/AppCore.js';
import appConfig                                                       from "@/main/common/config/appConfig.js";
import i18n                                                            from '@/main/common/i18n';

const logger = new Logger("ddm-Background");

Map.prototype.computeIfAbsent = function (key, fun) {
	if (!this.has(key)) {
		this.set(key, fun(key));
	}
	return this.get(key);
};

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

// 禁用同源策略
// app.commandLine.appendSwitch("disable-site-isolation-trials");
app.allowRendererProcessReuse = true;

// 修复devtools布局错误导致菜单渲染在窗口的下方bug, 详见：https://github.com/electron/electron/issues/38790
app.commandLine.appendSwitch('disable-features', 'WidgetLayering');


Menu.setApplicationMenu(Menu.buildFromTemplate(template));
app.setAboutPanelOptions({
    applicationName: "Dubbo Desktop Manager",
    applicationVersion: Constant.VERSION,
    version: Constant.VERSION,
    website :"https://github.com/qiaolin-li/dubbo-desktop-manager",
    copyright:"Copyright © 2021-2099 QIAOLIN. All rights reserved."
})

/**
 * 监听所有窗口都关闭的事件，然后退出应用。
 */
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // if (!Constant.IS_MAC) {
    app.quit()
    // }
})


/**
 * 在macOS上，在应用程序中重新创建一个窗口是很常见的
 * 单击dock图标，没有其他窗口打开。
 */
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        windowHolder.createMainWindow()
    }
})


if(!Constant.IS_DEVELOPMENT){
    if (!app.requestSingleInstanceLock()) {
        app.quit();
    } else {
        app.on('second-instance', () => {
            app.whenReady().then(() => {
                dialog.showMessageBoxSync({
                    type: 'warning',
                    title: i18n.t('app.singleInstanceTitle'),
                    message: i18n.t('app.singleInstanceMessage'),
                    buttons: [i18n.t('base.confirm')]
                });
            });
        });
    }
}


// 这个方法会在 Electron 初始化完成后调用
// 用于初始化并准备创建浏览器窗口
// 某些 API 只能在事件触发后使用
app.on('ready', async () => {

    appCore.prepareRuntime();
    
    if(!appConfig.hasProperty("javaHome")){
        appConfig.setProperty("javaHome", process.env.JAVA_HOME)
    }
    
    await windowHolder.createMainWindow()
    windowHolder.instanllDevTools()
    appCore.initPlugins().catch((error) => {
        logger.error('插件初始化失败', error);
    });

    // 统计需要
    const baidu_filter = {
        urls: ["https://hm.baidu.com/*"]
    }
    
    // 1) 修改请求头
    session.defaultSession.webRequest.onBeforeSendHeaders(baidu_filter, (details, callback) => {
        const baseUrl = 'http://localhost:' + Constant.VERSION.replace(/\./g, '')

        const headers = {
            ...details.requestHeaders,
            Referer:  baseUrl
        }

        callback({ requestHeaders: headers })
    })
    
    
    // 2) 修改请求 URL（重写 / 重定向）
    session.defaultSession.webRequest.onBeforeRequest(baidu_filter, (details, callback) => {
        const oldUrl = details.url;

        let newUrl = details.url.replaceAll(
            'http%3A%2F%2Flocalhost%3A5173%2Findex.html',
            `http%3A%2F%2Flocalhost%3A${Constant.VERSION.replace(/\./g, '')}%2Findex.html`
        )

        if(oldUrl.indexOf('hm.js') >= 0 || oldUrl === newUrl) {
            callback({ requestHeaders: details.requestHeaders })
            return;
        }

        callback({
            redirectURL: newUrl   // 关键
        })
    })
})

app.on('web-contents-created', (e, webContents) => {
    webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
});


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
    logger.error('发生了异常', error);
})

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise 出现异常', reason, promise);
});

