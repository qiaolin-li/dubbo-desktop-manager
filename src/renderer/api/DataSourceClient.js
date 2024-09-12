/* eslint-disable no-unused-vars */
import consumer from './Consumer';
// 加载-基础组件
import appCore from '../core/AppRendener';

class DataSourceClient {

    async getServiceList(dataSourceInfo) {}

    async getProviderList(dataSourceInfo, serviceInfo) {}
    
    async getConsumerList(dataSourceInfo, serviceInfo) {}
    
    async getConfiguration(dataSourceInfo, serviceInfo, providerInfo) {}
    
    async saveConfiguration(dataSourceInfo, serviceInfo, providerInfo, doc) {}
    
    async disableProvider(dataSourceInfo, serviceInfo, providerInfo) {}
    
    async enableProvider(dataSourceInfo, serviceInfo, providerInfo) {}

    async invokeMethod(dataSourceInfo, serviceInfo, providerInfo, methodInfo, code, invokerType) {}
}


const dataSourceFacade = Object.create(consumer.wrapper(new DataSourceClient(), "dataSourceFacade"));

const invokeMethod = dataSourceFacade.invokeMethod;

dataSourceFacade.invokeMethod = async function (dataSourceInfo, serviceInfo, providerInfo, methodInfo, code, invokerType) {
    try {
        appCore.emit('invokeMethodBefore', {
            dataSourceFacade: dataSourceFacade,
            dataSourceInfo: dataSourceInfo,
            serviceInfo: serviceInfo,
            providerInfo: providerInfo,
            methodInfo: methodInfo,
            invokerType: invokerType,
            code: code
        });

        let result = await invokeMethod(dataSourceInfo, serviceInfo, providerInfo, methodInfo, code, invokerType);

        appCore.emit('invokeMethodAfter', {
            dataSourceFacade: dataSourceFacade,
            dataSourceInfo: dataSourceInfo,
            serviceInfo: serviceInfo,
            providerInfo: providerInfo,
            methodInfo: methodInfo,
            code: code,
            invokerType: invokerType,
            result: result,
        });

        return result;
    } catch (error) {
        appCore.emit('invokeMethodError', {
            dataSourceFacade: dataSourceFacade,
            dataSourceInfo: dataSourceInfo,
            serviceInfo: serviceInfo,
            providerInfo: providerInfo,
            methodInfo: methodInfo,
            code: code,
            invokerType: invokerType,
            error: error,
        });
        throw error;
    }
}

export default dataSourceFacade;