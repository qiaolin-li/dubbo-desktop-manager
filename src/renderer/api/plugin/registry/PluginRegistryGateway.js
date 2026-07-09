import NpmRegistryClient        from '@/renderer/api/plugin/registry/NpmRegistryClient.js'
import NpmMirrorRegistryClient  from '@/renderer/api/plugin/registry/NpmMirrorRegistryClient.js'

import cacheUtils               from '@/common/utils/CacheUtils';

class PluginRegistryGateway {

    constructor() {
        this.clients = [
            new NpmRegistryClient(),
            new NpmMirrorRegistryClient(),
        ];

        this.getFastestRegistry = cacheUtils.memoizeWithTTL(this.doGetFastestRegistry.bind(this), 5000)
    }

    getClient(registry) {
        return this.clients.find(client => client.support(registry)) || this.clients[0];
    }

    async doGetFastestRegistry() {
        const registries = this.clients.map(client => client.registry);

        const timeoutMs = 1000;
        const fetchWithTimeout = (url) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);

            const start = performance.now();
            return fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
            }).then(() => {
                const duration = performance.now() - start;
                return { url, duration };
            }).catch(() => null)
            .finally(() => clearTimeout(id));
        };

        const result = await Promise.race(
            registries.map(fetchWithTimeout)
        );

        if (result) {
            console.log(`获取到最快的npm源 ${result.url}, 耗时: ${result.duration}ms`);
            return result.url;
        }

        console.error('获取npm源失败，使用默认的npm源' + this.clients[0].registry);
        return this.clients[0].registry;
    }

    async search(keyword, pluginNameKeyword, installedPluginInfoList = []) {
        const registry = await this.getFastestRegistry();
        const client = this.getClient(registry);
        return await client.search(registry, pluginNameKeyword, keyword, installedPluginInfoList);
    }

    async getPackage(name, installedPluginInfoList = []) {
        const registry = await this.getFastestRegistry();
        const client = this.getClient(registry);
        return await client.getPackage(registry, name, installedPluginInfoList);
    }
}

export default new PluginRegistryGateway();
