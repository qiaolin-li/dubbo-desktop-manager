import UpdateStatusBar              from './UpdateStatusBar.vue';
import axios                        from 'axios'
import { lt }                       from 'semver'


const repostoryName = "qiaolin-li/dubbo-desktop-manager"
const releaseUrl = `https://api.github.com/repos/${repostoryName}/releases/latest`
const releaseUrlBackup = `https://cdn.jsdelivr.net/gh/${repostoryName}/package.json`
const downloadUrl = `https://github.com/${repostoryName}/releases/latest`


import pluginManager                 from '@/renderer/api/PluginManagerClient.js';
import pluginRegistryGateway         from '@/renderer/api/plugin/registry/PluginRegistryGateway.js';

import appRenderer, { appConfig, appShell }    from '@/renderer/core/AppRenderer.js';


class CheckUpdateStatusBar {

    async run(statusbarManager) {

        const newVersionInfo = await this.checkVersion();
        if( !newVersionInfo.hasUpdate ) {
            return;
        }


        let key = `updateManager.skip-version-${newVersionInfo.newVersion.replace(/\./g, '-')}`;
        let skipVersion = appConfig.getProperty(key);

        // 跳过当前版本
        if (skipVersion) {
            return;
        }

        const updateStatusBar = statusbarManager.addStatusbarItem("right", 999);
        updateStatusBar.icon = 'el-icon-top';
        updateStatusBar.text = `发现新版本 v${newVersionInfo.newVersion}`;
        // updateStatusBar.click = () => {
        //     console.log("hello 啊， 我是 statusbarItem");
        // }
        updateStatusBar.popoverComponent = UpdateStatusBar
        updateStatusBar.popoverParams = newVersionInfo
        if (newVersionInfo.releaseBody) {
            updateStatusBar.popoverHeight = 500; 
        }
        updateStatusBar.show();
    }


    buildResult(latest, releaseBody = '', source = 'github') {
        return {
            currentVersion: window.constant.VERSION,
            newVersion: latest,
            releaseBody,
            hasUpdate: this.compareVersion2Update(window.constant.VERSION, latest),
            source,
            downloadUrl,
        };
    }

    /**
     * 检查最新版本
     */
    async checkVersion() {
        try {
            const res = await axios.get(releaseUrl);
            if (res.status === 200) {
                const releaseBody = res.data.body || '';
                const latest = res.data.name || res.data.tag_name || window.constant.VERSION;
                return this.buildResult(latest, releaseBody, 'github');
            }
        } catch (err) {
            console.error("检查最新版本失败, 错误信息: " + err.message)
        }

        return await this.backupCheckUpdateUrl();
    }

    async backupCheckUpdateUrl() {
        try {
            const res = await axios.get(releaseUrlBackup);
            if (res.status === 200) {
                const latest = res.data.version || res.data.name || window.constant.VERSION;
                return this.buildResult(latest, '', 'backup');
            }
        } catch (err) {
            console.error("检查最新版本失败, 错误信息: " + err.message)
        }

        return this.buildResult(window.constant.VERSION, '', 'none');
    }

    openDownloadPage(url = downloadUrl) {
        appShell.openExternal(url)
    }

    /**
     * 判断当前版本是否需要更新
     * @param {*} current 当前版本
     * @param {*} latest 最新版本
     * @returns 是否需要更新
     */
    compareVersion2Update(current, latest) {
        try {
            return lt(current, latest)
        } catch (e) {
            return false
        }
    }

    /**
     * TODO 估计有问题，后面再实现
     * @returns 
     */
    async checkPluginUpdates() {
        const installedPluginInfoList = await pluginManager.getInstalledPluginList();
        if (!installedPluginInfoList.length) {
            return {
                count: 0,
                list: [],
            };
        }

        const resultList = await Promise.allSettled(installedPluginInfoList.map(async plugin => {
            const pluginInfo = await pluginRegistryGateway.getPackage(plugin.pluginName, installedPluginInfoList);
            if (!pluginInfo || pluginInfo.installStatus !== 'update') {
                return null;
            }

            return {
                ...pluginInfo,
                installedVersion: plugin.installedVersion || plugin.version,
            };
        }));

        const list = resultList.filter(item => item.status === 'fulfilled' && item.value)
            .map(item => item.value);

        return {
            count: list.length,
            list,
        };
    }
}

export default new CheckUpdateStatusBar();