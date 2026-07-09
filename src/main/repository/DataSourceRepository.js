import DBUtils from "@/main/common/utils/DBUtils.js";
const dbOperator = new DBUtils("zkConnectInfo");


/**
 * 数据源实体类
 */
class DataSourceInfo {

    constructor(obj){
        Object.assign(this, obj)
        this.createTime = this.createTime || new Date().getTime();
    }
}

/**
 * 数据源持久化对象
 */
class DataSourceRepository {

    async save(dataSourceInfo){
        return dbOperator.save(new DataSourceInfo(dataSourceInfo));
    }
    
    async deleteConnect(id){
        return dbOperator.removeById(id);
    }
    
    async findList(){
        return dbOperator.findAll({ createTime : -1 });
    }
    
    async findById(id){
        const queryParam = {
            _id : id,
        };
        return dbOperator.findOne(queryParam);
    }
}

export default new DataSourceRepository();