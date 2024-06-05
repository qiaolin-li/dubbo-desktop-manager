import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("zkConnectInfo");


function ZkConnectInfo(obj){
    Object.assign(this, obj)
    this.createTime = new Date().getTime();
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