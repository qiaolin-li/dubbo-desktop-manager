import axios                    from 'axios'

const configUrl = "https://cdn.jsdelivr.net/npm/ddm-plugin-config/config.json"

class PluginConfig {


    constructor() {
        axios.get(configUrl).then(res => {
            this.config = res.data
        }).catch(err => {
            console.error("获取插件全局配置失败！", err)
        })
    }

    /**
     * 插件商店是否开启，如果关闭，只会让用户看到推荐插件列表
     * @returns 
     */
    isPluginStoreEnabled(){
        return this.config?.pluginStoreSwitch ?? true;
    }

    /**
     * 获取推荐的插件列表
     * @returns ["${pluginName}"]
     */
    recommendList(){
        return this.config?.recommendList ?? [];
    }

    /**
     * 一个插件是否在推荐列表之中
     * @param {string} pluginName - 插件名称
     * @returns {boolean} true: 在推荐列表,false: 不在推荐列表
     */
    isRecommendPlugin(pluginName){
        return this.recommendList().includes(pluginName);
    }

    /**
     * 黑名单插件列表，防止有人搞破坏
     * @returns 黑名单插件
     */
    blacklist(){
        return this.config?.blacklist?.length ? this.config.blacklist : ["ddm-plugin-config"];
    }

    
    /**
     * 一个插件是否在黑名单之中
     * @param {string} pluginName - 插件名称
     * @returns {boolean} true表示在黑名单之中
     */
    isBlackListPlugin(pluginName){
        return this.blacklist().includes(pluginName);
    }

    /**
     * 一个插件是否不在黑名单之中
     * @param {string} pluginName - 插件名称
     * @returns {boolean} true表示不在黑名单之中
     */
    isNotBlackListPlugin(pluginName){
        return !this.isBlackListPlugin(pluginName);
    }

    /**
     * 获取推荐的插件列表
     * @param {*} module 
     * @param {*} type 
     * @returns 
     */
    discoveryPlugin(module, type) {
        return this.config?.discoveryPlugin?.[module]?.[type] || null;
    }


    async getConfig() {
        if(this.config) {
            return this.config;
        }
    
        const res = await axios.get(configUrl);
        this.config = res.data
        return this.config;
    }
     
}



export default new PluginConfig();