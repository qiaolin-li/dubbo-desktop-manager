/** 
 * 构建invoke命令 
 */
function buildInvokeCommand({serviceName, method, params}) {
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

export default {
    buildInvokeCommand
}