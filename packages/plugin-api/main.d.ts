import type axios from 'axios';

/**
 * 主进程插件可访问的应用配置能力。
 */
export interface AppConfig {
    /**
     * 判断全局配置项是否存在。
     */
    hasProperty(key: string): boolean;

    /**
     * 获取全局配置项。
     */
    getProperty<T = any>(key: string): T;

    /**
     * 设置当前插件命名空间下的配置项。
     */
    setPluginProperty(key: string, value: any): any;

    /**
     * 判断当前插件命名空间下的配置项是否存在。
     */
    hasPluginProperty(key: string): boolean;

    /**
     * 获取当前插件命名空间下的配置项。
     */
    getPluginProperty<T = any>(key: string): T;

    /**
     * 获取当前插件命名空间下的全部配置。
     */
    getPluginProperties<T = Record<string, any>>(): T;
}

/**
 * DDM 宿主暴露给插件的常量集合。
 */
export interface Constant {
    /**
     * 当前应用版本号。
     */
    VERSION: string;

    /**
     * 是否为开发模式。
     */
    IS_DEVELOPMENT: boolean;

    /**
     * 当前用户主目录。
     */
    USER_HOME_DIR: string;

    /**
     * 应用根目录。
     */
    APPLICATION_DIR: string;

    /**
     * 应用配置文件路径。
     */
    APPLICATION_CONFIG_FILE: string;

    /**
     * 应用数据目录。
     */
    APPLICATION_DATA_DIR: string;

    /**
     * 应用日志目录。
     */
    APPLICATION_LOG_DIR: string;

    /**
     * 应用普通日志文件路径。
     */
    APPLICATION_LOG_FILE: string;

    /**
     * 应用错误日志文件路径。
     */
    APPLICATION_LOG_ERROR_File: string;

    /**
     * 应用内置 npm 路径前缀。
     */
    APPLICATION_NPM_PATH_PREFIX: string;

    /**
     * 用户插件安装目录。
     */
    APPLICATION_PLUGINS_DIR: string;

    /**
     * 内置插件目录。
     */
    APPLICATION_INTERNAL_PLUGINS_DIR: string;

    /**
     * DDM 插件包名前缀。
     */
    APPLICATION_PLUGINS_NAME_PREFIX: string;

    /**
     * 插件配置目录。
     */
    APPLICATION_PLUGIN_CONFIG_DIR: string;

    /**
     * 应用临时目录。
     */
    APPLICATION_TEMP_DIR: string;

    /**
     * 当前系统是否为 macOS。
     */
    IS_MAC: boolean;

    /**
     * 本地 API HTTP 服务端口。
     */
    API_HTTP_PORT: number;

    /**
     * 应用初始化时需要安装的插件版本表。
     */
    initPlugins: Record<string, string>;

    /**
     * 主渲染通信频道名称。
     */
    COMMUNICATION_CHANNEL: string;
}

/**
 * 插件专属日志对象，日志会带上插件标识。
 */
export interface Logger {
    /**
     * 输出调试日志。
     */
    debug(content: any, ...args: any[]): void;

    /**
     * 输出普通信息日志。
     */
    info(content: any, ...args: any[]): void;

    /**
     * 输出警告日志。
     */
    warn(content: any, ...args: any[]): void;

    /**
     * 输出错误日志。
     */
    error(content: any, ...args: any[]): void;
}

/**
 * 系统通知内容。
 */
export interface NotifyInfo {
    /**
     * 通知标题。
     */
    title: string;

    /**
     * 通知正文。
     */
    body?: any;

    /**
     * 允许宿主通知实现扩展额外字段。
     */
    [key: string]: any;
}

/**
 * 插件国际化注册器，用于写入全局语言包或当前插件语言包。
 */
export interface I18nRegistrar {
    /**
     * 添加或覆盖宿主全局语言包。
     */
    addLocaleMessage(locale: string, message: Record<string, any>): void;

    /**
     * 添加当前插件自己的语言包，会写入 pluginLocale.{pluginName}。
     */
    addPluginLocaleMessage(locale: string, message: Record<string, any>): void;
}

/**
 * 宿主导出的数据库工具集合，具体方法由 DDM 运行时提供。
 */
export interface DBUtils {
    /**
     * 宿主 DBUtils 上的动态工具方法。
     */
    [key: string]: any;
}

/**
 * 主进程插件入口拿到的宿主对象。
 */
export interface MainPlugin {
    /**
     * 当前插件安装目录。
     */
    readonly pluginDir: string;

    /**
     * 当前插件 package.json 内容。
     */
    readonly packageJson: Record<string, any>;

    /**
     * 插件唯一 ID，格式为 name@version。
     */
    readonly pluginId: string;

    /**
     * 插件 npm 包名。
     */
    readonly pluginName: string;

    /**
     * 插件显示名称。
     */
    readonly pluginNickName: string;

    /**
     * 插件版本号。
     */
    readonly version: string;

    /**
     * 插件作者信息。
     */
    readonly author: string;

    /**
     * 插件描述。
     */
    readonly description: string;

    /**
     * 插件 logo 文件地址。
     */
    readonly logo: string;

    /**
     * 插件 README 文件地址。
     */
    readonly readme: string;

    /**
     * 插件主进程入口路径，不存在时为 null。
     */
    readonly mainPath: string | null;

    /**
     * 插件渲染进程入口路径，不存在时为 null。
     */
    readonly rendererPath: string | null;

    /**
     * 插件国际化入口路径，不存在时为 null。
     */
    readonly i18nPath: string | null;

    /**
     * 插件沙箱配置。
     */
    readonly sandboxConfig: Record<string, any>;

    /**
     * 宿主提供的 axios 实例。
     */
    readonly axios: typeof axios;

    /**
     * 应用配置访问对象。
     */
    readonly appConfig: AppConfig;

    /**
     * 应用常量。
     */
    readonly constant: Constant;

    /**
     * 当前插件专属日志对象。
     */
    readonly logger: Logger;

    /**
     * 宿主数据库工具集合。
     */
    readonly DBUtils: DBUtils;

    /**
     * 使用宿主全局语言包翻译。
     */
    t(key: string, ...args: any[]): string;

    /**
     * 使用当前插件语言包翻译。
     */
    pluginT(key: string, ...args: any[]): string;

    /**
     * 发送系统通知。
     */
    notify(notifyInfo: NotifyInfo): void;

    /**
     * 暴露一个主进程服务，供渲染进程通过 referenceService 调用。
     */
    exportPluginService(moduleName: string, target: object): void;

    /**
     * 获取插件国际化注册器。
     */
    geti18nRegistrar(): I18nRegistrar;

    /**
     * 卸载当前插件。
     */
    uninstall(): void;
}

/**
 * 插件入口返回的安装对象，宿主会调用 install，可选调用 uninstall。
 */
export interface PluginInstallable {
    /**
     * 插件加载时调用。
     */
    install(): void | Promise<void>;

    /**
     * 插件卸载时调用。
     */
    uninstall?(): void | Promise<void>;
}

/**
 * 主进程入口函数类型，对应 package.json 的 main 字段。
 */
export type MainEntry = (appMain: MainPlugin) => PluginInstallable;
