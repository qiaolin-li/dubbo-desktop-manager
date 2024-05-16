/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class InterfaceCollectManager {
    save(interfaceInfo){}
    findList(registryCenterId){}
    findById(id){}
    findGroupList(registryCenterId){}
    deletCollect(id){}
}

export default consumer.wrapper(new InterfaceCollectManager(), "interfaceCollectRepository");