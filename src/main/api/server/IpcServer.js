import { ipcMain } from 'electron'

/**
 * 主进程和渲染进程通过 IPC协议通信
 */
class IpcServer {
    startListener(apiExportor) {
        const COMMUNICATION_CHANNEL = "ipc-main-unify";
        ipcMain.on(COMMUNICATION_CHANNEL, async (event, invocation) => {
            let {moduleName, method, args, replyChannel, requestId} = invocation;
            const response = await apiExportor.invokeMethod(moduleName, method, args);
            response.setRequestId(requestId);
            event.sender.send(replyChannel, await response);
        })
    }
}


export default IpcServer;