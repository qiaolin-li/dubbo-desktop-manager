import { ipcRenderer, contextBridge}         from 'electron';
import fs                                    from 'fs';
import path                                  from 'path';
import constant                              from '@/main/common/Constant.js'
import appConfig                             from "@/main/common/config/appConfig"

import appBridgeInfo                         from "@/main/preload/index.js";
import appIpc                                from "@/main/preload/AppIpc.js";
import appWindow                             from "@/main/preload/appWindow.js";

/**
 * 常量，任何人都可以使用的
 */
contextBridge.exposeInMainWorld('constant', {
    ...constant,
    platform:process.platform
});

/**
 * 一些较为安全的能力
 */
contextBridge.exposeInMainWorld('appRuntime', {
    isDeveloperMode: () => appConfig.getProperty('developer-mode'),


    // 系统语言
    getSystemLocale:() => appConfig.getProperty("systemLocale"),

    // 主题相关
    getThemeMode: () => appConfig.getProperty('themeMode'),
    getPreferredDarkThemeId: () => appConfig.getProperty('preferredDarkThemeId'),
    getPreferredLightThemeId: () => appConfig.getProperty('preferredLightThemeId'),
    getIconThemeId: () => appConfig.getProperty('iconThemeId'),
    getUIFontFamily: () => appConfig.getProperty('uiFontFamily'),

    // 在新窗口中打开 JSON 编辑器
    openStandaloneJsonEditor: (payload) => appWindow.openStandaloneJsonEditor(payload),
    getStandaloneJsonEditorPayload: (windowKey) => appWindow.getStandaloneJsonEditorPayload(windowKey)
});


/**
 * ipc 调用器
 */
let isUnifyInvokeUsed = false;
contextBridge.exposeInMainWorld('createUnifyInvoker', () => {
    if(isUnifyInvokeUsed){
        throw new Error("unifyInvoker 已经被获取的，不可再次获取");
    }
    isUnifyInvokeUsed = true

    // 接收响应的通道
    const COMMUNICATION_CONSUMER_CHANNEL = `ipc-rendenerer-unify_${Math.random()}`;

    return {
        /**
         * 发送请求
         * @param {*} invocation 
         */
        send: (invocation) => {
            invocation.replyChannel = COMMUNICATION_CONSUMER_CHANNEL;
            ipcRenderer.send(constant.COMMUNICATION_CHANNEL, invocation)
        },

        /**
         * 接受响应
         * @param {*} callback 
         * @returns 
         */
        on: (callback) => appIpc.on(COMMUNICATION_CONSUMER_CHANNEL, callback)
    }
});

/**
 * 系统核心桥接
 */
let isUsed = false;
contextBridge.exposeInMainWorld("ddmBridge", () =>{
    if(isUsed){
        throw new Error("ddmBridge 已经被使用过了，不能重复使用");
    }
    isUsed = true;
    return {
        ...appBridgeInfo,
        //其实并不好用，这里还存在问题，他是从插件的根目录加载的，如果你的渲染进程入口js在其他目录下，引入插件内的模块，可能要从根目录开始算
        pluginHelper: (pluginDir, pluginName) => {
            const resolvedPluginDir = path.resolve(pluginDir);
            return {
                requireModule: (moduleName) => {
                    // 1. 处理相对路径 require('./utils')
                    let fullPath = path.resolve(resolvedPluginDir, moduleName);
                    if (!fullPath.endsWith('.js')) fullPath += '.js';

                    // 2. 处理 node_modules (如果是插件自带的)
                    if (!moduleName.startsWith('.') && !path.isAbsolute(moduleName)) {
                        fullPath = path.join(resolvedPluginDir, 'node_modules', moduleName, 'index.js'); // 简化逻辑
                    }

                    // 使用相对路径判断，避免同前缀目录绕过插件目录限制
                    const relativePath = path.relative(resolvedPluginDir, fullPath);
                    if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
                        throw new Error("禁止访问插件目录之外的文件");
                    }
                    if (fs.existsSync(fullPath)) {
                        // 1. 统一斜杠
                        let path = fullPath.replace(/\\/g, '/');
                        // 寻找 pluginName 之后的路径
                        const index = path.indexOf(pluginName);
                        if (index !== -1) {
                            path = path.substring(index + pluginName.length);
                        }
                        return fs.readFileSync(fullPath, 'utf8') + `\n//# sourceURL=${pluginName}://${path}`;
                    }
                    return null;
                }
            }
        }
    }
});
