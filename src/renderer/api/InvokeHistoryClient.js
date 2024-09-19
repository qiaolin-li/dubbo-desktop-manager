/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class InvokeHistoryManager {

     findLastRecord(registryCenterId, serviceName, method) {}

     findList(registryCenterId, serviceName, method, page, size) { }

     findAllPage(registryCenterId, keyword, page, size){}
}

export default consumer.wrapper(new InvokeHistoryManager(), "invokeHistoryRepository");