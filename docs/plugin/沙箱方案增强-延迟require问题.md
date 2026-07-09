# 延迟 require 问题（索引）

“延迟 require 绕过（临时替换 `Module.prototype.require`）”的漏洞与修复方案，已并入：

- `docs/plugin/沙箱方案设计.md`（方案一：require 持久化拦截，推荐拦截 `Module._load`）

本文件仅保留为历史索引，避免多份文档重复维护导致内容不一致。

# 延迟 require 的安全漏洞及解决方案

## 问题分析

### 漏洞场景

如果使用临时替换 `Module.prototype.require` 的方式：

```javascript
_loadWithRestrictedRequire(modulePath, restrictedRequire, sandboxedPlugin) {
    const originalRequire = Module.prototype.require;
    
    try {
        // 临时替换
        Module.prototype.require = restrictedRequire;
        
        // 加载插件
        const pluginModule = require(modulePath);
        return pluginModule;
    } finally {
        // ⚠️ 立即恢复原始 require
        Module.prototype.require = originalRequire;
    }
}
```

**恶意插件可以这样绕过：**

```javascript
// 插件代码 (main.js)
module.exports = function(plugin) {
    // 方法1：使用 setTimeout
    setTimeout(() => {
        const fs = require('fs');  // ✅ 成功！此时已经恢复原始 require
        fs.readFileSync('/etc/passwd');
    }, 100);
    
    // 方法2：使用 Promise
    Promise.resolve().then(() => {
        const { exec } = require('child_process');  // ✅ 成功！
        exec('rm -rf ~/*');
    });
    
    // 方法3：使用事件
    process.nextTick(() => {
        const os = require('os');  // ✅ 成功！
        console.log(os.homedir());
    });
    
    // 方法4：在回调中
    plugin.axios.get('http://example.com').then(() => {
        const http = require('http');  // ✅ 成功！
    });
    
    return {
        install: async () => {
            // 方法5：异步函数中
            await new Promise(resolve => setTimeout(resolve, 100));
            const net = require('net');  // ✅ 成功！
        }
    };
};
```

### 问题根源

1. **临时替换的时机问题**
   - 只在加载插件时临时替换
   - 加载完成后立即恢复
   - 延迟执行的代码使用的是恢复后的原始 require

2. **Node.js require 的机制**
   - `require` 是全局函数，所有模块共享
   - 无法为单个模块"绑定"特定的 require
   - 一旦恢复，所有后续调用都使用原始版本

---

## 解决方案

### 方案一：持久化替换 + 调用栈追踪（推荐）

**核心思路：** 不恢复 require，而是通过调用栈判断是否是插件代码在调用。

