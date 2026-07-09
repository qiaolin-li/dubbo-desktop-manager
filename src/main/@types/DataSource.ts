export interface ServiceInfo {
    /** 服务名称 */
    serviceName: string;
    /** 唯一服务名称 */
    uniqueServiceName: string;
    /** 服务类型 */
    type: string;
    [key: string]: any;
}

export interface DataSourceResult {
    list: ServiceInfo[];
    separator: string;
    packageSeparator: string;
}

/**
 * 数据源操作类。
 */
export interface DataSource {
    getServiceList(dataSourceInfo: any, options?: Record<string, any>): Promise<DataSourceResult>;
    getProviderList(dataSourceInfo: any, serviceInfo: any): Promise<any[]>;
    getConsumerList(dataSourceInfo: any, serviceInfo: any): Promise<any[]>;
    disableProvider(dataSourceInfo: any, serviceInfo: any, providerInfo: any): Promise<void>;
    enableProvider(dataSourceInfo: any, serviceInfo: any, providerInfo: any): Promise<void>;
    getConfiguration(dataSourceInfo: any, serviceInfo: any, providerInfo: any): Promise<string | object>;
    saveConfiguration(dataSourceInfo: any, serviceInfo: any, providerInfo: any, yaml: string): Promise<void>;
    invokeMethod(dataSourceInfo: any, serviceInfo: any, provider: any, methodInfo: any, code: string, invokerType: string): Promise<any>;
}

export default DataSource;
