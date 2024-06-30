/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class AppConfig {

    /**
     * 设置一个配置
     * @param {string} key 配置key
     * @param {any} value 配置value
     * @returns {void}
     */
    async setProperty(key, value) {}

    /**
     * 是否存在某个配置
     * @param {string} key 
     * @returns 
     */
    async hasProperty(key) {}

    /**
     * 获取一个配置
     * @param {string} key 
     * @returns {any} 配置对象
     */
    async getProperty(key) {}
}

export default consumer.wrapper(new AppConfig(), "appConfig");