import net              from "net";
import telnetSocket     from "telnet-stream";
import i18n             from '@/main/common/i18n'
import JSONFormater     from "@/main/common/utils/JSONFormater";
import InvokeUtils      from "@/main/common/utils/InvokeUtils.js";


class TelnetInvoker {

    /**
     * 调用Dubbo接口
     * @param {Provider} provder 提供者信息
     * @param {*} methodInfo 方法名
     * @param {*} code 参数信息
     * @returns 
     */
    invokeMethod( provder, methodInfo, code) {
        const telnetPort = provder.qosPort || provder.port;
        const { ip, serviceName } = provder;
        const params = JSON.parse(code);

        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
            const socket = net.createConnection(telnetPort, ip);

            socket.on('error', function(error) {
                resolve({
                    success : false,
                    data :  i18n.t("dubbo.invokePage.connectProviderError", {e : error}),
                    elapsedTime : 0
                });
                socket.end();
                return;
            });

            const tSocket = new telnetSocket.TelnetSocket(socket);
            let mainBuffer = Buffer.from("");
            tSocket.on("data", function (buffer) {
        
                mainBuffer = Buffer.concat([mainBuffer, buffer], mainBuffer.length + buffer.length);

                const result = mainBuffer.toString("utf8");
                // dubbo 3.0 未开启ip访问
                if(result.indexOf("Foreign Ip Not Permitted.") >= 0){
                    resolve({
                        success : false,
                        data :  "Dubbo 已开启禁止外网连接，请确保配置当前客户端IP可以连接或者使用Java方式进行调用",
                        elapsedTime : 0
                    });
                    return;
                }

                // 数据还未接收完，再等等
                if (!result.endsWith("dubbo>")) {
                    return;
                }

                // 解析结果
                resolve(this.resolveResponse(result));
            });

            socket.setTimeout(30000);
            socket.on("timeout", () => {
                reject(new Error(i18n.t("dubbo.invokePage.invokeTimeOut")) )
                socket.end();
            })

            tSocket.write(InvokeUtils.buildInvokeCommand({
                serviceName,
                method: methodInfo.name,
                params
            }));
        });
    }


    /**
     * 解析响应信息
     * @param {String} result 
     * @returns 
     */
    resolveResponse(result) {
        // dubbo返回格式分为三部分，第一部分为
        let errorMessage = result.split("\n");
        // 调用成功
        if (errorMessage.length == 4) {
            let data = errorMessage[1].substring(8);
            let elapsedTime = parseInt(errorMessage[2].substring(9, errorMessage[2].length - 4));
            try {
                return new InvokeUtils.InvokeResult(JSONFormater(data), elapsedTime);
            } catch (e) {
                // 日后再收集
            }

            // 解析数据异常，以最原始的数据显示
            return new InvokeUtils.InvokeResult(data, elapsedTime);
        }

        // 调用失败
        return new InvokeUtils.InvokeResult(result, 0);
    }
}

export default TelnetInvoker;