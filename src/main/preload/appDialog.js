const remote = require('@electron/remote');

/**
 * 应用弹窗
 */
class AppDialogBridge {

    /* 
    显示打开文件对话框
     * @param {Object}
     * @returns {Promise<Electron.OpenDialogReturnValue>}
     **/
    showOpenDialog(options) {
        return remote.dialog.showOpenDialog(remote.getCurrentWindow(), options);
    }

    /** 
     * 显示打开文件对话框（同步）
     * @param {Object} options
     * @returns {Electron.OpenDialogReturnValue}
     */
    showOpenDialogSync(options) {
        return remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), options);
    }

    /**
     *  显示保存文件对话框
     * @param {Object} options
     * @returns {Promise<Electron.SaveDialogReturnValue>}
     */
    showSaveDialog(options) {
        return remote.dialog.showSaveDialog(remote.getCurrentWindow(), options);
    }

    /**
     * 显示消息框
     * @param {Object} options
     * @returns {Electron.SaveDialogReturnValue}
     */
    showMessageBox(options) {
        return remote.dialog.showMessageBox(remote.getCurrentWindow(), options);
    }

    /**
     * 显示确认框
     * @param { string } message 
     * @param {string } title 
     * @param {*} options 
     * @returns 
     */
    confirm (message, title, options = {}) {
        const { confirmButtonText = '确定', cancelButtonText = '取消' } = options;

        return remote.dialog.showMessageBox(remote.getCurrentWindow(),{
            type: 'warning',
            title,
            message,
            buttons: [confirmButtonText, cancelButtonText],
            defaultId: 0,
            cancelId: 1,
            noLink: true,
        }).then(({ response }) => {
            if (response === 0) return Promise.resolve();
            return Promise.reject();
        });
    }
}

export default new AppDialogBridge();