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
    let {
        ip,
        port,
        serviceName
    } = provder;
    let params = JSON.parse(code);

    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {

        let socket = net.createConnection(port, ip);

        socket.on('error', function(error) {
            // if(error && error.code === "ECONNREFUSED") {
            //     reject(i18n.t("dubbo.invokePage.connectProviderError") )
            // }
            reject(new Error(i18n.t("dubbo.invokePage.connectProviderError", {e : error})))
            socket.end();
        });

        let tSocket = new telnetSocket.TelnetSocket(socket);
        let mainBuffer = Buffer.from("");
        tSocket.on("data", function (buffer) {
       
            mainBuffer = Buffer.concat([mainBuffer, buffer], mainBuffer.length + buffer.length);

            let result = mainBuffer.toString("utf8");

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