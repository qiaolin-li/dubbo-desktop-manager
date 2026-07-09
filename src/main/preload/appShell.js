import { shell }        from 'electron';



class AppShellBridge {

    /**
     * 打开外部链接
     * @param { string } url 
     */
    openExternal (url) {
        shell.openExternal(url);
    }

    /**
     * 用文件管理器打开文件所在目录
     * @param {*} fullPath 
     */
    showItemInFolder(fullPath) {
        shell.showItemInFolder(fullPath);
    }

    /**
     * 用系统默认程序打开文件
     * @param {*} fullPath 
     */
    openPath(fullPath) {
        shell.openPath(fullPath);
    }

    /**
     * 把文件移到回收站
     * @param {*} fullPath 
     */
    trashItem(fullPath) {
        shell.trashItem(fullPath);
    }
}


export default new AppShellBridge();