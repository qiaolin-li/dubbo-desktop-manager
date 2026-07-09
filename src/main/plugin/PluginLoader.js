import fs                           from 'fs';
import path                         from 'path';
import Module                       from 'module';
import AppPlugin                    from '@/main/plugin/AppPlugin.js';
import { Logger }                   from '@/main/common/logger';
// import ModuleLoadInterceptor        from '@/main/plugin/sandbox/ModuleLoadInterceptor.js';
// import PluginSandbox                from '@/main/plugin/sandbox/PluginSandbox.js';

const logger = new Logger("ddm-PluginLoader");

/**
 * @typedef {import('./PluginManager.js').default} PluginManager
 * @typedef {import('./AppPlugin.js').default} AppPlugin
 */
class PluginLoader {

    /**
     * 插件沙箱，这是一个简单模拟，
     * Map<插件路径, {'appMain': 对象, 'axios': 对象}>
     */
    #pluginSandboxes = new Map();

    /**
     * @param {PluginManager} pluginManager
     */
    constructor(pluginManager) {
        this.pluginManager = pluginManager;
        this.pluginStateMap = new WeakMap();

        // ModuleLoadInterceptor.install();

        // 暂时顶一顶
        const originalLoad = Module._load;
        const self = this;
        Module._load = function interceptedLoad(request, parent, isMain) {
            let sandbox = null;
            if(parent && parent.filename) {
                const resolvedPath = path.resolve(parent.filename);
                for (const [pluginDir, sandboxObj] of self.#pluginSandboxes) {
                    if (resolvedPath === pluginDir || resolvedPath.startsWith(`${pluginDir}${path.sep}`)) {
                        sandbox =  sandboxObj;
                    }
                }
            }
            // if(parent.filename.indexOf('dubbo-support') >= 0){
            //     console.log(" ----------------------  ")
            //     console.log(parent.filename, request, sandbox ? "找到了": "没找到")
            //     console.log(self.pluginSandboxes.keys())
            //     console.log(" ----------------------  ")
            // }
            if (sandbox) {
                const replacement = sandbox[request];
                if (replacement) {
                    return replacement;
                }
            }
            return originalLoad.call(this, request, parent, isMain);
        };
    }

    async load(pluginName, pluginDir) {
        let appPlugin = null;
        let state = null;
        try {
            appPlugin = new AppPlugin(pluginName);
            if (!appPlugin.mainPath && !appPlugin.rendererPath && !appPlugin.i18nPath) {
                return null;
            }

            logger.info(`插件加载 [${pluginName}] 开始，插件目录: ${appPlugin.pluginDir}`);
            // const sandbox = new PluginSandbox(appPlugin);
            state = {
                // sandbox,
                mainModule: null,
                i18nModule: null,
                sandboxDirs: [],
            };
            this.pluginStateMap.set(appPlugin, state);

            if (appPlugin.i18nPath) {
                state.i18nModule = this.requirePlugin(appPlugin.i18nPath, null, pluginDir)(appPlugin.geti18nRegistrar());
                await state.i18nModule?.install?.();
                logger.info(`插件加载 [${pluginName}] 加载 i18n 模块 install 完毕`);
            }

            if (appPlugin.mainPath) {
                // const sandboxedContext = sandbox.getSandboxedContext();
                // sandbox.moduleLoader.setModuleReplacement('appMain', sandboxedContext);
                
                const sandbox = {
                    appMain: appPlugin,
                    axios: appPlugin.axios,
                    constant: appPlugin.constant,
                    logger: appPlugin.logger,
                    appConfig: appPlugin.appConfig,
                }

                this.#registerPluginSandbox(state, pluginDir, sandbox);
                this.#registerPluginSandbox(state, appPlugin.pluginDir, sandbox);
                this.#registerPluginSandbox(state, fs.realpathSync(appPlugin.pluginDir), sandbox);

                state.mainModule = this.requirePlugin(appPlugin.mainPath, sandbox, pluginDir)(appPlugin);
                await state.mainModule?.install?.();
                logger.info(`插件加载 [${pluginName}] 加载 main 模块 install 完毕`);
            }

            return appPlugin;
        } catch (error) {
            await state?.mainModule?.uninstall?.();
            await state?.i18nModule?.uninstall?.();
            if (appPlugin) {
                appPlugin.uninstall();
                // ModuleLoadInterceptor.unregisterPlugin(appPlugin.pluginDir);
                this.#unregisterPluginSandboxes(state);
                this.pluginStateMap.delete(appPlugin);
            }
            logger.error(`plugin load failed [${pluginName}]`, error);
            throw new Error(`插件加载 [${pluginName}] 失败，错误原因：${error}`)
        }
    }

    async unload(appPlugin) {
        if (!appPlugin) {
            return;
        }

        const state = this.pluginStateMap.get(appPlugin);
        try {
            await state?.mainModule?.uninstall?.();
            await state?.i18nModule?.uninstall?.();
            appPlugin.uninstall();
        } finally {
            // if (state?.sandbox) {
            //     ModuleLoadInterceptor.unregisterPlugin(appPlugin.pluginDir);
            // }
            this.#unregisterPluginSandboxes(state);
            this.pluginStateMap.delete(appPlugin);
        }
    }

    #registerPluginSandbox(state, pluginDir, sandbox) {
        if(!pluginDir) {
            return;
        }

        const resolvedPluginDir = path.resolve(pluginDir);
        this.#pluginSandboxes.set(resolvedPluginDir, sandbox);
        state?.sandboxDirs?.push(resolvedPluginDir);
    }

    #unregisterPluginSandboxes(state) {
        state?.sandboxDirs?.forEach(pluginDir => this.#pluginSandboxes.delete(pluginDir));
        if(state?.sandboxDirs) {
            state.sandboxDirs = [];
        }
    }

    requirePlugin(entryPath, sandbox = null, pluginDir) {
        const createRequire = Module.createRequire(entryPath);
        // if (sandbox) {
            // if(pluginDir) {
            //     ModuleLoadInterceptor.registerPlugin(pluginDir, sandbox);
            // }
            // ModuleLoadInterceptor.registerPlugin(sandbox.pluginDir, sandbox);
            // ModuleLoadInterceptor.registerPlugin(fs.realpathSync(sandbox.pluginDir), sandbox);
/* 
            if(pluginDir) {
                this.#pluginSandboxes.set(pluginDir, sandbox);
            }
            this.#pluginSandboxes.set(sandbox.pluginDir, sandbox);
            this.#pluginSandboxes.set(fs.realpathSync(sandbox.pluginDir), sandbox);
        } */

        const resolvedPath = createRequire.resolve(entryPath);
        if (createRequire.cache && createRequire.cache[resolvedPath]) {
            delete createRequire.cache[resolvedPath];
        }
        return createRequire(entryPath);
    }
}

export default PluginLoader;
