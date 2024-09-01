import appConfig                from "@/renderer/api/AppConfigClient.js";

class PluginComponent {

    #module=null;

    constructor(module){
        this.#module = module;
    }

    get() {
        const module = this.#module;
        return {
            computed: {
                $pluginT() {
                    return function (key, ...args) {
                        return this.$t(`pluginLocale.${module}.${key}`, ...args);
                    };
                }
            },
            methods: {
                /**
                 * 设置一个配置
                 * @param {string} key 配置key
                 * @param {any} value 配置value
                 * @returns {void}
                 */
                setPluginProperty: (key, value) => appConfig.setProperty(`pluginConfig.${module}.${key}`, value),

                /**
                 * 是否存在某个配置
                 * @param {string} key 
                 * @returns 
                 */
                hasPluginProperty: (key) => appConfig.hasProperty(`pluginConfig.${module}.${key}`),

                /**
                 * 获取一个配置
                 * @param {string} key 
                 * @returns {any} 配置对象
                 */
                getPluginProperty: (key) => appConfig.getProperty(`pluginConfig.${module}.${key}`),

                getPluginProperties: () => appConfig.getProperties(`pluginConfig.${module}`),
            }
        }
    }
}

export default PluginComponent;