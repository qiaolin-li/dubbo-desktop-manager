/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class ServiceCollectManager {
    save(interfaceInfo){}
    findList(registryCenterId){}
    findById(id){}
    findGroupList(registryCenterId){}
    deletCollect(id){}
}

export default consumer.wrapper(new ServiceCollectManager(), "serviceCollectRepository");