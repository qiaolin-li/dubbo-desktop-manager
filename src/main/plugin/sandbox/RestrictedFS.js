import fs                   from 'fs';
import path                 from 'path';
import { Logger }           from '@/main/common/logger';

const logger = new Logger("ddm-RestrictedFS");

class RestrictedFS {

    constructor(pluginName, permissions = {}) {
        this.pluginName = pluginName;
        this.readAllowList = (permissions.read || []).map((dir) => path.resolve(dir));
        this.writeAllowList = (permissions.write || []).map((dir) => path.resolve(dir));
        this.promises = Object.freeze(this.#createPromisesApi());
        Object.freeze(this);
    }

    #createPromisesApi() {
        return {
            access: (targetPath, mode) => this.access(targetPath, mode),
            mkdir: (targetPath, options) => this.mkdir(targetPath, options),
            readdir: (targetPath, options) => this.readdir(targetPath, options),
            readFile: (targetPath, options) => this.readFile(targetPath, options),
            rm: (targetPath, options) => this.rm(targetPath, options),
            stat: (targetPath, options) => this.stat(targetPath, options),
            writeFile: (targetPath, data, options) => this.writeFile(targetPath, data, options),
        };
    }

    #resolve(targetPath) {
        return path.resolve(targetPath);
    }

    #isAllowed(targetPath, allowList) {
        const resolvedPath = this.#resolve(targetPath);
        return allowList.some((allowedDir) => resolvedPath === allowedDir || resolvedPath.startsWith(`${allowedDir}${path.sep}`));
    }

    #assertReadable(targetPath) {
        if (!this.#isAllowed(targetPath, this.readAllowList)) {
            const error = new Error(`插件 ${this.pluginName} 无权读取文件: ${targetPath}`);
            logger.warn(error.message);
            throw error;
        }
    }

    #assertWritable(targetPath) {
        if (!this.#isAllowed(targetPath, this.writeAllowList)) {
            const error = new Error(`插件 ${this.pluginName} 无权写入文件: ${targetPath}`);
            logger.warn(error.message);
            throw error;
        }
    }

    access(targetPath, mode) {
        this.#assertReadable(targetPath);
        return fs.promises.access(targetPath, mode);
    }

    createReadStream(targetPath, options) {
        this.#assertReadable(targetPath);
        return fs.createReadStream(targetPath, options);
    }

    createWriteStream(targetPath, options) {
        this.#assertWritable(targetPath);
        return fs.createWriteStream(targetPath, options);
    }

    existsSync(targetPath) {
        this.#assertReadable(targetPath);
        return fs.existsSync(targetPath);
    }

    mkdir(targetPath, options) {
        this.#assertWritable(targetPath);
        return fs.promises.mkdir(targetPath, options);
    }

    mkdirSync(targetPath, options) {
        this.#assertWritable(targetPath);
        return fs.mkdirSync(targetPath, options);
    }

    readFile(targetPath, options) {
        this.#assertReadable(targetPath);
        return fs.promises.readFile(targetPath, options);
    }

    readFileSync(targetPath, options) {
        this.#assertReadable(targetPath);
        return fs.readFileSync(targetPath, options);
    }

    readdir(targetPath, options) {
        this.#assertReadable(targetPath);
        return fs.promises.readdir(targetPath, options);
    }

    readdirSync(targetPath, options) {
        this.#assertReadable(targetPath);
        return fs.readdirSync(targetPath, options);
    }

    rm(targetPath, options) {
        this.#assertWritable(targetPath);
        return fs.promises.rm(targetPath, options);
    }

    rmSync(targetPath, options) {
        this.#assertWritable(targetPath);
        return fs.rmSync(targetPath, options);
    }

    stat(targetPath, options) {
        this.#assertReadable(targetPath);
        return fs.promises.stat(targetPath, options);
    }

    statSync(targetPath, options) {
        this.#assertReadable(targetPath);
        return fs.statSync(targetPath, options);
    }

    writeFile(targetPath, data, options) {
        this.#assertWritable(targetPath);
        return fs.promises.writeFile(targetPath, data, options);
    }

    writeFileSync(targetPath, data, options) {
        this.#assertWritable(targetPath);
        return fs.writeFileSync(targetPath, data, options);
    }
}

export default RestrictedFS;
