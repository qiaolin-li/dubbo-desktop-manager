import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("invokeHistory");


function InvokeHistory({ _id, registryCenterId, serviceName, uniqueServiceName, address, method, param, result, createTime }) {
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

function save(invokeHistory) {
    return dbOperator.save(new InvokeHistory(invokeHistory));
}


function findLastRecord(serviceName, method) {
    let queryParam = {
        uniqueServiceName: serviceName,
        method
    };

    let sortParam = {
        createTime: -1
    }

    return dbOperator.findOne(queryParam, sortParam);
}

function findList(serviceName, method, page, size) {
    let queryParam = {
        uniqueServiceName: serviceName,
        method
    };

    let sortParam = {
        createTime: -1
    }

    let pageParam = {
        page, size
    }

    return dbOperator.find(queryParam, sortParam, pageParam);
}

function findAllPage(keyword, page, size) {

    let queryParam = {
        ...(keyword ? { $or: [{ uniqueServiceName: keyword }, { method: 'keyword' }]} : {})
    };

    let sortParam = {
        createTime: -1
    }

    let pageParam = {
        page, size
    }

    return dbOperator.find(queryParam, sortParam, pageParam);
}

let data = {
    save,
    findLastRecord,
    findList,
    findAllPage,
    InvokeHistory,
}

export default data