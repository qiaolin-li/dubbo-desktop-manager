import net from "net";
import telnetSocket from "telnet-stream";
import i18n from '@/i18n'
import dubboInvokeUtils from "@/utils/dubboInvokeUtils.js";

/**
 * 调用Dubbo接口
 * @param {Provider} provder 提供者信息
 * @param {*} method 方法名
 * @param {*} code 参数信息
 * @returns 
 */
function invokeMethod( provder,metadata,  method, code) {
    const telnetPort = metadata.parameters["qos.port"] || provder.port;
    debugger
    let {
        ip,
        serviceName
    } = provder;
    let params = JSON.parse(code);

    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {

        let socket = net.createConnection(telnetPort, ip);

        socket.on('error', function(error) {
            resolve({
                success : false,
                code :  i18n.t("dubbo.invokePage.connectProviderError", {e : error}),
                elapsedTime : 0
            });
            socket.end();
            return;
        });

        let tSocket = new telnetSocket.TelnetSocket(socket);
        let mainBuffer = Buffer.from("");
        tSocket.on("data", function (buffer) {
       
            mainBuffer = Buffer.concat([mainBuffer, buffer], mainBuffer.length + buffer.length);

            let result = mainBuffer.toString("utf8");

            // dubbo 3.0 未开启ip访问
            if(result.indexOf("Foreign Ip Not Permitted.") >= 0){
                resolve({
                    success : false,
                    code :  "Dubbo 已开启禁止外网连接，请确保配置当前客户端IP可以连接或者使用Java方式进行调用",
                    elapsedTime : 0
                });
                return;
            }

            // 数据还未接收完，再等等
            if (!result.endsWith("dubbo>")) {
                return;
            }

            // 解析结果
            resolve(dubboInvokeUtils.resolveResponse(result));
        });

        socket.setTimeout(30000);
        socket.on("timeout", () => {
            reject(new Error(i18n.t("dubbo.invokePage.invokeTimeOut")) )
            socket.end();
        })

        tSocket.write(dubboInvokeUtils.buildInvokeCommand({
            serviceName,
            method,
            params
        }));
    });
}

export default {
    invokeMethod
}