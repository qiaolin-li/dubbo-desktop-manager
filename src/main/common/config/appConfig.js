import lowdb from "lowdb"
import FileSync from "lowdb/adapters/FileSync.js"
import constant from "@/main/common/Constant.js";


class AppConfig {

    /**
     * 应用配置构造器
     * @param {string} filename 
     */
    constructor(filename) {
        this.db = lowdb(new FileSync(filename))

        // Read data from JSON file, this will set db.data content
        this.db.read()
    }

    /**
     * 设置一个配置
     * @param {string} key 配置key
     * @param {any} value 配置value
     * @returns {void}
     */
    setProperty(key, value) {
        return this.db.read().set(key, value).write()
    }

    /**
     * 是否存在某个配置
     * @param {string} key 
     * @returns 
     */
    hasProperty(key) {
        return this.db.read().has(key).value();
    }

    /**
     * 获取一个配置
     * @param {string} key 
     * @returns {any} 配置对象
     */
    getProperty(key) {
        return this.db.read().get(key).value()
    }
}

export default new AppConfig(constant.APPLICATION_CONFIG_FILE);