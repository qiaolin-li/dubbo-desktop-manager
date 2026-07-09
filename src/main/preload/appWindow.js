import { ipcRenderer}                                               from 'electron';
import { app, Menu, BrowserWindow, getCurrentWindow }               from '@electron/remote';

class AppWindowBridge {

    /**
     * 最小化窗口
     */
    minimize() {
        getCurrentWindow().minimize();
    }

    /**
     * 最大化切换
     */
    toggleMaximize() {
        const win = getCurrentWindow();
        if (win.isMaximized()) {
            win.unmaximize();
            return;
        }

        win.maximize();
    }

    /**
     * 关闭窗口
     */
    close() {
        const win = getCurrentWindow();
        win.close();
    }

    /**
     * 重启应用
     */
    restart() {
        app.relaunch();
        app.exit(0);
    }

    /**
     * 重新加载窗口
     */
    forceReload() {
        const win = getCurrentWindow();
        win.webContents.reloadIgnoringCache();
    }

    /**
     * 打开开发者工具
     */
    openDevTools() {
        const win = getCurrentWindow();
        win.webContents.toggleDevTools();
    }

    /**
     * 弹出菜单
     * @param {*} template 菜单模版
     */
    popupMenu({ template }) {

        const menu = Menu.buildFromTemplate(template);
        menu.popup({ window: BrowserWindow.getFocusedWindow() });
    }

    /**
     * 新开一个独立 BrowserWindow 展示 JSON 编辑器
     * @param {object} payload
     * @returns {Promise<{id:number|null}>}
     */
    openStandaloneJsonEditor(payload = {}) {
        return ipcRenderer.invoke('window-open-standalone-json-editor', payload);
    }

    /**
     * 获取当前独立 JSON 窗口启动时的载荷
     * @returns {Promise<object|null>}
     */
    getStandaloneJsonEditorPayload(windowKey) {
        return ipcRenderer.invoke('window-get-standalone-json-editor-payload', windowKey);
    }

}

export default new AppWindowBridge();
