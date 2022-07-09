import os from 'os';
import fs from 'fs-extra';

const USER_HOME_DIR = os.homedir();
const APPLICATION_DIR = `${USER_HOME_DIR}/.dubbo-desktop-manager`;
const APPLICATION_CONFIG_FILE = `${APPLICATION_DIR}/config.db`;
const APPLICATION_DATA_DIR = `${APPLICATION_DIR}/data/`;

// 防止目录不存在
checkAndCreateDir(APPLICATION_DIR);
checkAndCreateDir(APPLICATION_DATA_DIR);

// 检查目录，如果不存在，则创建
function checkAndCreateDir(path) {
    if (!fs.pathExistsSync(path)) {
        fs.mkdirpSync(path)
    }
}

export default {
    USER_HOME_DIR,
    APPLICATION_DIR,
    APPLICATION_CONFIG_FILE,
    APPLICATION_DATA_DIR
}