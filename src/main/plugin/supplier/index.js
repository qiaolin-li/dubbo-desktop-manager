import axios                    from 'axios'
import constant                 from '@/main/common/Constant'
import pluginManager            from '@/main/plugin/PluginManager'
import spawn                    from 'cross-spawn'

class NPMPluginSupplier {

    async search(keyword){
        const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${keyword}`);
        return response.data.objects.map(item => this.handleResult(item));
    }

    handleResult(item) {
        const plugin = pluginManager.get(item.package.name);

        return {
            id: item.package.name,
            name: item.package.pluginName || item.package.name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
            author: item.package.author.name,
            description: item.package.description,
            logo: `https://cdn.jsdelivr.net/npm/${item.package.name}/logo.png`,
            config: {},
            homepage: item.package.links ? item.package.links.homepage : '',
            hasInstall: plugin != null,
            installVersion:plugin ? plugin.version : '',
            version: item.package.version,
        }
    }

    /**
     * 
     * @param {*} cmd 需要执行的命令，例如install、uninstall、update
     * @param {*} modules 需要操作的模块，例如[plugin1, plugin2]
     * @param {*} where 
     * @returns 
     */
      async execCommand(cmd, modules, where) {
        return await new Promise((resolve, reject) => {
            try {
                // spawn的命令行参数是以数组形式传入
                // 此处将命令和要安装的插件以数组的形式拼接起来
                // 此处的cmd指的是执行的命令，比如install\uninstall\update
                let args = [cmd].concat(modules).concat('--color=always').concat('--save')
                
                // 执行npm，并通过 cwd指定执行的路径——配置文件所在文件夹
                const npm = spawn('npm', args, { cwd: where }) 

                let output = ''
                // 获取输出、报错日志
                npm.stdout.on('data', (data) => output += data).pipe(process.stdout)
                npm.stderr.on('data', (data) => output += data).pipe(process.stderr)

                npm.on('close', (code) => {
                    // 如果没有报错就输出正常日志
                    if (!code) {
                        resolve(output) 
                    } else {
                        reject(new Error(output)) 
                    }
                })

                npm.on('error', (err) => reject(new Error(err)));
            } catch (error) {
                reject(new Error(error))
            }
        })
    }

    async install(plugin) {
        try {
            return await this.execCommand('install', [ plugin ], constant.APPLICATION_PLUGINS_DIR)
        } catch (error) {
            throw new Error(`插件[${plugin}]安装失败，错误信息：${error}`)
        }
    }

    async uninstall(plugin) {
        return await this.execCommand('uninstall', [ plugin ], constant.APPLICATION_PLUGINS_DIR)
    }

}

export default new NPMPluginSupplier()