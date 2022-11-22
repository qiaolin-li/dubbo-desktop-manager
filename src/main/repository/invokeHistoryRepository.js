import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("invokeHistory");


function InvokeHistory({ _id, serviceName, method, param, createTime = new Date().getTime() }) {
    this._id = _id,
    this.serviceName = serviceName;
    this.method = method;
    this.param = param;
    this.createTime = createTime;
}

function save(invokeHistory) {
    let queryParam = { 
        serviceName : invokeHistory.serviceName,
        method : invokeHistory.method
    };

    let sortParam = {        
        createTime: -1
    }
    return dbOperator.findFirstRecord(queryParam, sortParam).then(firstData => {
        if (firstData && firstData.length > 0) {
            let data = firstData[0];
            // 如果参数是一样的，就直接忽略，不保存到历史记录
            if (data.param == invokeHistory.param) {
                return Promise.resolve("success");
            }
        }
        return dbOperator.save(new InvokeHistory(invokeHistory));
    })
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
let data = {
    save,
    findList,
    InvokeHistory,
}

export default data