```javascript
// src/main/plugin/sandbox/PluginRequireInterceptor.js
import Module from 'module';
import path from 'path';
import logger from '@/main/common/logger';

/**
 * 插件 require 拦截器
 * 通过调用栈追踪来判断是否是插件代码在调用 require
 */
class PluginRequireInterceptor {
    constructor() {
        // 插件目录映射：目录路径 -> 受限 require 函数
        this.pluginRequires = new Map();
        
        // 是否已安装拦截器
        this.installed = false;
    }

    /**
     * 安装全局拦截器（只安装一次）
     */
    install() {
        if (this.installed) {
            return;
        }

        const self = this;
        const originalRequire = Module.prototype.require;

        // 替换全局 require
        Module.prototype.require = function(id) {
            // 获取调用栈
            const stack = new Error().stack;
            
            // 查找调用者是否是插件代码
            const callerRequire = self._findPluginRequire(stack);
            
            if (callerRequire) {
                // 使用插件的受限 require
                return callerRequire.call(this, id);
            }
            
            // 非插件代码，使用原始 require
            return originalRequire.call(this, id);
        };

        this.installed = true;
        logger.info('插件 require 拦截器已安装');
    }

    /**
     * 从调用栈中查找插件 require
     */
    _findPluginRequire(stack) {
        if (!stack) {
            return null;
        }

        const stackLines = stack.split('\n');
        
        // 遍历调用栈，找到第一个插件文件的调用
        for (const line of stackLines) {
            // 提取文件路径（不同平台的格式可能不同）
            const match = line.match(/\((.+):\d+:\d+\)/) || line.match(/at (.+):\d+:\d+/);
            if (!match) {
                continue;
            }

            const filePath = match[1];
            
            // 检查是否是插件目录
            for (const [pluginDir, restrictedRequire] of this.pluginRequires) {
                if (filePath.startsWith(pluginDir)) {
                    return restrictedRequire;
                }
            }
        }

        return null;
    }

    /**
     * 注册插件的受限 require
     */
    registerPlugin(pluginDir, restrictedRequire) {
        const resolvedDir = path.resolve(pluginDir);
        this.pluginRequires.set(resolvedDir, restrictedRequire);
        logger.debug(`注册插件 require: ${resolvedDir}`);
    }

    /**
     * 注销插件的受限 require
     */
    unregisterPlugin(pluginDir) {
        const resolvedDir = path.resolve(pluginDir);
        this.pluginRequires.delete(resolvedDir);
        logger.debug(`注销插件 require: ${resolvedDir}`);
    }
}

// 单例
export default new PluginRequireInterceptor();
```

**使用方式：**

```javascript
// PluginLoader.js
import pluginRequireInterceptor from '@/main/plugin/sandbox/PluginRequireInterceptor.js';

class PluginLoader {
    constructor(pluginManager) {
        this.pluginManager = pluginManager;
        
        // 安装全局拦截器（只安装一次）
        pluginRequireInterceptor.install();
    }

    async load(pluginName, source = null) {
        try {
            const appPlugin = new AppPlugin(pluginName, source);
            // ... 创建沙箱和受限 require ...
            
            // 注册插件的受限 require
            pluginRequireInterceptor.registerPlugin(
                appPlugin.pluginDir,
                restrictedRequire
            );
            
            try {
                // 加载插件（此时所有 require 调用都会被拦截）
                const pluginModule = require(appPlugin.mainPath);
                // ...
            } finally {
                // 注意：不要立即注销，因为可能有延迟的 require
                // 只在插件卸载时注销
            }
            
            // 保存引用，用于卸载时注销
            appPlugin._requireInterceptor = pluginRequireInterceptor;
            appPlugin._pluginDir = appPlugin.pluginDir;
            
            return appPlugin;
        } catch (error) {
            // ...
        }
    }
}

// 卸载插件时
async unload(pluginName) {
    const plugin = this.pluginManager.get(pluginName);
    if (plugin && plugin._requireInterceptor) {
        plugin._requireInterceptor.unregisterPlugin(plugin._pluginDir);
    }
}
```

**优点：**
- ✅ 可以拦截延迟的 require
- ✅ 不影响其他代码
- ✅ 性能开销小

**缺点：**
- ⚠️ 调用栈解析可能有性能开销（可优化）
- ⚠️ 某些边缘情况可能无法正确识别

---

### 方案二：Module._load 拦截（更底层）

**核心思路：** 拦截更底层的 `Module._load`，通过 `parent` 参数判断调用者。

