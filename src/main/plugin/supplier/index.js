import fs                       from 'fs';
import path                     from 'path';
import lodash                   from 'lodash';
import constant                 from '@/main/common/Constant'
import pluginManager            from '@/main/plugin/PluginManager'
import spawn                    from 'cross-spawn'
import pluginSearch             from '@/main/plugin/supplier/PluginSearcher.js'
import npmUtils                 from '@/main/common/utils/NpmUtils';

class NPMPluginSupplier {

    async search(keyword) {
        const remotePluginList = await pluginSearch.search(keyword);
        return await this.localLinkPluginList(remotePluginList);
    }

    async localLinkPluginList(pluginList){
        let rootPath = '';
        try {
            rootPath =lodash.trim(await this.execCommand('root', [ '-g' ], constant.APPLICATION_PLUGINS_DIR));
        } catch(error) {
            // mac下打包后始终会报错，也不知道为什么....，折腾了很久，后面在优化吧，
            // 开发环境还是没有问题，要编写插件，最好还用开发模式把，还可以调试
            return pluginList;
        }
        
        // 获取root目录下所有子目录
        fs.readdirSync(rootPath).forEach((name) => {
            if(!name.startsWith('ddm-plugin-')) {
                return;
            }
            // const parts = line.split(' -> ');
            // const name = parts[0].split(' ')[1].split('@')[0];

            const pluginPath = rootPath + '/' + name;

            const packagePath = path.join(pluginPath, 'package.json')
            const pkg = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
            
            name = pkg.name;
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
                logo: 'file://' + path.join(pluginPath, 'logo.png'),
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
                const npm = spawn(`npm`, args, { cwd: where }) 

                let output = ''
                // 获取输出、报错日志
                npm.stdout.on('data', (data) => output += data).pipe(process.stdout)
                npm.stderr.on('data', (data) => output += data).pipe(process.stderr)

                npm.on('close', (code) => {
                    // 如果没有报错就输出正常日志
                    if (!code) {
                        resolve(output) ;
                    } else {
                        reject(output);
                    }
                })

                npm.on('error', (err) => reject(err));
            } catch (error) {
                reject(error)
            }
        })
    }

    async install(plugin) {
        const argv = [...process.argv];
        const env = {...process.env};
        try {
            const command = plugin.source === 'local' ? 'link' : 'install'
            const params = plugin.source === 'local' ?  [plugin, '--local']  : [plugin]
         
            const result = await npmUtils.execCommand(command, params, constant.APPLICATION_PLUGINS_DIR);
         
            process.argv = argv;
            process.env = env;
            return result;
        } catch (error) {
            process.env = env;
            process.argv = argv;
            throw new Error(`插件[${plugin}]安装失败，错误信息：${error}`)
        }
    }

    async uninstall(plugin) {
        const argv = [...process.argv];
        const env = {...process.env};
        try {
            const result = await npmUtils.execCommand('uninstall', [ plugin ], constant.APPLICATION_PLUGINS_DIR);

            process.argv = argv;
            process.env = env;
            return result;
        } catch (error) {
            process.env = env;
            process.argv = argv;
            throw new Error(`插件[${plugin}]安装失败，错误信息：${error}`)
        }
    }

}

export default new NPMPluginSupplier()