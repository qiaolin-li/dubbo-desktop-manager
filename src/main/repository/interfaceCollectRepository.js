import dbUtils from "@/main/common/utils/DBUtils.js";
let dbOperator = dbUtils("interfaceCollect");

function InterfaceCollect({_id, registryCenterId, serviceName, name, group = null, createTime = new Date().getTime()}){
    this._id = _id, 
    this.registryCenterId = registryCenterId, 
    this.name = name;
    this.group = group;
    this.serviceName = serviceName;
    this.createTime = createTime;
}


function save(interfaceInfo){
    return dbOperator.save(new InterfaceCollect(interfaceInfo));
}

function deletCollect(id){
    return dbOperator.removeById(id);
}

function findList(registryCenterId){
    let queryParam = {
        registryCenterId
    };
   
    let sortParam = {
        createTime : -1
    }

    return dbOperator.find(queryParam, sortParam, {});
}

async function findGroupList(registryCenterId){
    let queryParam = {
        registryCenterId
    };
   
    let sortParam = {
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
    findGroupList,
    deletCollect,
    InterfaceCollect,
}

export default data