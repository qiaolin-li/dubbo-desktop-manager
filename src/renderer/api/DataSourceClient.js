/* eslint-disable no-unused-vars */
import consumer from './Consumer';


class DataSourceClient {

    async getDataSourceList() {}

    async getFormConfig(dataSourceType){}

    async getServiceList(registryCenterId) {}

    async getProviderList(serviceName, registryCenterId) {}
    
    async getConsumerList(serviceName, registryCenterId) {}
    
    async getConfiguration(providerInfo, registryCenterId) {}
    
    async saveConfiguration(registryCenterId, providerInfo, doc) {}
    
    async disableProvider(registryCenterId, providerInfo) {}
    
    async enableProvider(registryCenterId, providerInfo) {}

    async invokeMethod(registryCenterId, providerInfo, methodInfo, code) {}
}


export default consumer.wrapper(new DataSourceClient(), "dataSourceFacade");