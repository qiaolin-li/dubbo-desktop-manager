import path                     from 'path';
import pkg                      from '../../../package.json'
import os                       from 'os';
import fs                       from 'fs-extra';
import { app }                  from 'electron'


const IS_DEVELOPMENT = !!process.env.ELECTRON_RENDERER_URL


// TODO 新应用考虑写到 app.getPath('userData') 

const USER_HOME_DIR   = os.homedir();
const APPLICATION_DIR = `${USER_HOME_DIR}/.dubbo-desktop-manager`;

const APPLICATION_CONFIG_FILE = `${APPLICATION_DIR}/config.db`;
const APPLICATION_PLUGIN_CONFIG_DIR = `${APPLICATION_DIR}/plugin-config/`;
const APPLICATION_DATA_DIR = `${APPLICATION_DIR}/data/`;
const APPLICATION_TEMP_DIR = `${APPLICATION_DIR}/temp/`;

// TODO 这里渲染进程拿到的是 null, 但无所D谓
const APPLICATION_LOG_DIR = app ? app.getPath("logs") + '/' : "";
const APPLICATION_LOG_FILE = IS_DEVELOPMENT ? 'logs/all-logs.log' :  `${APPLICATION_LOG_DIR}/all-logs.log`;
const APPLICATION_LOG_ERROR_File = IS_DEVELOPMENT ? 'logs/error.log'    :  `${APPLICATION_LOG_DIR}/error.log`;


// 插件目录，分为内置插件和第三方插件
const APPLICATION_PLUGINS_DIR = `${APPLICATION_DIR}/plugins/`;
const APPLICATION_INTERNAL_PLUGINS_DIR = `${APPLICATION_DIR}/${pkg.version.replaceAll('.', '-')}/plugins/`
const APPLICATION_NPM_PATH_PREFIX = IS_DEVELOPMENT ? path.join(process.cwd(), 'node_modules/npm/') : path.join(process.resourcesPath, 'node_modules/npm/');

// 防止目录不存在
fs.ensureDirSync(APPLICATION_DIR);
fs.ensureDirSync(APPLICATION_DATA_DIR);
fs.ensureDirSync(APPLICATION_TEMP_DIR);
fs.ensureDirSync(APPLICATION_PLUGINS_DIR);
fs.ensureDirSync(APPLICATION_INTERNAL_PLUGINS_DIR);


export default Object.freeze({
    /** 当前应用版本 */
    VERSION: pkg.version,

    /** 是否是开发模式 */
    IS_DEVELOPMENT,

    /** 用户主目录  */
    USER_HOME_DIR,

    /** 应用目录 */
    APPLICATION_DIR,

    /** 应用配置文件位置 */
    APPLICATION_CONFIG_FILE,

    /** 应用数据目录 */
    APPLICATION_DATA_DIR,

    APPLICATION_LOG_DIR,
    APPLICATION_LOG_FILE,
    APPLICATION_LOG_ERROR_File,

    /** 应用NPM目录 */
    APPLICATION_NPM_PATH_PREFIX,

    /** 应用插件目录 */
    APPLICATION_PLUGINS_DIR,

    /** 应用内置插件目录 */
    APPLICATION_INTERNAL_PLUGINS_DIR,

    /** 插件包名前缀 */
    APPLICATION_PLUGINS_NAME_PREFIX: 'ddm-plugin-',

    /** 应用插件配置目录, 防止有恶意插件 */
    APPLICATION_PLUGIN_CONFIG_DIR,

    /** 应用临时目录 */
    APPLICATION_TEMP_DIR,

    /** 是否是macos */
    IS_MAC: process.platform === 'darwin',

    /** 通信模式为http时的端口 */
    API_HTTP_PORT: IS_DEVELOPMENT ? pkg.port.dev : pkg.port.prod,
    
    /** 初始化插件列表，主要是为了降低应用的大小 + 容易升级降级  */
    initPlugins: pkg.initPlugins || {},

    /** 主进程和渲染进程通信的通道 */
    COMMUNICATION_CHANNEL: "ipc-main-unify"
});
