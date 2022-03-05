import net from "net";
import telnetSocket from "telnet-stream";

/**
 * 调用Dubbo接口
 * @param {Provider} provder 提供者信息
 * @param {*} method 方法名
 * @param {*} code 参数信息
 * @returns 
 */
function invokeMethod(provder, method, code) {
    let { ip, port, serviceName } = provder;
    let params = JSON.parse(code);

    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {

        let socket = net.createConnection(port, ip);

        let tSocket = new telnetSocket.TelnetSocket(socket);
        let mainBuffer = Buffer.from("");
        tSocket.on("data", function (buffer) {

            mainBuffer = Buffer.concat([mainBuffer, buffer], mainBuffer.length + buffer.length);

            let result = mainBuffer.toString("utf8");

            // 数据还未接收完，再等等
            if(!result.endsWith("dubbo>")){
               return;
            }
            
            // 数据完整返回过来了
            let errorMessage = result.split("\n");
            // 调用成功
            if (errorMessage.length == 4) {
                let data = errorMessage[1].substring(8);
                let elapsedTime = errorMessage[2].substring(9)

                let formatedCode = JSON.stringify(JSON.parse(data), null, 2)
                resolve(new InvokeResult(formatedCode, elapsedTime));
                return;
            }

            // // 出现异常了
            resolve(new InvokeResult(result, null));
        });

        tSocket.write(buildInvokeCommand({ serviceName, method, params }));
    });
}


/** 
* 构建invoke命令 
*/
function buildInvokeCommand({ serviceName, method, params }) {
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
function InvokeResult(data, elapsedTime) {
    this.code = data;
    this.elapsedTime = elapsedTime;
}

export default {
    buildInvokeCommand,
    invokeMethod
}