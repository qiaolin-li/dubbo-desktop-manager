
import paramGenerator2X from './dubbo2Point7.js';
import paramGenerator3X from './dubbo3.js';


/**
 * 生成参数
 */
 function generateParam(mateData, methodName) {
    // 当前提供者使用的dubbo版本
    const release = mateData.parameters.release;
    
    if(!release || !release.startsWith('3.')) {
        return paramGenerator2X.generateParam(mateData, methodName);
    }
    
    return paramGenerator3X.generateParam(mateData, methodName);
}


export default {
    generateParam
}