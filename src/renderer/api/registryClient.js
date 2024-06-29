import consumer from './Consumer';


class Registry {

    async getServiceList(registryCenterId) {}

    async getProviderList(serviceName, registryCenterId) {}
    
    async getConsumerList(serviceName, registryCenterId) {}
    
    async getConfiguration(providerInfo, registryCenterId) {}
    
    async saveConfiguration(registryCenterId, providerInfo, doc) {}
    
    async disableProvider(registryCenterId, providerInfo) {}
    
    async enableProvider(registryCenterId, providerInfo) {}

    async invokeMethod(registryCenterId, providerInfo, methodInfo, code) {}
}


export default consumer.wrapper(new Registry(), "registry");