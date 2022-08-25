import common from "./common";
import zookeeperClient from "node-zookeeper-client";
import urlUtils from "@/utils/urlUtils.js";
import i18n from '../../i18n'
import configuration from '@/utils/Configuration';

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
      for (let i = 0; i < children.length; i++) {
        let providerInfo = parseProvderInfo(children[i]);
        let disableInfo = await getDisableInfo(registryConfig, providerInfo);
        if (disableInfo && disableInfo.find(item => item === '0.0.0.0' || item === providerInfo.address)) {
          providerInfo.disabled = true;
          providerInfo.disabledType = "service";
        }
        array.push(providerInfo);
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



async function getCurrentConfiguration(registryConfig, providerInfo) {

  let config = await getConfiguration(registryConfig, providerInfo);

  let configData = configuration.yamlToJSON(config)
  
  if(configData){
    return configData;
  }

  return configuration.createDefaultConfiguration(providerInfo.serviceName);
}


async function getConfiguration(registryConfig, providerInfo) {
  let zk = await createConncetion(registryConfig);

  let {serviceName, version} = providerInfo;
  let path = getPath(serviceName, version);
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    zk.getData(path, async function (error, data, stat) {

      if (error) {
        // 不存在节点，那么创建一个默认对象
        if (error && error.code == -101) {
          resolve("");
          return;
        }
        reject(error);
        return;
      }

      resolve(data.toString("utf8"));
    });
  });

}


async function saveConfiguration(registryConfig,providerInfo, doc) {
  let zkClient = await createConncetion(registryConfig);
  let {serviceName, version} = providerInfo;
  let path = getPath(serviceName, version);

  if (doc && doc.configs && doc.configs.length > 0) {
    // eslint-disable-next-line no-unused-vars
    zkClient.setData(path, Buffer.from(configuration.JSONToYaml(doc)), -1, function (error, stat) {
      if (error && error.code == -101) {
        // eslint-disable-next-line no-unused-vars
        zkClient.create(path, Buffer.from(configuration.JSONToYaml(doc)), zookeeperClient.CreateMode.PERSISTENT, function (error, stat) {
          if (error) {
            console.log(error.stack);
            return;
          }
        });
        return;
      }
      console.log(error);
    });

    return;
  } else {
    zkClient.remove(path, -1, function (error) {
      if (error) {
        console.log(error);
        throw new Error();
      }
  
    });
  }

}


/**
 * 
 * @param {string} serviceName 
 * @param {string[]} versions 多个版本
 */
async function getDisableInfo(registryConfig, providerInfo) {
    let doc = await getCurrentConfiguration(registryConfig, providerInfo);
    let addressList = [];
    if (doc && doc.configs) {
      let configs = doc.configs;
      for (let j = 0; j < configs.length; j++) {
        let config = configs[j];
        // 规则不是开启的，忽略
        if (!config.enabled) {
          continue;
        }

        if (!config.parameters || !config.parameters.disabled || config.parameters.disabled != true) {
          continue;
        }

        addressList = addressList.concat(config.addresses);
      }
    }

  return addressList;
}


function getPath(serviceName, version) {
  return `/dubbo/config/dubbo/${serviceName}:${version ? version : ""}:.configurators`;
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

export default {
  getServiceList,
  getProviderList,
  getMetaData,
  getConsumerList,
  getConfiguration,
  getCurrentConfiguration,
  saveConfiguration
}