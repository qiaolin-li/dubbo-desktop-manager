import type { AppConfig, Constant, Logger, MainPlugin } from './main';

/**
 * appMain 是宿主在主进程插件沙箱里注入的模块。
 */
declare const appMain: MainPlugin;

export default appMain;

/**
 * 应用配置访问对象。
 */
export declare const appConfig: AppConfig;

/**
 * 应用常量。
 */
export declare const constant: Constant;

/**
 * 当前插件专属日志对象。
 */
export declare const logger: Logger;
