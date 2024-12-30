import path                     from 'path';
import pkg                      from '../../../package.json'
import os                       from 'os';
import fs                       from 'fs-extra';

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production'

const USER_HOME_DIR = os.homedir();
const APPLICATION_DIR = `${USER_HOME_DIR}/.dubbo-desktop-manager`;
const APPLICATION_CONFIG_FILE = `${APPLICATION_DIR}/config.db`;
const APPLICATION_DATA_DIR = `${APPLICATION_DIR}/data/`;
const APPLICATION_LOG_DIR = `${APPLICATION_DIR}/log/`
const APPLICATION_LOG_ERROR_File = `${APPLICATION_LOG_DIR}/error.log`
const APPLICATION_LOG_COMBINED_FILE = `${APPLICATION_LOG_DIR}/combined.log`
const APPLICATION_TEMP_DIR = `${APPLICATION_DIR}/temp/`;

// 插件目录，分为内置插件和第三方插件
const APPLICATION_PLUGINS_DIR = `${APPLICATION_DIR}/plugins/`;
const APPLICATION_INTERNAL_PLUGINS_DIR = path.join(__dirname, IS_DEVELOPMENT ? '../public/plugins/' : '../app.asar.unpacked/plugins/');

// 防止目录不存在
checkAndCreateDir(APPLICATION_DIR);
checkAndCreateDir(APPLICATION_DATA_DIR);
checkAndCreateDir(APPLICATION_TEMP_DIR);
checkAndCreateDir(APPLICATION_PLUGINS_DIR);
checkAndCreateDir(APPLICATION_INTERNAL_PLUGINS_DIR);

// 检查目录，如果不存在，则创建
function checkAndCreateDir(path) {
    if (!fs.pathExistsSync(path)) {
        fs.mkdirpSync(path)
    }

    return path;
}

export default Object.freeze({
    VERSION: pkg.version,

    IS_DEVELOPMENT,
    USER_HOME_DIR,

    APPLICATION_DIR,
    APPLICATION_CONFIG_FILE,
    APPLICATION_DATA_DIR,
    APPLICATION_LOG_ERROR_File,
    APPLICATION_LOG_COMBINED_FILE,

    APPLICATION_NPM_PATH_PREFIX:  path.join(__dirname, IS_DEVELOPMENT ? '../node_modules/npm/' : '../../node_modules/npm/'),

    APPLICATION_PLUGINS_DIR,
    APPLICATION_INTERNAL_PLUGINS_DIR,
    APPLICATION_PLUGINS_NAME_PREFIX: 'ddm-plugin-',

    APPLICATION_TEMP_DIR,
    IS_MAC: process.platform === 'darwin',

    API_HTTP_PORT: IS_DEVELOPMENT ? pkg.port.dev : pkg.port.prod,
    
    // 初始化插件列表，主要是为了降低应用的大小 + 容易升级降级
    initPlugins: pkg.initPlugins || {}
});