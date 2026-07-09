import { ipcRenderer}        from 'electron';
import constant                 from '@/main/common/Constant.js'


/** 
 * 应用桥接类，提供了与主进程交互的方法
*/
class AppIpcBridge {

    /**
     * 监听应用事件
     * @param {string} channel - 通道
     * @param {Function} callback - 回调函数
     */
    on(channel, callback) {
        // 1. 创建中转函数
        // eslint-disable-next-line no-unused-vars
        const listener = (sender, ...args) => {
            
            // 2. 使用 apply 动态传入数组作为多个参数
            callback(...args);
        };

        ipcRenderer.on(channel, listener);

      // 直接返回一个专门负责“自杀”的函数
        return () => {
            ipcRenderer.removeListener(channel, listener);
            console.log(`已安全移除事件: ${channel}`);
        };
    }

    /**
     * 发送事件到主进程
     * @param {string} channel - 事件通道
     * @param  {...any} args - 事件参数
     */
    send(channel, ...args) {
        if(constant.COMMUNICATION_CHANNEL === channel){
            throw new Error("This is not allowed channel ");
        }
        ipcRenderer.send(channel, ...args);
    }
}

export default new AppIpcBridge();