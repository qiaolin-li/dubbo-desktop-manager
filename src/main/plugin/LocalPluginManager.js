import fs                       from 'fs';
import { satisfies }            from 'semver';
import path                     from 'path';
import constant                 from '@/main/common/Constant'
import appConfig                from "@/main/common/config/appConfig"

/**
 * 本地插件管理器
 *  维护本地插件列表、增加、移除等操作
 * 
 * @typedef {import('./AppPlugin.js').default} AppPlugin
 * @typedef {import('./PluginManager.js').default} PluginManager
 */
class LocalPluginManager {

    /**
     * @param {PluginManager} pluginManager 插件管理器
     */
    constructor(pluginManager) {
        this.pluginManager = pluginManager;
    }

    /**
     * 增加本地插件
     * @param {*} pluginPath 
     */
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

        const requiredVersion = pkg.engines ? pkg.engines['ddm'] : null;
        if (!requiredVersion) {
            throw new Error(`插件 ${pkg.name} 必须指定兼容版本，请在package.json中添加 "engines": { "ddm": ">=x.x.x <=y.y.y" }`);
        }
        
        // 检查插件版本是否满足当前应用版本
        if (!satisfies(constant.VERSION, requiredVersion)) {
            throw new Error(`插件 ${pkg.name} 不兼容当前版本 ${constant.VERSION}，需要 ${requiredVersion}`);
        }

        const localPluginList = appConfig.getProperty('localPluginList') || [];
        // 存在就可以忽略
        if(localPluginList.includes(pluginPath)) {
            // throw new Error('插件已存在, 请勿重复添加')
            return;
        }

        if(localPluginList.find(p => p.endsWith(pkg.name))) {
            throw new Error('已有同名插件，插件名必须唯一')
        }
        
        localPluginList.push(pluginPath);
        appConfig.setProperty('localPluginList', localPluginList);
    }

    /**
     * 移除本地插件
     * @param {string} pluginPath 本地插件路径
     * @returns 
     */
    async removeDevelopmentPlugin(pluginPath) {
        const localPluginList = appConfig.getProperty('localPluginList') || [];
        const index = localPluginList.indexOf(pluginPath);
        if(index > -1) {
            localPluginList.splice(index, 1);
            appConfig.setProperty('localPluginList', localPluginList);
        }
    }

    /**
     * 获取本地插件列表
     * @returns 
     */
    async getDevelopmentPluginList() {
        // 获取所有本地插件列表
        const localPluginList = appConfig.getProperty('localPluginList') || [];
        return localPluginList.map((pluginPath) => {

            // 目录可能被移除了，直接删除吧，用户可以再次新增
            if (!fs.existsSync(pluginPath)) {
                this.removeDevelopmentPlugin(pluginPath)
                return;
            }

            const pkg = JSON.parse(fs.readFileSync(path.join(pluginPath, 'package.json'))) 
            const name = pkg.name;
            if(!name.startsWith('ddm-plugin-')) {
                return;
            }
            
            const plugin = this.pluginManager.get(name);
            return {
                pluginId: `${name}@${pkg.version}`,
                pluginName: name,
                pluginNickName: pkg.pluginNickName || pkg.name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''), 
                path: path.join(pluginPath),
                author: pkg.author,
                description: pkg.description,
                logo: 'file://' + path.join(pluginPath, 'logo.png'),
                readme: 'file://' + path.join(pluginPath, 'README.md'),
                installedVersion: plugin ? plugin.version : '',
                // 如果已安装，本地插件可无脑更新，否则就是未安装
                installStatus: plugin ? 'update' : 'uninstalled',
                version: pkg.version,
                versions: [{
                    version: pkg.version,
                    engines: pkg.engines
                }],
                source: 'local'
            };
        }).filter(Boolean);
    }

}

export default LocalPluginManager;