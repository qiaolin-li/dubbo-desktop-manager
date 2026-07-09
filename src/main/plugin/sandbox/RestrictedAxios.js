import axios                from 'axios';
import { Logger }           from '@/main/common/logger';

const logger = new Logger("ddm-RestrictedAxios");

/**
 * 受限的网络请求 API
 * 支持域名白名单、请求频率限制
 */
class RestrictedAxios {
    constructor(pluginName, config = {}) {
        this.pluginName = pluginName;
        
        // 默认配置
        this.config = {
            // 允许的域名白名单（空数组表示允许所有）
            allowedDomains: config.allowedDomains || [],
            // 请求超时（毫秒）
            timeout: config.timeout || 10000,
            // 最大请求频率（请求/秒）
            maxRequestsPerSecond: config.maxRequestsPerSecond || 10,
        };

        // 请求频率控制
        this.requestTimestamps = [];
        
        // 创建 axios 实例
        this.instance = axios.create({
            timeout: this.config.timeout,
        });

        // 添加请求拦截器
        this.instance.interceptors.request.use(
            (config) => this._validateRequest(config),
            (error) => Promise.reject(error)
        );

        // 添加响应拦截器
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                logger.error(`插件 ${pluginName} 网络请求失败:`, error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * 验证请求是否允许
     */
    _validateRequest(config) {
        const url = config.url || '';
        
        // 检查域名白名单
        if (this.config.allowedDomains.length > 0) {
            try {
                // 处理相对路径
                let fullUrl = url;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    if (config.baseURL) {
                        fullUrl = new URL(url, config.baseURL).href;
                    } else {
                        // 相对路径，允许（可能是内部 API）
                        return config;
                    }
                }
                
                const urlObj = new URL(fullUrl);
                const isAllowed = this.config.allowedDomains.some(domain => {
                    // 支持通配符域名
                    if (domain.startsWith('*.')) {
                        const baseDomain = domain.substring(2);
                        return urlObj.hostname === baseDomain || urlObj.hostname.endsWith('.' + baseDomain);
                    }
                    return urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain);
                });
                
                if (!isAllowed) {
                    const error = new Error(`插件 ${this.pluginName} 无权访问域名: ${urlObj.hostname}`);
                    logger.warn(error.message);
                    throw error;
                }
            } catch (e) {
                if (e.message.includes('无权访问')) {
                    throw e;
                }
                // URL 解析失败，可能是相对路径，允许
            }
        }

        // 检查请求频率
        const now = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < 1000
        );
        
        if (this.requestTimestamps.length >= this.config.maxRequestsPerSecond) {
            const error = new Error(`插件 ${this.pluginName} 请求频率过高，请稍后重试`);
            logger.warn(error.message);
            throw error;
        }
        
        this.requestTimestamps.push(now);
        
        return config;
    }

    // 代理 axios 的方法
    get(url, config) {
        return this.instance.get(url, config);
    }

    post(url, data, config) {
        return this.instance.post(url, data, config);
    }

    put(url, data, config) {
        return this.instance.put(url, data, config);
    }

    delete(url, config) {
        return this.instance.delete(url, config);
    }

    patch(url, data, config) {
        return this.instance.patch(url, data, config);
    }

    head(url, config) {
        return this.instance.head(url, config);
    }

    options(url, config) {
        return this.instance.options(url, config);
    }

    request(config) {
        return this.instance.request(config);
    }

    // 支持 axios 的其他属性
    get defaults() {
        return this.instance.defaults;
    }

    get interceptors() {
        return this.instance.interceptors;
    }
}

export default RestrictedAxios;
