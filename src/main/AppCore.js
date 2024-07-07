import { Notification } from 'electron';

class AppCore {

    constructor() {
        this.datasources = new Map();
        this.invokes = new Map();
        this.paramGenerators = new Map();
    }

    registerDataSource(type,  dataSource) {
        this.datasources.set(type, dataSource);
    }

    removeDataSource(type) {
        this.datasources.delete(type);
    }

    getDataSource(type = 'adapter') {
        return this.datasources.get(type);
    }

    registerInvoke(type, invoker) {
        this.invokes.set(type, invoker);
    }

    removeInvoke(type) {
        this.invokes.delete(type);
    }

    getInvoke(type = 'adapter') {
        return this.invokes.get(type);
    }

    registerParamGenerator(type, generator) {
        this.paramGenerators.set(type, generator);
    }

    removeParamGenerator(type) {
        this.paramGenerators.delete(type);
    }

    getParamGenerator(type = 'adapter') {
        return this.paramGenerators.get(type);
    }

    notify(title, message) {
        new Notification({
            title: title,
            body: message
        }).show()
    }
    
}


export default new AppCore();