import consumer from './Consumer';

class InvokeHistoryManager {

     findList(serviceName, method, page, size) { }
}

export default consumer.wrapper(new InvokeHistoryManager(), "invokeHistoryRecord");