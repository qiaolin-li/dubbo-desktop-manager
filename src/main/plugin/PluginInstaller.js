import fs                       from 'fs';
import path                     from 'path';
import constant                 from '@/main/common/Constant'
import pluginManager            from '@/main/plugin/PluginManager'
import npmUtils                 from '@/main/common/utils/NpmUtils';
import windowHolder             from '@/main/common/holder/WindowHolder.js';

class PluginInstaller {
 
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
                readme: 'file://' + path.join(plugin.pluginDir, 'README.md'),
                installVersion:plugin ? plugin.version : '',
                installStatus: 'installed',
                version: pkg.version,
                source: 'local'
            });
        })
        return pluginList;
    }

    async install(plugin) {
        const argv = [...process.argv];
        const env = {...process.env};
        const write = process.stdout.write;
        const pluginId = plugin.source === 'local' ? plugin.path : `${plugin.id}` + (plugin.version ?  '@' + plugin.version : '');
  
        try {
            const command = 'install'
            const params = [pluginId, '--loglevel', 'info']
            windowHolder.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】安装中...\n`);
            const result = await npmUtils.execCommand(command, params, constant.APPLICATION_PLUGINS_DIR);
            windowHolder.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】安装完成。\n`);
            return result;
        } catch (error) {
            windowHolder.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】安装失败！\n`);
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
            windowHolder.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】卸载中...\n`);
            const result = await npmUtils.execCommand('uninstall', [ plugin.id, '--loglevel', 'info'], constant.APPLICATION_PLUGINS_DIR);
            windowHolder.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】卸载完成。\n`);
            return result;
        } catch (error) {
            windowHolder.send(`pluginOperationLog`, `插件-【${plugin.id}-${plugin.name}】卸载失败！\n`);
            throw new Error(`插件[${plugin.id}]安装失败，错误信息：${error}`)
        } finally {
            process.env = env;
            process.argv = argv;
            process.stdout.write = write;
        }
    }

}

export default new PluginInstaller()