import { ipcMain }              from 'electron'
import { Logger }               from '@/main/common/logger';
import constant                 from '@/main/common/Constant.js'

const logger = new Logger("ddm-IpcServer");

/**
 * 主进程和渲染进程通信 
 *  IPC协议通信
 */
class IpcServer {

    /**
     * 启动监听
     * @param {import('@/main/api/ApiExportor.js').default} apiExportor 
     */
    startListener(apiExportor) {
        ipcMain.on(constant.COMMUNICATION_CHANNEL, async (event, invocation) => {
            let {moduleName, method, args, replyChannel, requestId} = invocation;
            const response = await apiExportor.invokeMethod(moduleName, method, args);
            response.setRequestId(requestId);
            event.sender.send(replyChannel, await response);
        })

        logger.info(`IPC Server 已启动，通信频道: ${constant.COMMUNICATION_CHANNEL}`);
    }
}

export default IpcServer;