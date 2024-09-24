import { Notification }         from 'electron';
import apiExportor              from '@/main/api/ApiExportor';
import logger                   from '@/main/common/logger';
import Plugin                   from '@/main/plugin/index'

class AppCore {

    constructor() {
        this.datasources = new Map();
        this.apiExportor = apiExportor;
        this.registry = apiExportor.registry.bind(apiExportor);
        this.pluginManager = new Plugin();
    }

    async init() {
        await this.pluginManager.init();
        await this.exportApi();
    }

    registerDataSource(type,  dataSource) {
        this.datasources.set(type, dataSource);
    }

    removeDataSource(type) {
        this.datasources.delete(type);
    }

    /**
     * 从数据源映射中获取指定类型的数据源。
     * @param {string} type - 要获取的数据源类型（默认为 'adapter'）
     * @return {*} 与给定类型关联的数据源，未找到时返回 undefined
     */
    getDataSource(type = 'adapter') {
        return this.datasources.get(type);
    }

    notify(title, message) {
        new Notification({
            title: title,
            body: message
        }).show()
    }
    
    exportApi() {
        //第一个参数表示相对的文件目录，第二个参数表示是否包括子目录中的文件，第三个参数表示引入的文件匹配的正则表达式。
        const context = require.context('@/main/', true, /remoteApi\.js$/);
        context.keys().forEach((key) => {
             logger.info(key);
            const module = context(key).default;
            module(this);
            logger.info(`加载模块启动器 module: ${key}`);
        })
}
}


export default new AppCore();