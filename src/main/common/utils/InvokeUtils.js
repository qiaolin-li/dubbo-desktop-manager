
/**
 * 执行结果
 * @param {String}} data 响应的数据
 * @param {*} elapsedTime 耗时
 */
class InvokeResult {
    constructor(data, elapsedTime) {
        this.data = data;
        this.elapsedTime = elapsedTime;
    }
}

export default {
    InvokeResult
}