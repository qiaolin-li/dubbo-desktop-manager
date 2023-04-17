import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("invokeHistory");


function InvokeHistory({ _id, serviceName, method, param, result, createTime }) {
    this._id = _id,
    this.serviceName = serviceName;
    this.method = method;
    this.param = param;
    this.result = result;
    this.createTime = createTime || new Date().getTime();
}

function save(invokeHistory) {
    return dbOperator.save(new InvokeHistory(invokeHistory));
}

function findList(serviceName, method, page, size) {
    let queryParam = {
        serviceName,
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
        ...(keyword ? { $or: [{ serviceName: keyword }, { method: 'keyword' }]} : {})
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
    findList,
    findAllPage,
    InvokeHistory,
}

export default data