import path from 'path';
import os from 'os';
import fs from 'fs-extra';


const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production'
const USER_HOME_DIR = os.homedir();
const APPLICATION_DIR = `${USER_HOME_DIR}/.dubbo-desktop-manager`;
const APPLICATION_CONFIG_FILE = `${APPLICATION_DIR}/config.db`;
const APPLICATION_DATA_DIR = `${APPLICATION_DIR}/data/`;
const APPLICATION_LOG_DIR = `${APPLICATION_DIR}/log/`
const APPLICATION_LOG_ERROR_File = `${APPLICATION_LOG_DIR}/error.log`
const APPLICATION_LOG_COMBINED_FILE = `${APPLICATION_LOG_DIR}/combined.log`
const APPLICATION_TEMP_DIR = `${APPLICATION_DIR}/temp/`;
const APPLICATION_JAVA_INVOKE_DIR = `${APPLICATION_TEMP_DIR}/java-invoke/`;

// 插件目录，分为内置插件和第三方插件
const APPLICATION_PLUGINS_DIR = `${APPLICATION_DIR}/plugins/`;
const APPLICATION_INTERNAL_PLUGINS_DIR = path.join(__dirname, IS_DEVELOPMENT ? '../public/plugins/' : '../app.asar.unpacked/plugins/');

const JAVA_COMMAND_PATH = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}/bin/java` : 'java';
// 防止目录不存在
checkAndCreateDir(APPLICATION_DIR);
checkAndCreateDir(APPLICATION_DATA_DIR);
checkAndCreateDir(APPLICATION_TEMP_DIR);
checkAndCreateDir(APPLICATION_PLUGINS_DIR);
checkAndCreateDir(APPLICATION_INTERNAL_PLUGINS_DIR);
checkAndCreateDir(APPLICATION_JAVA_INVOKE_DIR);

// 检查目录，如果不存在，则创建
function checkAndCreateDir(path) {
    if (!fs.pathExistsSync(path)) {
        fs.mkdirpSync(path)
    }
}

export default {
    IS_DEVELOPMENT,
    USER_HOME_DIR,
    APPLICATION_DIR,
    APPLICATION_CONFIG_FILE,
    APPLICATION_DATA_DIR,
    APPLICATION_LOG_ERROR_File,
    APPLICATION_LOG_COMBINED_FILE,

    APPLICATION_PLUGINS_DIR,
    APPLICATION_INTERNAL_PLUGINS_DIR,
    APPLICATION_PLUGINS_NAME_PREFIX: 'ddp-plugin-',

    APPLICATION_TEMP_DIR,
    JAVA_COMMAND_PATH,
    APPLICATION_JAVA_INVOKE_DIR,
    IS_MAC: process.platform === 'darwin',
    
}