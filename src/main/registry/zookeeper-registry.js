import common from "./common";
import zookeeperClient from "node-zookeeper-client";
import urlUtils from "@/utils/urlUtils.js";
import i18n from '../../i18n'
import Configuration from "./zookeeper/Configuration";

const PRIVDER_PREFIX = "/dubbo";


async function getServiceList(registryConfig) {

  let zk = await createConncetion(registryConfig);

  return new Promise((resolve, reject) => {
    zk.getChildren(PRIVDER_PREFIX, async function (error, children) {

      if (error) {
        reject(error);
        return;
      }

      if (children.length == 0) {
        resolve(new Array());
        return;
      }

      let array = new Array();
      for (let i = 0; i < children.length; i++) {
        array.push(new common.ServiceInfo(children[i], children[i]));
      }
      resolve(array);
    });
  });
}


async function getProviderList(serviceName, registryConfig) {
  let zk = await createConncetion(registryConfig);

  return new Promise((resolve, reject) => {
    zk.getChildren(PRIVDER_PREFIX + "/" + serviceName + "/providers", async function (error, children) {
      if (error) {
        reject(error);
        return;
      }

      if (children.length == 0) {
        resolve(new Array());
        return;
      }

      let array = [];
      let versionSet = new Set();
      for (let i = 0; i < children.length; i++) {
        let providerInfo = parseProvderInfo(children[i]);
        versionSet.add(providerInfo.version);
        array.push(providerInfo);
      }
      let versions = Array.from(versionSet);
      let versionDisableInfo = await Configuration.getDisableInfo(registryConfig, serviceName, versions);
     
      for (let i = 0; i < array.length; i++) {
        let providerInfo = array[i];
        let version = providerInfo.version;
        let disableInfo = versionDisableInfo[version];
        if (disableInfo && disableInfo.find(item => item === providerInfo.address)) {
          providerInfo.disabled = true;
          providerInfo.disabledType = "service";
        }
      }
      resolve(array);
    });
  });
}


function parseProvderInfo(data) {
  let content = decodeURIComponent(data);
  let urlData = urlUtils.parseURL(content);
  return new common.ProviderInfo({
    application: urlData.params.application,
    ip: urlData.host,
    port: urlData.port,
    serviceName: urlData.params.interface,
    methods: urlData.params.methods.split(","),
    generic: urlData.params.generic,
    version: urlData.params.version,
    revision: urlData.params.revision,
    dubboVersion: urlData.params.dubbo,
    deprecated: urlData.params.deprecated,
    weight: urlData.params.weight,
    enabled: urlData.params.enabled
  });
}


// 获取元数据信息
async function getMetaData(providerInfo, registryConfig) {
  let zk = await createConncetion(registryConfig);

  return new Promise((resolve, reject) => {
    let {
      application,
      serviceName,
      version
    } = providerInfo;
    let path = `/dubbo/metadata/${serviceName}/${version}/provider/${application}`;
    zk.getData(path, async function (error, data) {
      if (error) {
        reject(error);
        return;
      }
      let jsonData = JSON.parse(data.toString("utf8"));
      resolve(jsonData);
    });
  });
}





async function getConsumerList(serviceName, registryConfig) {
  let zk = await createConncetion(registryConfig);

  return new Promise((resolve, reject) => {
    zk.getChildren(PRIVDER_PREFIX + "/" + serviceName + "/consumers", async function (error, children) {
      if (error) {
        reject(error);
        return;
      }

      if (children.length == 0) {
        resolve(new Array());
        return;
      }
      let array = new Array();
      for (let i = 0; i < children.length; i++) {
        let content = decodeURIComponent(children[i]);
        array.push(parseConsumerInfo(content));
      }
      resolve(array);
    });
  });
}


function parseConsumerInfo(data) {
  let urlData = urlUtils.parseURL(data);
  let methods = urlData.params.methods || "";
  return new common.ConsumerInfo({
    ip: urlData.host,
    serviceName: urlData.params.interface,
    application: urlData.params.application,
    check: urlData.params.check,
    version: urlData.params.version,
    timeout: urlData.params.timeout,
    enable: urlData.params["qos.enable"],
    revision: urlData.params.revision,
    methods: methods.split(","),
    dubbo: urlData.params.dubbo,
    lazy: urlData.params.lazy,
    pid: urlData.params.pid,
    release: urlData.params.release,
    retries: urlData.params.retries || 2,
    sticky: urlData.params.sticky,
    category: urlData.params.category,
    timestamp: urlData.params.timestamp,
  });
}

async function disableProvider(serviceName, registryConfig, address, version) {
    return await Configuration.disableProvider(serviceName, registryConfig, address, version);
}

async function enableProvider(serviceName, registryConfig, address, version) {
    return await Configuration.enableProvider(serviceName, registryConfig, address, version);
}


function createConncetion(registryConfig) {
  let {
    address
  } = registryConfig;

  const OPTIONS = {
    sessionTimeout: registryConfig.sessionTimeout,
  };

  return new Promise((resolve, reject) => {
    let zk = zookeeperClient.createClient(address, OPTIONS);
    zk.on("connected", function () {
      resolve(zk);
    });

    setTimeout(() => {
      reject(i18n.t("base.connectTimeOut"));
    }, OPTIONS.sessionTimeout);

    zk.connect();
  });
}

export default {
  getServiceList,
  getProviderList,
  getMetaData,
  getConsumerList,
  disableProvider,
  enableProvider
}