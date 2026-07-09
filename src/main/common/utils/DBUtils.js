import nedb                     from 'nedb';
import constant                 from "@/main/common/Constant.js";


class DBUtils {

    constructor(business) {
        // 实例化连接对象（不带参数默认为内存数据库）
        this.db = new nedb({
            filename: `${constant.APPLICATION_DATA_DIR}/${business}.db`,
            autoload: true
        });
    }
    
    /**
     * 保存数据，如果存在id，认为是修改；反之为新增
     * @param {*} data 
     * @returns 
     */
    save(data) {
        // 存在id，认为是修改
        if (data._id) {
            data.updateTime = Date.now();
            return new Promise((resolve, reject) => {
                this.db.update({ _id: data._id }, data, (err, ret) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(ret);
                });
            })
        }
        data.createTime = Date.now();
        return new Promise((resolve, reject) => {
            this.db.insert(data, (err, ret) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(ret);
            });
        })
    }


    /**
     * 删除指定id的数据
     * @param {*} id 
     * @returns 
     */
    removeById(id) {
        return new Promise((resolve, reject) => {
            this.db.remove({_id:id}, {}, (err, numRemoved) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(numRemoved);
            });

        })
    }

    /**
     * 根据条件批量删除数据
     * @param {*} queryParam 需要删除的条件
     * @returns
     */
    remove(queryParam = {}) {
        return new Promise((resolve, reject) => {
            this.db.remove(queryParam, { multi: true }, (err, numRemoved) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(numRemoved);
            });
        })
    }

    /**
     * 查询单条数据
     * @param {*} queryData 查询条件
     * @param {*} sortParam 排序条件
     * @returns 
     */
    async findOne(queryData, sortParam = {}) {
        const docs = await this.find(queryData, sortParam, { page: 1, size: 1 });
        return docs[0] || null;
    }

    /**
     * 查询数据列表
     * @param {*} queryParam 
     * @param {*} sortParam 
     * @param {*} pageParam 
     * @returns 
     */
    find(queryParam = {}, sortParam = {}, pageParam = {}) {
        // 查询
        return new Promise((resolve, reject) => {
            const { page = 1, size = 10 } = pageParam;
            const skipOffset = (page - 1) * size;
            this.db.find(queryParam).sort(sortParam).skip(skipOffset).limit(size).exec((err, docs) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(docs);
            });
        })
    }

    findAll(sortParam = {}) {
        // 查询所有
        return new Promise((resolve, reject) => {
            this.db.find({}).sort(sortParam).exec((err, ret) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(ret);
            });
        })
    }
}

export default DBUtils;
