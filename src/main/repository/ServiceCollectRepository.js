import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("interfaceCollect");


/**
 * 收藏的服务实体类
 * 每一个对象对应收藏的一个服务信息
 */
class ServiceCollect {
    ServiceCollect({_id, registryCenterId, serviceName, name, group = null, createTime = new Date().getTime()}){
        this._id = _id, 
        this.registryCenterId = registryCenterId, 
        this.name = name;
        this.group = group;
        this.serviceName = serviceName;
        this.createTime = createTime;
    }
}


/**
 * 服务收藏持久层
 */
class ServiceCollectRepository {

    async save(interfaceInfo){
        return await dbOperator.save(new ServiceCollect(interfaceInfo));
    }
    
    async deletCollect(id){
        return await dbOperator.removeById(id);
    }
    
    async findList(registryCenterId){
        const queryParam = {
            registryCenterId
        };
       
        const sortParam = {
            createTime : -1
        }
    
        return await dbOperator.find(queryParam, sortParam, {});
    }
    
    async findGroupList(registryCenterId){
        const queryParam = {
            registryCenterId
        };
       
        const sortParam = {
            createTime : 1
        }
    
        const list = await dbOperator.find(queryParam, sortParam, {});
        const set = new Set();
        list.forEach(item => {
            if(item.group){
                set.add(item.group)
            }
        })
    
        return Array.from(set);
    }
    
    
    async findById(id){
        const queryParam = {
            _id : id,
        };
        return await dbOperator.findOne(queryParam);
    }
}

export default new ServiceCollectRepository();