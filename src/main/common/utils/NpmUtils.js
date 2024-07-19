import fs                       from 'fs';
import constant                 from '@/main/common/Constant'

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
            process.argv[3 + i] = modules[i]
        }
        
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
            }

            outputError(...msg) {
                this.message += msg
            }

            set title (t) { }
        }

        const npm = new MyNpm(where)

        await npm.load()
        if (npm.config.get('version', 'cli')) {
            return JSON.stringify(npm.version);
        }

        // npm --versions=cli
        if (npm.config.get('versions', 'cli')) {
            npm.argv = ['version']
            npm.config.set('usage', false, 'cli')
        }

        let cmd = npm.argv.shift()
        await npm.exec(cmd, npm.argv)
        return npm.message;
    }
}

export default new NpmUtils();