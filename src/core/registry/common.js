
/**
 * 服务信息，一个接口即为一个服务
 * @param {*} name 简化名称
 * @param {*} serviceName 
 */
function ServiceInfo(name, serviceName){
    this.name = name ;
    this.serviceName = serviceName;
}


function ProviderInfo(data){
    this.application = data.application;
    this.ip = data.ip;
    this.port = data.port;
    this.address = `${data.ip}:${data.port}`;
    this.serviceName = data.serviceName;
    this.methods = data.methods;
    this.generic = data.generic;
    this.deprecated = data.deprecated;
    this.dubboVersion = data.dubboVersion;
    this.revision = data.revision;
    this.version = data.version;
    this.weight = data.weight;
    this.enabled = data.enabled;
}

// consumer://10.255.189.77/com.indi.qiaolin.test.api.facade.TestFacade?
// application=test&category=consumers&check=false&dubbo=2.0.2
// &interface=com.indi.qiaolin.test.api.facade.TestFacade
// &lazy=false&methods=test,test2&pid=52
// &qos.enable=false&release=2.7.4.1&retries=0&revision=3.9.1-RC&side=consumer
// &sticky=false&timeout=1000&timestamp=1644718969822&version=1.0.0
function ConsumerInfo(data){
    this.ip = data.ip;
    // 服务名
    this.serviceName = data.serviceName;

    // 应用名
    this.application = data.application;

    // 启动时检查
    this.check = data.check;
    this.enable = data.enable;
    // 超时时间
    this.timeout = data.timeout;
    // Jar包版本
    this.revision = data.revision;

    // TODO 这是依赖了哪些方法，还是？
    this.methods = data.methods;
    this.dubbo = data.dubbo;
    this.lazy = data.lazy;
    this.pid = data.pid;
    this.release = data.release;

    // 重试次数
    this.retries = data.retries;

    this.sticky = data.sticky;
    this.category = data.category;

    this.timestamp = data.timestamp;

    // 服务的版本
    this.version = data.version;
}

export default {
    ServiceInfo,
    ProviderInfo,
    ConsumerInfo
}