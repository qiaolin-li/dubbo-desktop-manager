import Module                   from 'module';
import path                     from 'path';
import { Logger }               from '@/main/common/logger';

const logger = new Logger("ddm-RestrictedModuleLoader");

class RestrictedModuleLoader {

    constructor(pluginDir, pluginName, permissions = {}) {
        this.pluginDir = path.resolve(pluginDir);
        this.pluginName = pluginName;
        this.strict = permissions.strict === true;
        this.allowedBuiltins = permissions.builtins ?? null;
        this.allowedPackages = permissions.packages ?? null;
        this.blockedModules = permissions.blocked ?? [];
        this.moduleReplacements = new Map();
    }

    createRestrictedRequire(originalRequire) {
        const self = this;

        return function restrictedRequire(moduleName) {
            self.assertModuleAllowed(moduleName);

            if (self.moduleReplacements.has(moduleName)) {
                return self.moduleReplacements.get(moduleName);
            }

            return originalRequire(moduleName);
        };
    }

    assertModuleAllowed(moduleName) {
        this.#assertModuleAllowed(moduleName);
    }

    getModuleReplacement(moduleName) {
        return this.moduleReplacements.get(moduleName);
    }

    setModuleReplacement(moduleName, replacement) {
        this.moduleReplacements.set(moduleName, replacement);
    }

    #assertModuleAllowed(moduleName) {
        if (!this.strict) {
            return;
        }

        if (this.blockedModules.includes(moduleName)) {
            throw this.#buildError(`无权访问模块: ${moduleName}`);
        }

        if (this.#isBuiltin(moduleName) && Array.isArray(this.allowedBuiltins) && !this.allowedBuiltins.includes(moduleName)) {
            throw this.#buildError(`无权访问内置模块: ${moduleName}`);
        }

        if (this.#isPackage(moduleName)) {
            if (!Array.isArray(this.allowedPackages)) {
                throw this.#buildError(`未授权访问三方依赖: ${moduleName}`);
            }

            const packageName = moduleName.startsWith('@')
                ? moduleName.split('/').slice(0, 2).join('/')
                : moduleName.split('/')[0];

            if (!this.allowedPackages.includes(packageName)) {
                throw this.#buildError(`未授权访问三方依赖: ${moduleName}`);
            }
        }
    }

    #buildError(message) {
        const error = new Error(`插件 ${this.pluginName} ${message}`);
        logger.warn(error.message);
        return error;
    }

    #isBuiltin(moduleName) {
        return Module.builtinModules.includes(moduleName);
    }

    #isPackage(moduleName) {
        return !moduleName.startsWith('.') && !path.isAbsolute(moduleName) && !this.#isBuiltin(moduleName);
    }
}

export default RestrictedModuleLoader;