```javascript
// src/main/plugin/sandbox/ModuleLoadInterceptor.js
import Module from 'module';
import path from 'path';
import logger from '@/main/common/logger';

class ModuleLoadInterceptor {
    constructor() {
        this.pluginRequires = new Map();
        this.installed = false;
    }

    install() {
        if (this.installed) {
            return;
        }

        const self = this;
        const originalLoad = Module._load;

        // 拦截 Module._load（这是 require 的底层实现）
        Module._load = function(id, parent) {
            // 检查 parent 是否是插件模块
            if (parent && parent.filename) {
                const restrictedRequire = self._getPluginRequire(parent.filename);
                if (restrictedRequire) {
                    // 使用插件的受限 require
                    return restrictedRequire.call(this, id);
                }
            }
            
            // 非插件代码，使用原始加载
            return originalLoad.call(this, id, parent);
        };

        this.installed = true;
        logger.info('Module._load 拦截器已安装');
    }

    _getPluginRequire(filename) {
        const resolvedPath = path.resolve(filename);
        
        for (const [pluginDir, restrictedRequire] of this.pluginRequires) {
            if (resolvedPath.startsWith(pluginDir)) {
                return restrictedRequire;
            }
        }
        
        return null;
    }

    registerPlugin(pluginDir, restrictedRequire) {
        const resolvedDir = path.resolve(pluginDir);
        this.pluginRequires.set(resolvedDir, restrictedRequire);
    }

    unregisterPlugin(pluginDir) {
        const resolvedDir = path.resolve(pluginDir);
        this.pluginRequires.delete(resolvedDir);
    }
}

export default new ModuleLoadInterceptor();
```

**优点：**
- ✅ 更底层，更可靠
- ✅ 通过 parent 参数直接判断，无需解析调用栈
- ✅ 性能更好

**缺点：**
- ⚠️ `Module._load` 是内部 API，可能在不同 Node.js 版本中变化
- ⚠️ 需要处理 parent 为 null 的情况

---

### 方案三：包装插件模块（最安全但复杂）

**核心思路：** 在插件模块加载时，替换模块内部的 require。

```javascript
_loadWithRestrictedRequire(modulePath, restrictedRequire, sandboxedPlugin) {
    const Module = require('module');
    
    // 读取插件代码
    const fs = require('fs');
    const code = fs.readFileSync(modulePath, 'utf8');
    
    // 包装代码：替换 require
    const wrappedCode = `
        (function(module, exports, __dirname, __filename) {
            // 保存原始 require
            const originalRequire = require;
            
            // 创建受限的 require（闭包捕获）
            const restrictedRequire = ${restrictedRequire.toString()};
            
            // 替换当前模块的 require
            const require = function(id) {
                return restrictedRequire.call(this, id);
            };
            
            // 执行插件代码
            ${code}
        })
    `;
    
    // 使用 vm 执行包装后的代码
    const vm = require('vm');
    const script = new vm.Script(wrappedCode);
    const context = vm.createContext({
        module: { exports: {} },
        exports: {},
        __dirname: path.dirname(modulePath),
        __filename: modulePath,
        console,
        // ... 其他需要的全局对象
    });
    
    script.runInContext(context);
    return context.module.exports;
}
```

**优点：**
- ✅ 完全隔离，插件无法访问原始 require
- ✅ 即使延迟执行也能拦截

**缺点：**
- ⚠️ 实现复杂
- ⚠️ 需要处理模块系统（exports、module.exports 等）
- ⚠️ 可能破坏某些插件代码

---

## 推荐方案

**推荐使用方案二：Module._load 拦截**

原因：
1. 性能好（无需解析调用栈）
2. 可靠性高（通过 parent 直接判断）
3. 实现相对简单
4. 可以拦截所有 require（包括延迟的）

---

## 完整实现示例

