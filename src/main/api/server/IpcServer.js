import { ipcMain } from 'electron'
import logger from '@/main/common/logger';

/**
 * 主进程和渲染进程通过 IPC协议通信
 */
class IpcServer {
    startListener(apiExportor) {
        const COMMUNICATION_CHANNEL = "ipc-main-unify";
        ipcMain.on(COMMUNICATION_CHANNEL, async (event, invocation) => {
            let {moduleName, method, args, replyChannel, requestId} = invocation;
            try {
                const response = await apiExportor.invokeMethod(moduleName, method, args);
                response.setRequestId(requestId);
                event.sender.send(replyChannel, await response);
            } catch (e) {
                logger.error(`调用接口异常 moduleName:${moduleName}, method:${method}, args:${JSON.stringify(args)}`, e);
                event.sender.send(replyChannel, {
                    success: false,
                    errorMessage: `调用接口异常, 错误信息：` + e.message,
                    requestId: requestId
                });
            }
        })
    }
}


export default IpcServer;