import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("zkConnectInfo");


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
        return await dbOperator.save(new DataSourceInfo(dataSourceInfo));
    }
    
    async deleteConnect(id){
        return await dbOperator.removeById(id);
    }
    
    async findList(){
        let queryParam = {};
       
        let sortParam = {
            createTime : -1
        }
        return await dbOperator.find(queryParam, sortParam, {});
    }
    
    async findById(id){
        let queryParam = {
            _id : id,
        };
        return await dbOperator.findOne(queryParam);
    }
}

export default new DataSourceRepository();