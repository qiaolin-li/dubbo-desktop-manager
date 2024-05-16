const {
    execFile
} = require('child_process');
import fs from 'fs';
import path from 'path';
import constant from "@/main/common/Constant.js";
import JSONFormater from "@/main/common/utils/JSONFormater";
import i18n from '@/main/common/i18n'
import common from "./common.js";
import appConfig from "@/main/common/config/appConfig.js";

let jarPath;
if (process.env.NODE_ENV === 'development') {
    jarPath = path.join(__dirname, '../public/jar/java-invoker.jar');
} else {
    jarPath = path.join(__dirname, '../app.asar.unpacked/jar/java-invoker.jar')
}


async function invokeMethod(provder, methodInfo, code) {
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
        protocol: provder.protocol,
        address: `${ip}:${port}`,
        version: provder.version,
        method: methodInfo.name,
        argsList: getMethodParameterTypes(methodInfo),
        dataList: dataList
    }

    const outFile = path.join(constant.APPLICATION_JAVA_INVOKE_DIR, `${serviceName}${new Date().getTime()}.json`);

    fs.writeFileSync(outFile, JSON.stringify(invokeParam));
 
    let data = await executeJar(outFile);

    if(data.success){
        return new common.InvokeResult(JSONFormater(JSON.stringify(data.data)), data.elapsedTime);
    }
    
    let errorMessage = data["data"]; 
    return new common.InvokeResult(errorMessage, data.elapsedTime);
}

// org.apache.dubbo.demo.provider.TestFacade 172.21.144.191:20880 test "[\"java.lang.String\",\"java.lang.Integer\",\"java.lang.Integer\"]" "[\"王老八\",\"18\",\"0\"]" /Users/qiaolin/.dubbo-desktop-manager/temp/aa.json

function executeJar(outFile) {
    const javaHome = appConfig.getProperty("javaHome");
    if(!javaHome){
        return Promise.resolve({
            success : false,
            data :  i18n.t("dubbo.invokePage.notFoundJDK", {javaHome: javaHome}),
            elapsedTime : 0
        });
    }
    const commandArgs = [
        '-Dfile.encoding=utf-8',
        '-jar', jarPath,
        outFile
    ];
    const config = {
        // maxBuffer: 100 * 1024 * 1024 * 1024, // 1G
    }

    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        execFile(`${javaHome}/bin/java`, commandArgs, config, (error, stdout, stderr) => {
            if (error) {
                let tempError = error.message || stderr || stdout;
                // JDK不存在
                if(/spawn .* ENOENT/.test(tempError)){
                    tempError = i18n.t("dubbo.invokePage.notFoundJDK", {javaHome: javaHome});
                }
                resolve({
                    success : false,
                    data :  tempError,
                    elapsedTime : 0
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


function getMethodParameterTypes(methodInfo) {
    return methodInfo.parameterTypes.map(paramterType => {
        if(paramterType.indexOf("<") >= 0) {
            return paramterType.substring(0, paramterType.indexOf("<"));

        }
        return paramterType;
    });
}


export default {
    invokeMethod
}