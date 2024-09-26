import fs                       from 'fs';
import path                     from 'path';
import constant                 from '@/main/common/Constant'
import pluginManager            from '@/main/plugin/PluginManager'
import appConfig                from "@/main/common/config/appConfig"

class LocalPluginManager {

    async addDevelopmentPlugin(pluginPath) {
        const packagePath = path.join(pluginPath, 'package.json')

        if (!fs.existsSync(packagePath)) {
            throw new Error('插件包不存在')
        }
        
        if(!path.basename(pluginPath).startsWith('ddm-plugin-')) {
            throw new Error('插件包必须以ddm-plugin开头，例如【ddm-plugin-xxxx...】、【ddm-plugin-xxxx-zzzz】')
        }

        const pkg = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
        if(!pkg || !pkg.name || path.basename(pluginPath) !== pkg.name) {
            throw new Error('插件包目录名与package.json文件内的name必须一致')
        }

        const localPluginList = appConfig.getProperty('localPluginList') || [];

        if(localPluginList.includes(pluginPath)) {
            throw new Error('插件已存在, 请勿重复添加')
        }

        localPluginList.push(pluginPath);
        appConfig.setProperty('localPluginList', localPluginList);
    }

    async removeDevelopmentPlugin(pluginPath) {
        const localPluginList = appConfig.getProperty('localPluginList') || [];
        const index = localPluginList.indexOf(pluginPath);
        if(index > -1) {
            localPluginList.splice(index, 1);
            appConfig.setProperty('localPluginList', localPluginList);
        }
    }

    async getDevelopmentPluginList() {
        // 获取root目录下所有子目录
        const pluginList = [];
        const localPluginList = appConfig.getProperty('localPluginList') || [];
        localPluginList.forEach((pluginPath) => {
            const packagePath = path.join(pluginPath, 'package.json')
            const pkg = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
            const name = pkg.name;
            if(!name.startsWith('ddm-plugin-')) {
                return;
            }
            
            let installStatus = 'uninstalled';
            
            const plugin = pluginManager.get(name);
            if (plugin) {
                // 本地插件，可无脑更新
                installStatus = 'update';
            }

            pluginList.push({
                id: name,
                name: pkg.pluginName || name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
                path: path.join(pluginPath),
                author: pkg.author,
                description: pkg.description,
                logo: 'file://' + path.join(pluginPath, 'logo.png'),
                readme: 'file://' + path.join(pluginPath, 'README.md'),
                config: {},
                installVersion:plugin ? plugin.version : '',
                installStatus: installStatus,
                version: pkg.version,
                source: 'local'
            });

        });

        return pluginList;
    }

}

export default new LocalPluginManager()