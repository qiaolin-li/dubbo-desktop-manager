
class AppCore {

    constructor() {
        this.datasources = new Map();
        this.invokes = new Map();
        this.paramGenerators = new Map();
    }

    registerDataSource(type,  dataSource) {
        this.datasources.set(type, dataSource);
    }

    getDataSource(type = 'adapter') {
        return this.datasources.get(type);
    }

    registerInvoke(type, invoker) {
        this.invokes.set(type, invoker);
    }

    getInvoke(type = 'adapter') {
        return this.invokes.get(type);
    }

    registerParamGenerator(type, generator) {
        this.paramGenerators.set(type, generator);
    }

    getParamGenerator(type = 'adapter') {
        return this.paramGenerators.get(type);
    }
    
}


export default new AppCore();