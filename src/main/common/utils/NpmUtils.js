import constant                 from '@/main/common/Constant'
import windowHolder             from '@/main/window/WindowHolder.js';
import appConfig                from "@/main/common/config/appConfig.js";
import axios                    from 'axios'
import { Logger }               from '@/main/common/logger';

const logger = new Logger("ddm-NpmUtils");

// eslint-disable-next-line no-undef
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require

class NpmUtils {
    
    async execCommand (command, args, where){
        if (!command) {
            throw new Error('command is a must');
        }

        process.argv[0] = ''
        process.argv[1] = 'dist_electron'
        process.argv[2] = command
        for (let i = 0; i < args.length; i++) {
            process.argv.push(args[i]);
        }

        const Npm = requireFunc(`${constant.APPLICATION_NPM_PATH_PREFIX}/lib/npm.js`)

        class MyNpm extends Npm {

            constructor (localPrefix) {
                super()
                this.localPrefix = localPrefix;
                this.message = '';
            }

            output(...msg) {
                this.message += msg
                if(this.message.lastIndexOf('\n') == this.message.length - 1){
                    windowHolder.send(`pluginOperationLog`, this.message);
                    this.message = '';
                }
            }
            outputError(...msg) {
                this.message += msg
                if(this.message.lastIndexOf('\n') == this.message.length - 1){
                    windowHolder.send(`pluginOperationLog`, this.message);
                    this.message = '';
                }
            }

            set title (t) { }
        }

        const npmRegistry = await this.getFastestRegistry();
        const npm = new MyNpm(where)
        const stdoutWrite = process.stdout.write;
        const stderrWrite = process.stderr.write;

        try {
            process.stdout.write = (...msg) => {
                npm.output(...msg)
            }

            process.stderr.write = (...msg) => {
                npm.outputError(...msg)
            }
        
            await npm.load()
            npm.config.set('registry', npmRegistry)
            const cmd = npm.argv.shift()
            await npm.exec(cmd, npm.argv)
        } finally {
            process.stdout.write = stdoutWrite;
            process.stderr.write = stderrWrite;
        }

        return npm.message;
    }

    async getFastestRegistry() {
        const registries = [];

        const customRegistry = await appConfig.getProperty("npmRegistry");
        // 如果用户指定了自定义的npm源，则将用户指定的源放到第一位，如果源已经存在，需要放到第一位
        if (customRegistry) {
            registries.push(customRegistry);
        }

        const defaultRegistries = [
            'https://registry.npmmirror.com/',
            'https://registry.npmjs.com/',
        ];
        defaultRegistries.forEach(registry => {
            if (!registries.includes(registry)) {
                registries.push(registry);
            }
        });

        const timeout = 500;
        const check = (url) => {
            return axios.head(url, { timeout }).then(() => url).catch(() => null);
        };

        const start = Date.now();
        const result = await Promise.race(registries.map(check));
        const duration = (Date.now() - start).toFixed(2);


        if (result) {
            logger.info(`获取到最快的npm源: ${result}, 耗时: ${duration}ms`);
            return result;
        }

        logger.error('获取npm源失败，使用默认的npm源 https://registry.npmjs.com/');
        return 'https://registry.npmjs.com/';
    }
    
}

export default new NpmUtils();
