import Module               from 'module';
import path                 from 'path';
import { Logger }           from '@/main/common/logger';

const logger = new Logger("ddm-ModuleLoadInterceptor");

class ModuleLoadInterceptor {

    constructor() {
        this.pluginSandboxes = new Map();
        this.installed = false;
        this.originalLoad = null;
    }

    install() {
        if (this.installed) {
            return;
        }

        this.originalLoad = Module._load;
        const self = this;
        Module._load = function interceptedLoad(request, parent, isMain) {
            const sandbox = parent && parent.filename ? self.#getSandbox(parent.filename) : null;
            // if(parent.filename.indexOf('dubbo-support') >= 0){
            //     console.log(" ----------------------  ")
            //     console.log(parent.filename, request, sandbox ? "找到了": "没找到")
            //     console.log(self.pluginSandboxes.keys())
            //     console.log(" ----------------------  ")
            // }
            if (sandbox) {
                sandbox.assertModuleAllowed(request);
                const replacement = sandbox.getModuleReplacement(request);
                if (replacement) {
                    return replacement;
                }
            }

            return self.originalLoad.call(this, request, parent, isMain);
        };

        this.installed = true;
        logger.info('Plugin module interceptor installed');
    }

    registerPlugin(pluginDir, sandbox) {
        this.pluginSandboxes.set(path.resolve(pluginDir), sandbox);
    }

    unregisterPlugin(pluginDir) {
        this.pluginSandboxes.delete(path.resolve(pluginDir));
    }

    #getSandbox(filename) {
        const resolvedPath = path.resolve(filename);
        for (const [pluginDir, sandbox] of this.pluginSandboxes) {
            if (resolvedPath === pluginDir || resolvedPath.startsWith(`${pluginDir}${path.sep}`)) {
                return sandbox;
            }
        }

        return null;
    }
}

export default new ModuleLoadInterceptor();
