import axios                    from 'axios';
import i18n                     from '@/main/common/i18n';   
import appConfig                from "@/main/common/config/appConfig"
import constant                 from "@/main/common/Constant.js";
import { Logger }               from '@/main/common/logger';
import appCore                  from '@/main/AppCore.js';
import path                     from 'path';


// 导入了这个axios就会报错  ReferenceError: Cannot access 'o' before initialization
// 所以使用 appCore.axios了
// import axios                    from 'axios';

// 这是对现实的一种妥协，
// 本来我使用的是js #xxx 私有属性方式来实现的，突然就不好用了，编译一直报错，可能是某些依赖发生了变化。
// 我尝试了各种办法，加入babel的plugin，但是也不行，弄了很久，心力憔悴，
// 降级使用这种办法实现，相信后人的智慧，未来再去优化
const dataSourceListMap = new Map();

class AppPlugin {

    constructor(pluginDir, module, packageJson) {
        this.pluginDir = pluginDir;
        this.module = packageJson.name;

        dataSourceListMap.set(this, []);
        
        this.t = i18n.t.bind(i18n);
        this.axios = axios;
        this.appConfig = appConfig;
        this.constant = constant;
        this.logger = new Logger(`plugin[${module}]`);

        this.pluginDir = pluginDir;
        

        this.id = packageJson.name;
        this.name = packageJson.name;
        this.version = packageJson.version;

        this.mainPath = packageJson.main ? path.join(pluginDir, packageJson.main) : path.join(pluginDir, 'main.js')
        this.rendenerPath = packageJson.rendererMain ? path.join(pluginDir, packageJson.rendererMain) : path.join(pluginDir, 'renderer.js')
        this.i18nPath = packageJson.i18nMain ? path.join(pluginDir, packageJson.i18nMain) : path.join(pluginDir, 'i18n.js')
    }
    
    registerDataSource(type,  dataSource) {
        appCore.registerDataSource(type, dataSource)
        dataSourceListMap.get(this).push(type)
    }
    
    pluginT(key, ...args) {
        return i18n.t(`pluginLocale.${this.module}.${key}`, ...args)
    }

    uninstall() {
        const dataSourceList = dataSourceListMap.get(this) || [];
        dataSourceList.forEach((type) => {
            appCore.removeDataSource(type);
        });
    }

    geti18nRegistrar () {
        const module = this.module;
        return {
            addLocaleMessage(locale, message) {
                try {
                    if(i18n.getLocaleMessage(locale)){
                        throw new Error(`插件【${module}】提供语言包【${locale}】已经存在，当前插件的语言包不会生效`);
                    }
                } catch (error){
                    if(error.message !== 'Unexpected token u in JSON at position 0') {
                        throw error;
                    }
                }

                i18n.setLocaleMessage(locale, message);
            },

            addPluginLocaleMessage(locale, message) {
                const localeMessage = i18n.getLocaleMessage(locale);
                if(!localeMessage.pluginLocale ){
                    localeMessage.pluginLocale = {};
                }
                localeMessage.pluginLocale[module] = message;
                i18n.setLocaleMessage(locale, localeMessage);
            }

        }
    }
}

export default AppPlugin