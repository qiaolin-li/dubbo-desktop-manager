const {
    execFile
} = require('child_process');
import fs from 'fs';
import path from 'path';
import constant from "@/utils/Constant.js";
import JSONFormater from "@/utils/JSONFormater";

let jarPath;
if (process.env.NODE_ENV === 'development') {
    jarPath = path.join(__dirname, '../public/jar/java-invoker.jar');
} else {
    jarPath = path.join(__dirname, '../app.asar.unpacked/jar/java-invoker.jar')
}


async function invokeMethod(provder, metadata, method, code) {
    let {
        ip,
        port,
        serviceName
    } = provder;

    let dataList = [];
    let params = JSON.parse(code);
    for (let i = 0; i < params.length; i++) {
        let data = params[i];
        if(typeof(data) =='string'){
            dataList.push(data);
        } else {
            dataList.push(JSON.stringify(data));
        }
    }


    let invokeParam = {
        interfaceName: serviceName,
        address: `${ip}:${port}`,
        version: provder.version,
        method: method,
        argsList: getMethodParameterTypes(metadata, method),
        dataList: dataList
    }

    const outFile = path.join(constant.APPLICATION_JAVA_INVOKE_DIR, `${serviceName}${new Date().getTime()}.json`);

    fs.writeFileSync(outFile, JSON.stringify(invokeParam));
 
    let data = await executeJar(outFile);

    if(data && !data.success) {
        console.log("调用Java失败：", data.data);
    }

    return new InvokeResult(JSONFormater(JSON.stringify(data.data)), data.elapsedTime);
}

// org.apache.dubbo.demo.provider.TestFacade 172.21.144.191:20880 test "[\"java.lang.String\",\"java.lang.Integer\",\"java.lang.Integer\"]" "[\"王老八\",\"18\",\"0\"]" /Users/qiaolin/.dubbo-desktop-manager/temp/aa.json

function executeJar(outFile) {
    const javaCommandPath = constant.JAVA_COMMAND_PATH;
    const commandArgs = [
        '-Dfile.encoding=utf-8',
        '-jar', jarPath,
        outFile
    ];

    const config = {
        // maxBuffer: 100 * 1024 * 1024 * 1024, // 1G
    }

    return new Promise((resolve, reject) => {

        execFile(javaCommandPath, commandArgs, config, (error, stdout, stderr) => {
            if (error) {
                let tempError = error.message || stderr || stdout;
                if (/spawn .* ENOENT/.test(tempError)) {
                    // JDK 不存在
                    'config.JavaHomeConfigResult.notFoundJDK'
                    reject({
                        success: false,
                        message: tempError
                    });
                    return;
                }
                reject({
                    success: false,
                    message: tempError
                });
                return;
            }

            let data = fs.readFileSync(outFile, 'utf8').toString();
            setTimeout(() => {
                fs.rmSync(outFile);
            }, 1);
            resolve(JSON.parse(data));
        });

    });


}


function getMethodParameterTypes(metadata, method) {
    let methodInfo = metadata.methods.find(m => m.name == method);
    return methodInfo.parameterTypes;
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
    invokeMethod
}