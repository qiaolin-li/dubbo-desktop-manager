import { Notification }         from 'electron';
import apiExportor              from '@/main/api/ApiExportor';
import { Logger }               from '@/main/common/logger';
import pluginManager            from '@/main/plugin/PluginManager'

const logger = new Logger("ddm-AppCore");
const remoteApiModules = import.meta.glob('./**/remoteApi.js', { eager: true });


/**
 * 主进程核心对象
 * 目前还有点薄弱，但是未来会以它为核心来做主进程的生命周期
 */
class AppCore {

    constructor() {
        this.apiExportor = apiExportor;
        this.exportService = apiExportor.exportService.bind(apiExportor);
        this.exported = false;
    }

    prepareRuntime() {
        if (!this.exported) {
            this.exportApi();
            this.exported = true;
        }
    }

    async initPlugins() {
        await pluginManager.init();
    }


    /**
     * 发送一个通知
     * @param {{ title: string, body?: any }} notifyInfo 通知内容
     */
    notify({ title, body }) {
        new Notification({
            title: title,
            body: body
        }).show()
    }
    
    
    exportApi() {
        Object.keys(remoteApiModules).forEach((key) => {
            try {
                const module = remoteApiModules[key].default;
                module(this);
                // logger.info(`加载模块启动器 成功 module: ${key}`);
            } catch (error) {
                logger.error(`加载模块启动器 失败 module: ${key}`, error);
                throw new Error(`加载模块启动器失败 module: ${key}, 错误信息: ${error.message}`);
            }
        })
    }
}

export default new AppCore();