```javascript
// src/main/plugin/PluginLoader.js (完整版)
import AppPlugin from '@/main/plugin/AppPlugin.js';
import PluginSandbox from '@/main/plugin/sandbox/PluginSandbox.js';
import RestrictedModuleLoader from '@/main/plugin/sandbox/RestrictedModuleLoader.js';
import ModuleLoadInterceptor from '@/main/plugin/sandbox/ModuleLoadInterceptor.js';
import logger from '@/main/common/logger';
import appConfig from '@/main/common/config/appConfig.js';
import Module from 'module';

class PluginLoader {
    constructor(pluginManager) {
        this.pluginManager = pluginManager;
        
        // 安装全局拦截器（只安装一次）
        ModuleLoadInterceptor.install();
    }

    async load(pluginName, source = null) {
        try {
            const appPlugin = new AppPlugin(pluginName, source);
            if(!appPlugin.mainPath && !appPlugin.rendererPath && !appPlugin.i18nPath){
                return null;
            }
            
            logger.info(`插件加载[${pluginName}]-开始 pluginPath:${appPlugin.pluginDir}`);
            
            // 读取插件配置
            const pluginConfig = appConfig.getProperty(`pluginConfig.${pluginName}`) || {};
            
            // 创建沙箱环境
            const sandbox = new PluginSandbox(appPlugin, pluginConfig);
            const sandboxedPlugin = sandbox.getSandboxedContext();
            
            // 创建受限的模块加载器
            const moduleLoader = new RestrictedModuleLoader(
                appPlugin.pluginDir,
                pluginName,
                pluginConfig.permissions || {}
            );
            
            // 设置模块替换
            moduleLoader.setModuleReplacement('fs', sandboxedPlugin.fs);
            
            // 创建受限的 require
            const originalRequire = Module.prototype.require;
            const restrictedRequire = moduleLoader.createRestrictedRequire(originalRequire);
            
            // 注册插件的受限 require（持久化，不恢复）
            ModuleLoadInterceptor.registerPlugin(
                appPlugin.pluginDir,
                restrictedRequire
            );
            
            try {
                // 清除缓存
                delete require.cache[require.resolve(appPlugin.mainPath)];
                
                // 加载插件（所有 require 调用都会被拦截）
                const pluginModule = require(appPlugin.mainPath);
                
                // 处理模块导出
                let installableModule = pluginModule;
                if (typeof pluginModule === 'function') {
                    installableModule = pluginModule(sandboxedPlugin);
                } else if (pluginModule.default && typeof pluginModule.default === 'function') {
                    installableModule = pluginModule.default(sandboxedPlugin);
                }
                
                if (installableModule && typeof installableModule.install === 'function') {
                    await installableModule.install();
                    logger.info(`插件加载[${pluginName}]-调用main install 完毕`);
                }
            } catch (error) {
                // 加载失败，注销拦截
                ModuleLoadInterceptor.unregisterPlugin(appPlugin.pluginDir);
                throw error;
            }
            
            // 保存引用（用于卸载时注销）
            appPlugin._sandbox = sandbox;
            appPlugin._moduleLoader = moduleLoader;
            appPlugin._pluginDir = appPlugin.pluginDir;
            
            return appPlugin;
        } catch (error) {
            logger.error(`插件加载-[${pluginName}]-失败`, error);
            throw new Error(`插件${pluginName}加载失败，错误原因：${error}`)
        }
    }
    
    /**
     * 卸载插件
     */
    unload(pluginName) {
        const plugin = this.pluginManager.get(pluginName);
        if (plugin && plugin._pluginDir) {
            ModuleLoadInterceptor.unregisterPlugin(plugin._pluginDir);
            logger.info(`插件 ${pluginName} 的 require 拦截已注销`);
        }
    }
}
```

---

## 测试用例

```javascript
// 测试延迟 require
const maliciousPlugin = `
module.exports = function(plugin) {
    // 延迟 require
    setTimeout(() => {
        try {
            const fs = require('fs');
            fs.readFileSync('/etc/passwd');
            console.log('❌ 安全漏洞：成功绕过限制！');
        } catch (error) {
            console.log('✅ 安全：延迟 require 被正确拦截');
        }
    }, 100);
    
    return {
        install: async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            try {
                const { exec } = require('child_process');
                exec('echo test');
                console.log('❌ 安全漏洞：成功绕过限制！');
            } catch (error) {
                console.log('✅ 安全：异步 require 被正确拦截');
            }
        }
    };
};
`;
```

---

## 总结

1. **临时替换 require 有严重漏洞** - 延迟执行的 require 会绕过限制
2. **必须使用持久化拦截** - 通过 Module._load 或调用栈追踪
3. **推荐方案** - Module._load 拦截，性能好且可靠
4. **卸载时记得注销** - 避免内存泄漏
