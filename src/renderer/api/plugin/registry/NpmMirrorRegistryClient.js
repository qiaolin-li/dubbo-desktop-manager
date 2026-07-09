import axios from 'axios'
import pluginConfig from '@/renderer/api/plugin/config/PluginConfig.js'

export default class NpmMirrorRegistryClient {

    registry = 'https://registry.npmmirror.com/';

    support(registry) {
        return registry === this.registry;
    }

    buildSearchText(pluginNameKeyword, keyword) {
        return keyword ? `${pluginNameKeyword},${keyword}` : `${pluginNameKeyword}`;
    }

    async search(registry, pluginNameKeyword, keyword, installedPluginInfoList = []) {
        const text = this.buildSearchText(pluginNameKeyword, keyword);
        const url = new URL(`/-/v1/search?text=${text}&size=100&time=${new Date().getTime()}`, registry).href;
        const response = await axios.get(url);
        return (response.data.objects || []).map(item => this.mapSearchResult(item, installedPluginInfoList));
    }

    async getPackage(registry, name, installedPluginInfoList = []) {
        const response = await axios.get(new URL(name, registry).href);
        return this.mapPackageDetail(response.data, installedPluginInfoList);
    }

    getDownloads(item) {
        return item?.downloads?.all ?? 0;
    }

    getAuthor(packageInfo) {
        return packageInfo?.author?.name
            || packageInfo?.publisher?.username
            || packageInfo?.publisher?.actor?.name
            || packageInfo?.maintainers?.[0]?.username
            || packageInfo?.maintainers?.[0]?.name
            || '';
    }

    getHomepage(packageInfo) {
        return packageInfo?.homepage
            || packageInfo?.links?.homepage
            || packageInfo?.links?.npm
            || '';
    }

    mapSearchResult(item, installedPluginInfoList) {
        const packageInfo = item.package;
        const name = packageInfo.name;
        const plugin = installedPluginInfoList.find(pluginInfo => pluginInfo.pluginName === name);

        let installStatus = 'uninstalled';
        if (plugin) {
            installStatus = plugin.version === packageInfo.version ? 'installed' : 'update';
        }

        return {
            pluginId: `${name}@${packageInfo.version}`,
            pluginName: name,
            pluginNickName: packageInfo.pluginNickName || packageInfo.name.replace(`${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
            author: this.getAuthor(packageInfo),
            description: packageInfo.description,
            logo: `https://cdn.jsdelivr.net/npm/${name}/logo.png`,
            homepage: this.getHomepage(packageInfo),
            installedVersion: plugin?.version ?? '',
            installStatus: installStatus,
            version: packageInfo.version,
            star: pluginConfig.isRecommendPlugin(name),
            downloads: this.getDownloads(item),
        }
    }

    mapPackageDetail(data, installedPluginInfoList) {
        if (!data) {
            return null;
        }

        const latest = data["dist-tags"].latest;
        const lastestVersionInfo = data.versions[latest];
        const plugin = installedPluginInfoList.find(pluginInfo => pluginInfo.pluginName === lastestVersionInfo.name);

        let installStatus = 'uninstalled';
        if (plugin) {
            installStatus = plugin.version === lastestVersionInfo.version ? 'installed' : 'update';
        }

        const versions = [];
        for (const version in data.versions) {
            versions.push(data.versions[version]);
        }

        return {
            pluginId: `${lastestVersionInfo.name}@${lastestVersionInfo.version}`,
            pluginName: lastestVersionInfo.name,
            pluginNickName: lastestVersionInfo.pluginNickName || lastestVersionInfo.name.replace(`${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
            author: this.getAuthor(lastestVersionInfo),
            description: lastestVersionInfo.description,
            logo: `https://cdn.jsdelivr.net/npm/${lastestVersionInfo.name}/logo.png`,
            homepage: this.getHomepage(lastestVersionInfo),
            installedVersion: plugin?.version ?? '',
            installStatus: installStatus,
            version: lastestVersionInfo.version,
            versions: versions.reverse(),
            star: pluginConfig.isRecommendPlugin(lastestVersionInfo.name),
        }
    }
}
