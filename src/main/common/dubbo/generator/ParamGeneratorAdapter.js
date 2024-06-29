

class ParamGeneratorAdapter {

    constructor(paramGenerator2X, paramGenerator3X) {
        this.paramGenerator2X = paramGenerator2X;
        this.paramGenerator3X = paramGenerator3X;
    }

    /**
     * 生成参数
     */
    generateParam(mateData, methodName) {
        // 当前提供者使用的dubbo版本
        const release = mateData.parameters.release;
        
        if(!release || !release.startsWith('3.')) {
            return this.paramGenerator2X.generateParam(mateData, methodName);
        }
        
        return this.paramGenerator3X.generateParam(mateData, methodName);
    }
}


export default ParamGeneratorAdapter;