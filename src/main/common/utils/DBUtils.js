// 加载模块
const nedb = require('nedb');
import constant from "@/main/common/Constant.js";

function getDB(business) {
    // 实例化连接对象（不带参数默认为内存数据库）
    return new nedb({
        filename: `${constant.APPLICATION_DATA_DIR}/${business}.db`,
        autoload: true
    });
}

function save(data) {
    // 存在id，认为是修改
    if (data._id) {
        return new Promise((resovle, reject) => {
            this.db.update({ _id: data._id }, data, (err, ret) => {
                if (err) {
                    reject(err);
                    return;
                }
                resovle(ret);
            });
        })
    }
    // 插入单项
    return new Promise((resovle, reject) => {
        this.db.insert(data, (err, ret) => {
            if (err) {
                reject(err);
                return;
            }
            resovle(ret);
        });
    })
}


function removeById(id) {
    // 删除所有记录
    // 查询所有
    return new Promise((resovle, reject) => {
        this.db.remove({_id:id}, { multi: true }, (err, numRemoved) => {
            if (err) {
                reject(err);
                return;
            }
            resovle(numRemoved);
        });

    })
}

function removeAll() {
    // 删除所有记录
    // 查询所有
    return new Promise((resovle, reject) => {
        this.db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
                reject(err);
                return;
            }
            resovle(numRemoved);
        });

    })
}

function findOne(queryData) {
    // 查询单项
    return new Promise((resovle, reject) => {
        this.db.findOne(queryData, (err, ret) => {
            if (err) {
                reject(err);
                return;
            }
            resovle(ret);
        });
    })
}

function find(queryParam = {}, sortParam = {}, pageParam = {}) {
    // 查询
    return new Promise((resovle, reject) => {
        let { page = 1, size = 10 } = pageParam;
        let skipOffset = (page - 1) * size;
        this.db.find(queryParam).sort(sortParam).skip(skipOffset).limit(size).exec((err, docs) => {
            if (err) {
                reject(err);
                return;
            }
            resovle(docs);
        });
    })
}

function findFirstRecord(queryParam, sortParam) {
    // 查询
    return new Promise((resovle, reject) => {
        this.db.find(queryParam).sort(sortParam).limit(1).exec((err, docs) => {
            if (err) {
                reject(err);
                return;
            }
            resovle(docs);
        });
    })
}

function findAll() {
    // 查询所有
    return new Promise((resovle, reject) => {
        this.db.find({}, (err, ret) => {
            if (err) {
                reject(err);
                return;
            }
            resovle(ret);
        });
    })
}

export default function (business) {
    return {
        db: getDB(business),
        save,
        removeById,
        removeAll,
        findOne,
        find,
        findFirstRecord,
        findAll
    }
}
