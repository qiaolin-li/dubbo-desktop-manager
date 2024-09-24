import fs                       from 'fs';
import path                     from 'path';
import constant                 from '@/main/common/Constant'
import pluginManager            from '@/main/plugin/PluginManager'
import spawn                    from 'cross-spawn'
import pluginSearch             from '@/main/plugin/supplier/PluginSearcher.js'
import npmUtils                 from '@/main/common/utils/NpmUtils';
import windowHolder             from '@/main/common/holder/WindowHolder.js';
import appConfig                from "@/main/common/config/appConfig"

class NPMPluginSupplier {

    async search(keyword) {
        return await pluginSearch.search(keyword);
    }

    async addDevelopmentPlugin(pluginPath) {
        const packagePath = path.join(pluginPath, 'package.json')

        if (!fs.existsSync(packagePath)) {
            throw new Error('插件包不存在')
        }
        
        if(!path.basename(pluginPath).startsWith('ddm-plugin-')) {
            throw new Error('插件包必须以ddm-plugin开头，例如【ddm-plugin-xxxx...】、【ddm-plugin-xxxx-zzzz】')
        }

        const pkg = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
        if(!pkg || !pkg.name || path.basename(pluginPath) !== pkg.name) {
            throw new Error('插件包目录名与package.json文件内的name必须一致')
        }

        const localPluginList = appConfig.getProperty('localPluginList') || [];

        if(localPluginList.includes(pluginPath)) {
            throw new Error('插件已存在, 请勿重复添加')
        }

        localPluginList.push(pluginPath);
        appConfig.setProperty('localPluginList', localPluginList);
    }

    async removeDevelopmentPlugin(pluginPath) {
        const localPluginList = appConfig.getProperty('localPluginList') || [];
        const index = localPluginList.indexOf(pluginPath);
        if(index > -1) {
            localPluginList.splice(index, 1);
            appConfig.setProperty('localPluginList', localPluginList);
        }
    }

    async getDevelopmentPluginList() {
        // try {
        //     rootPath =lodash.trim(await this.execCommand('root', [ '-g' ], constant.APPLICATION_PLUGINS_DIR));
        // } catch(error) {
        //     // mac下打包后始终会报错，也不知道为什么....，折腾了很久，后面在优化吧，
        //     // 开发环境还是没有问题，要编写插件，最好还用开发模式把，还可以调试
        //     return [];
        // }
        
        // 获取root目录下所有子目录
        const pluginList = [];
        const localPluginList = appConfig.getProperty('localPluginList') || [];
        localPluginList.forEach((pluginPath) => {
            const packagePath = path.join(pluginPath, 'package.json')
            const pkg = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
            const name = pkg.name;
            if(!name.startsWith('ddm-plugin-')) {
                return;
            }
            
            let installStatus = 'uninstalled';
            
            const plugin = pluginManager.get(name);
            if (plugin) {
                // 本地插件，可无脑更新
                installStatus = 'update';
            }

            pluginList.push({
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

    async getInstalledPluginList() {
        const pluginList = [];
        pluginManager.getList().forEach((plugin) => {
            const packagePath = path.join(plugin.pluginDir, 'package.json')
            const pkg = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
            const name = pkg.name;
            
            pluginList.push({
                id: name,
                name: pkg.pluginName || name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
                path: plugin.pluginDir,
                author: pkg.author,
                description: pkg.description,
                logo: 'file://' + path.join(plugin.pluginDir, 'logo.png'),
                readme: path.join(plugin.pluginDir, 'README.md'),
                config: {},
                installVersion:plugin ? plugin.version : '',
                installStatus: 'installed',
                version: pkg.version,
                source: 'local'
            });
        })

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
        const write = process.stdout.write;
        const pluginId = plugin.source === 'local' ? plugin.path : `${plugin.id}` + (plugin.version ?  '@' + plugin.version : '');
  
        try {
            const command = 'install'
            const params = [pluginId, '--loglevel', 'info']
            windowHolder.getWindow().webContents.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】安装中...\n`);
            const result = await npmUtils.execCommand(command, params, constant.APPLICATION_PLUGINS_DIR);
            windowHolder.getWindow().webContents.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】安装完成。\n`);
            return result;
        } catch (error) {
            windowHolder.getWindow().webContents.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】安装失败！\n`);
            throw new Error(`插件[${plugin.id}-${plugin.name}]安装失败，错误信息：${error}`)
        } finally {
            process.env = env;
            process.argv = argv;
            process.stdout.write = write;
        }
    }

    async uninstall(plugin) {
        const argv = [...process.argv];
        const env = {...process.env};
        const write = process.stdout.write;
        try {
            windowHolder.getWindow().webContents.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】卸载中...\n`);
            const result = await npmUtils.execCommand('uninstall', [ plugin.id, '--loglevel', 'info'], constant.APPLICATION_PLUGINS_DIR);
            windowHolder.getWindow().webContents.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】卸载完成。\n`);
            return result;
        } catch (error) {
            windowHolder.getWindow().webContents.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】卸载失败！\n`);
            throw new Error(`插件[${plugin.id}]安装失败，错误信息：${error}`)
        } finally {
            process.env = env;
            process.argv = argv;
            process.stdout.write = write;
        }
    }

}

export default new NPMPluginSupplier()