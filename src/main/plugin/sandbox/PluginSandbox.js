import path                     from 'path';
import RestrictedFS             from './RestrictedFS.js';
import RestrictedAxios          from './RestrictedAxios.js';
import RestrictedModuleLoader   from './RestrictedModuleLoader.js';
import appConfig                from '@/main/common/config/appConfig.js';
import constant                 from '@/main/common/Constant.js';
import { Logger }               from '@/main/common/logger';

const logger = new Logger("ddm-PluginSandbox");

class PluginSandbox {

    constructor(appPlugin) {
        this.appPlugin = appPlugin;
        this.pluginName = appPlugin.pluginName;
        this.pluginDir = appPlugin.pluginDir;
        this.permissions = this.#loadPermissions();
        this.strict = this.permissions.strict === true;

        this.fs = new RestrictedFS(this.pluginName, this.permissions.filesystem);
        this.axios = new RestrictedAxios(this.pluginName, {
            allowedDomains: this.permissions.network.allowedDomains,
            maxRequestsPerSecond: this.permissions.network.maxRequestsPerSecond,
        });
        this.moduleLoader = new RestrictedModuleLoader(this.pluginDir, this.pluginName, this.permissions.modules);
        this.moduleLoader.setModuleReplacement('axios', this.axios);
        if (this.strict) {
            this.moduleLoader.setModuleReplacement('fs', this.fs);
            this.moduleLoader.setModuleReplacement('fs/promises', this.fs.promises);
        }
    }

    #loadPermissions() {
        const savedConfig = appConfig.getProperty(`pluginConfig.${this.pluginName}`) || {};
        const manifestConfig = this.appPlugin.sandboxConfig || {};

        const defaultPermissions = {
            strict: false,
            filesystem: {
                read: [this.pluginDir],
                write: [
                    this.pluginDir,
                    constant.APPLICATION_TEMP_DIR,
                    path.join(constant.APPLICATION_DATA_DIR, this.pluginName),
                ],
            },
            network: {
                allowedDomains: [],
                maxRequestsPerSecond: 10,
            },
            modules: {
                strict: false,
                builtins: null,
                packages: null,
                blocked: [
                    'child_process',
                    'cluster',
                    'dgram',
                    'dns',
                    'http',
                    'http2',
                    'https',
                    'module',
                    'net',
                    'tls',
                    'vm',
                    'worker_threads',
                ],
            },
            apis: [],
        };

        const savedPermissions = savedConfig.permissions || {};
        const mergedPermissions = {
            ...defaultPermissions,
            ...manifestConfig.permissions,
            ...savedPermissions,
        };

        mergedPermissions.filesystem = {
            ...defaultPermissions.filesystem,
            ...manifestConfig.permissions?.filesystem,
            ...savedPermissions.filesystem,
        };
        mergedPermissions.network = {
            ...defaultPermissions.network,
            ...manifestConfig.permissions?.network,
            ...savedPermissions.network,
        };
        mergedPermissions.modules = {
            ...defaultPermissions.modules,
            ...manifestConfig.permissions?.modules,
            ...savedPermissions.modules,
        };

        mergedPermissions.strict = manifestConfig.strict === true || savedPermissions.strict === true;
        mergedPermissions.modules.strict = mergedPermissions.strict || mergedPermissions.modules.strict === true;

        return mergedPermissions;
    }

    getRestrictedRequire(originalRequire) {
        return this.moduleLoader.createRestrictedRequire(originalRequire);
    }

    assertModuleAllowed(moduleName) {
        return this.moduleLoader.assertModuleAllowed(moduleName);
    }

    getModuleReplacement(moduleName) {
        return this.moduleLoader.getModuleReplacement(moduleName);
    }

    getSandboxedContext() {
        const apiGuard = (moduleName, methodName, fn) => (...args) => {
            this.checkAPIPermission(moduleName, methodName);
            return fn(...args);
        };

        const sandboxedPlugin = Object.create(Object.getPrototypeOf(this.appPlugin));
        Object.assign(sandboxedPlugin, this.appPlugin);

        sandboxedPlugin.fs = this.fs;
        sandboxedPlugin.axios = this.axios;
        sandboxedPlugin.notify = apiGuard('appPlugin', 'notify', this.appPlugin.notify.bind(this.appPlugin));
        sandboxedPlugin.exportPluginService = apiGuard('appPlugin', 'exportPluginService', this.appPlugin.exportPluginService.bind(this.appPlugin));
        sandboxedPlugin.DBUtils = this.#createMethodProxy('DBUtils', this.appPlugin.DBUtils);
        sandboxedPlugin.appConfig = this.#createMethodProxy('appConfig', this.appPlugin.appConfig);
        return Object.freeze(sandboxedPlugin);
    }

    #createMethodProxy(moduleName, target) {
        return new Proxy(target, {
            get: (currentTarget, prop) => {
                const value = currentTarget[prop];
                if (typeof value !== 'function') {
                    return value;
                }

                return (...args) => {
                    this.checkAPIPermission(moduleName, String(prop));
                    return value.apply(currentTarget, args);
                };
            },
        });
    }

    checkAPIPermission(moduleName, method) {
        if (!Array.isArray(this.permissions.apis) || this.permissions.apis.length === 0) {
            return true;
        }

        const fullPath = `${moduleName}.${method}`;
        const isAllowed = this.permissions.apis.some((api) => {
            if (typeof api === 'string') {
                return fullPath === api || fullPath.startsWith(`${api}.`);
            }

            return api instanceof RegExp ? api.test(fullPath) : false;
        });

        if (!isAllowed) {
            const error = new Error(`插件 ${this.pluginName} 无权调用 API: ${fullPath}`);
            logger.warn(error.message);
            throw error;
        }

        return true;
    }

    updatePermissions(newPermissions) {
        const currentConfig = appConfig.getProperty(`pluginConfig.${this.pluginName}`) || {};
        appConfig.setProperty(`pluginConfig.${this.pluginName}`, {
            ...currentConfig,
            permissions: {
                ...(currentConfig.permissions || {}),
                ...newPermissions,
            },
        });
    }
}

export default PluginSandbox;
