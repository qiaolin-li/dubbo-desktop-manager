/* eslint-disable no-unused-vars */
import consumer from './Consumer';


class DataSourceRepository {
    save(dataSourceInfo){ }
    
    deleteConnect(id){ }
    
    findList(){ }
    
    async findById(id){ }
}

export default consumer.wrapper(new DataSourceRepository(), "dataSourceRepository");