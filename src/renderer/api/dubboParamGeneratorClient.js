import consumer from './Consumer';

class DubboParamGenerator {

    /**
     * 生成参数
     */
    async generateParam(mateData, methodName) { }
}

export default consumer.wrapper(new DubboParamGenerator(), "dubboParamGenerator");