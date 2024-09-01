import fs                       from 'fs';
import constant                 from '@/main/common/Constant'
import windowHolder             from '@/main/common/holder/WindowHolder.js';

// eslint-disable-next-line no-undef
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require

class NpmUtils {
    
    async execCommand (command, modules, where){
        if (!command) {
            throw new Error('command is a must');
        }

        process.argv[0] = ''
        process.argv[1] = 'dist_electron'
        process.argv[2] = command
        for (let i = 0; i < modules.length; i++) {
            process.argv.push(modules[i]);
        }


        // process.stdin.on('data', (data) => {
        //     console.log(data);
        //     // windowHolder.getWindow().webContents.send(`pluginOperationLog`, data);
        // });
    
        // process.stdout.on('data', (data) => {
        //     console.log(data);
        //     // windowHolder.getWindow().webContents.send(`pluginOperationLog`, data);
        // });

        // const Npm = require( 'npm/lib/npm.js')
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
                    windowHolder.getWindow().webContents.send(`pluginOperationLog`, this.message);
                    this.message = '';
                }
            }
            outputError(...msg) {
                this.message += msg
                if(this.message.lastIndexOf('\n') == this.message.length - 1){
                    windowHolder.getWindow().webContents.send(`pluginOperationLog`, this.message);
                    this.message = '';
                }
            }

            set title (t) { }
        }

        const npm = new MyNpm(where)

        process.stdout.write = (...msg) => {
            npm.output(...msg)
        }

        process.stderr.write = (...msg) => {
            npm.outputError(...msg)
        }
    
        await npm.load()
        npm.config.set('registry', 'https://registry.npmmirror.com/')
        let cmd = npm.argv.shift()
        await npm.exec(cmd, npm.argv)

        return npm.message;
    }
}

export default new NpmUtils();