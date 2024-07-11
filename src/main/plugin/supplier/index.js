import fs                       from 'fs';
import path                     from 'path';
import constant                 from '@/main/common/Constant'
import pluginManager            from '@/main/plugin/PluginManager'
import spawn                    from 'cross-spawn'
import pluginSearch             from '@/main/plugin/supplier/PluginSearcher.js'
import npmUtils                 from '@/main/common/utils/NpmUtils';

class NPMPluginSupplier {

    async search(keyword) {
        const remotePluginList = await pluginSearch.search(keyword);
        // return await this.localLinkPluginList(remotePluginList);
        return remotePluginList;
    }

    async localLinkPluginList(pluginList){
        const result = await npmUtils.execCommand('ls', [ '--global', '--depth', '0' ], constant.APPLICATION_PLUGINS_DIR);
        // const result = await this.execCommand('ls', [ '--global', '--depth', '0' ], constant.APPLICATION_PLUGINS_DIR);
        // // eslint-disable-next-line no-control-regex
        // const cleanedResult = result.replace(/\x1b\[[0-9;]*m/g, '');

        // const regex = /^\+--\s(ddm-plugin-[^\s]+)\s->\s(.*)$/gm;
        // let match;
                
        // 分割成行
        const lines = result.split('\n');

        // 过滤出包含 'ddm-plugin-' 的行
        const ddmPluginLines = lines.filter(line => line.includes('ddm-plugin-'));

        // 转换为需要的格式
        ddmPluginLines.map(line => {
            const parts = line.split(' -> ');
            const name = parts[0].split(' ')[1].split('@')[0];

            const pluginPath = parts[1].substring(0, parts[1].lastIndexOf(name) + name.length);

            const packagePath = path.join(pluginPath, 'package.json')
            const pkg = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
            
            const plugin = pluginManager.get(name);

            let installStatus = 'uninstalled';
            if (plugin) {
                // 本地插件，可无脑更新
                installStatus = 'update';
            }

            pluginList = pluginList.filter(p => p.name !== name);
            
            pluginList.unshift({
                id: name,
                name: pkg.pluginName || name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
                path: path.join(pluginPath),
                author: pkg.author,
                description: pkg.description,
                logo: path.join(pluginPath, 'logo.png'),
                readme: path.join(pluginPath, 'README.md'),
                config: {},
                installVersion:plugin ? plugin.version : '',
                installStatus: installStatus,
                version: pkg.version,
                source: 'local'
            });

        });
        
        return pluginList;
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
                const npm = spawn(`${constant.APPLICATION_INTERNAL_PLUGINS_DIR}node_modules\\npm\\bin\\npm`, args, { cwd: where , env: {
                    ELECTRON_RUN_AS_NODE:1
                }}) 

                let output = ''
                // 获取输出、报错日志
                npm.stdout.on('data', (data) => output += data).pipe(process.stdout)
                npm.stderr.on('data', (data) => output += data).pipe(process.stderr)

                npm.on('close', (code) => {
                    fs.writeFileSync(constant.APPLICATION_DIR + '/test-' + new Date().getTime(), output)
                    // 如果没有报错就输出正常日志
                    if (!code) {
                        resolve(output) 
                    } else {
                        reject(new Error(output)) 
                    }
                })

                npm.on('error', (err) =>{
                    fs.writeFileSync(constant.APPLICATION_DIR + '/test-' + new Date().getTime(), err)
                    reject(new Error(err))
                });
            } catch (error) {
                reject(new Error(error))
            }
        })
    }

    async install(plugin) {

        try {
         
            return await npmUtils.execCommand('install', [ plugin ], constant.APPLICATION_PLUGINS_DIR);
            //   return await this.execCommand('install', [ plugin ], constant.APPLICATION_PLUGINS_DIR)
        } catch (error) {
            throw new Error(`插件[${plugin}]安装失败，错误信息：${error}`)
        }
    }

    async uninstall(plugin) {
        return await npmUtils.execCommand('uninstall', [ plugin ], constant.APPLICATION_PLUGINS_DIR);

        //return await this.execCommand('uninstall', [ plugin ], constant.APPLICATION_PLUGINS_DIR)
    }

}

export default new NPMPluginSupplier()