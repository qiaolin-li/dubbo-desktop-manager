import constant                 from '@/main/common/Constant'
import npmUtils                 from '@/main/common/utils/NpmUtils';
import windowHolder             from '@/main/window/WindowHolder.js';
import { Logger }               from '@/main/common/logger';

const logger = new Logger("ddm-PluginInstaller");

/**
 * 插件安装器
 * 提供插件的安装、卸载等操作
 * 
 * @typedef {import('./AppPlugin.js').default} AppPlugin
 */
class PluginInstaller { 

    /**
     * 安装插件到本地
     * 从npm仓库或本地路径安装插件
     * @param {{name: string, version?: string, name?: string, source?: string, path?: string}} plugin 
     * @returns 
     */
    async install(plugin, where) {
        const argv = [...process.argv];
        const env = {...process.env};
        
        try {
            const command = 'install'
            const params = [plugin.source === 'local' ? plugin.path : plugin.pluginId, '--loglevel', 'info']
            logger.info(`插件【${plugin.pluginName}】安装中...\n`);
            const result = await npmUtils.execCommand(command, params, where);
            logger.info(`插件【${plugin.pluginName}】安装完成。\n`);
            return result;
        } catch (error) {
            logger.error(`插件【${plugin.pluginName}】安装失败！\n`);
            throw new Error(`插件[${plugin.pluginName}]安装失败，错误信息：${error}`)
        } finally {
            process.env = env;
            process.argv = argv;
        }
    }

    /**
     * 卸载插件，从磁盘上移除它
     * @param {AppPlugin} plugin 插件信息
     * @returns 
     */
    async uninstall(plugin, where) {
        const argv = [...process.argv];
        const env = {...process.env};
        try {
            logger.info(`插件【${plugin.pluginName}】卸载中...\n`);
            const result = await npmUtils.execCommand('uninstall', [ plugin.pluginName, '--loglevel', 'info'], where);
            logger.info(`插件【${plugin.pluginName}】卸载完成。\n`);
            return result;
        } catch (error) {
            logger.error(`插件【${plugin.pluginName}】卸载失败！\n`);
            throw new Error(`插件[${plugin.pluginName}]卸载失败，错误信息：${error}`)
        } finally {
            process.env = env;
            process.argv = argv;
        }
    }
}

export default new PluginInstaller();
