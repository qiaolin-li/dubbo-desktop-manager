/** 
 * 构建invoke命令 
 */
function buildInvokeCommand({
    serviceName,
    method,
    params
}) {
    let paramStr = "";
    // let command = "invoke com.indi.qiaolin.test.api.facade.TestFacade.test(\"1\") \n";
    for (let i = 0; i < params.length; i++) {
        let data = params[i];
        if (typeof data === 'string') {
            data = `"${data}"`;
        } else {
            data = JSON.stringify(data);
        }
        if (i < params.length - 1) {
            data += ", "
        }
        paramStr += data;
    }

    return `invoke ${serviceName}.${method}(${paramStr}) \n`;
}

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
    buildInvokeCommand,
    InvokeResult
}