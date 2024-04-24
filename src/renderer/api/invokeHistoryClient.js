import consumer from './Consumer';

class InvokeHistoryManager {

     findLastRecord(serviceName, method) {}

     findList(serviceName, method, page, size) { }

     findAllPage(keyword, page, size){}
}

export default consumer.wrapper(new InvokeHistoryManager(), "invokeHistoryRecord");