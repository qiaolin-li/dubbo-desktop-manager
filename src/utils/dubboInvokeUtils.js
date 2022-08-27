import JSONFormater from "./JSONFormater";

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
 * 解析响应信息
 * @param {String} result 
 * @returns 
 */
function resolveResponse(result) {
    // dubbo返回格式分为三部分，第一部分为
    let errorMessage = result.split("\n");
    // 调用成功
    if (errorMessage.length == 4) {
        let data = errorMessage[1].substring(8);
        let elapsedTime = errorMessage[2].substring(9)
        try {
            return new InvokeResult(JSONFormater(data), elapsedTime);
        } catch (e) {
            // 日后再收集
        }

        // 解析数据异常，以最原始的数据显示
        return new InvokeResult(data, elapsedTime);
    }

    // 调用失败
    return new InvokeResult(result, 0);
}

/**
 * 执行结果
 * @param {String}} data 响应的数据
 * @param {*} elapsedTime 耗时
 */
function InvokeResult(data, elapsedTime) {
    this.code = data;
    this.elapsedTime = elapsedTime;
}

export default {
    buildInvokeCommand,
    resolveResponse
}