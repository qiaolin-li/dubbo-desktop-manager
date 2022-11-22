import consumer from './Consumer';


class ConnectionManager {
    save(zkConnectInfo){ }
    
    deleteConnect(id){ }
    
    findList(){ }
    
    async findById(id){ }
}

export default consumer.wrapper(new ConnectionManager(), "connectRepository");