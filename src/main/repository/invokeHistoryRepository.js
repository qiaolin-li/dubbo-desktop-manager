import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("invokeHistory");


/**
 * 调用历史记录实体类
 */
class InvokeHistory {

    constructor({ _id, registryCenterId, serviceName, uniqueServiceName, address, method, param, result, createTime }) {
        this._id = _id,
        this.registryCenterId = registryCenterId;
        this.serviceName = serviceName;
        this.uniqueServiceName = uniqueServiceName;
        this.address = address;
        this.method = method;
        this.param = param;
        this.result = result;
        this.createTime = createTime || new Date().getTime();
    }
}

 class InvokeHistoryRepository {

    async save(invokeHistory) {
        return await dbOperator.save(new InvokeHistory(invokeHistory));
    }
    
    async findLastRecord(registryCenterId, serviceName, method) {
        serviceName = serviceName.indexOf(":") > -1 ? serviceName.split(":")[0] : serviceName;
    
        const queryParam = {
            registryCenterId,
            serviceName,
            method
        };
    
        const sortParam = {
            createTime: -1
        }
    
        return await dbOperator.findOne(queryParam, sortParam);
    }
    
    async findList(registryCenterId, serviceName, method, page, size) {
        serviceName = serviceName.indexOf(":") > -1 ? serviceName.split(":")[0] : serviceName;
    
        const queryParam = {
            registryCenterId,
            serviceName: serviceName,
            method
        };
    
        const sortParam = {
            createTime: -1
        }
    
        const pageParam = {
            page, size
        }
    
        return await dbOperator.find(queryParam, sortParam, pageParam);
    }
    
    async findAllPage(registryCenterId, keyword, page, size) {
    
        const queryParam = {
            registryCenterId
        };
    
        const sortParam = {
            createTime: -1
        }
    
        const pageParam = {
            page, size
        }
    
        return await dbOperator.find(queryParam, sortParam, pageParam);
    }
    
 }

export default new InvokeHistoryRepository();