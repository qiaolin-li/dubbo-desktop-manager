import { Notification } from 'electron';

class AppCore {

    constructor() {
        this.datasources = new Map();
    }

    registerDataSource(type,  dataSource) {
        this.datasources.set(type, dataSource);
    }

    removeDataSource(type) {
        this.datasources.delete(type);
    }

    /**
     * 从数据源映射中获取指定类型的数据源。
     *
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
    
}


export default new AppCore();