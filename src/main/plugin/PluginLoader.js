import fs                   from 'fs';
import path                 from 'path';
import resolve              from 'resolve'
import constant             from "@/main/common/Constant.js";
import appConfig            from "@/main/common/config/appConfig.js";
import { Notification }     from 'electron';
import pluginManager        from "@/main/plugin/PluginManager.js";

// eslint-disable-next-line no-undef
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require


class PluginLoader {
    constructor(ctx) {
        this.ctx = ctx
        this.list = [] // 插件列表
        this.init()
    }

    init() {
        const packagePath = path.join(constant.APPLICATION_PLUGINS_DIR, 'package.json')
        if (!fs.existsSync(packagePath)) { // 如果不存在
            const pkg = {
                name: 'ddm-plugins',
                description: 'ddm-plugins',
                repository: 'https://github.com/qiaolin-li/dubbo-desktop-manager',
            }
            fs.writeFileSync(packagePath, JSON.stringify(pkg), 'utf8') // 创建这个文件
        }

        const pluginDir = path.join(constant.APPLICATION_PLUGINS_DIR, 'node_modules/')
        // 如果插件文件夹不存在，返回false
        if (!fs.existsSync(pluginDir)) { 
            return false
        }

        const json = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
        const pluginNameList = Object.keys(json.dependencies || {}).concat(Object.keys(json.devDependencies || {}));


        // 1.获取插件列表
        const modules = pluginNameList.filter((name) => {
            if (!/^ddp-plugin-|^@[^/]+\/ddp-plugin-/.test(name)) return false

            // 获取插件路径
            return fs.existsSync(this.resolvePlugin(name))
        })

        const pluginConfig = appConfig.getProperty['pluginConfig'] || {};
        for (let i in modules) {
            const module = modules[i]
            // 3.判断插件是否被禁用，如果是undefined则为新安装的插件，默认不禁用
            if (pluginConfig[module] === false) { 
                continue;
            }
            try {
                this.load(module);
            } catch (error) {
                new Notification({ title: '插件[${module}]加载失败', body: error.message }).show();
            }
        }
        
    }

    async load(module) {
        // 调用插件的`register`方法进行注册
        try {
            const plugin = this.getPlugin(module).register() 
            pluginManager.register(module, plugin)
        } catch (error) {
            throw new Error(`插件${module}加载失败，错误原因：${error}`)
        }
        this.list.push(module) // 把插件push进插件列表
    }
    resolvePlugin(name) { // 获取插件路径
        try {
            return resolve.sync(name, {
                basedir: constant.APPLICATION_PLUGINS_DIR
            })
        } catch (err) {
            return path.join(constant.APPLICATION_PLUGINS_DIR, 'node_modules', name)
        }
    }
    getPlugin(name) { 
        // 通过插件名获取插件
        const pluginDir = path.join(constant.APPLICATION_PLUGINS_DIR, 'node_modules/')
        
        // 2.通过require获取插件并传入ctx
        delete requireFunc.cache[requireFunc.resolve(pluginDir + name)];
        return requireFunc(pluginDir + name)(this.ctx) 
    }
}

export default PluginLoader;