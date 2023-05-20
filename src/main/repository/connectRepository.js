import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("zkConnectInfo");

function ZkConnectInfo({_id, name ,type, address, namespaceId, username, password,sessionTimeout, createTime = new Date().getTime()}){
    this._id = _id, 
    this.name = name;
    this.type = type;
    this.address = address;
    this.namespaceId = namespaceId;
    this.username = username;
    this.password = password;
    this.sessionTimeout = sessionTimeout;
    this.createTime = createTime;
}

function save(zkConnectInfo){
    return dbOperator.save(new ZkConnectInfo(zkConnectInfo));
}

function deleteConnect(id){
    return dbOperator.removeById(id);
}

function findList(){
    let queryParam = {};
   
    let sortParam = {
        createTime : -1
    }


    return dbOperator.find(queryParam, sortParam, {});
}

async function findById(id){
    let queryParam = {
        _id : id,
    };
    return  dbOperator.findOne(queryParam);
}

let data = {
    save,
    findList,
    findById,
    deleteConnect,
    ZkConnectInfo,
}

export default data