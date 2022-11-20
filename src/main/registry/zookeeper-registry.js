import common from "./common";
import zookeeperClient from "node-zookeeper-client";
import urlUtils from "@/utils/urlUtils.js";
import i18n from '../../i18n'
import configuration from '@/utils/Configuration';
import zkClientUtils from "./zookeeper/zkClientUtils";

const PRIVDER_PREFIX = "/dubbo";


async function getServiceList(registryConfig) {
  let zk = await zkClientUtils.createConncetion(registryConfig);

  return new Promise((resolve, reject) => {
    zk.getChildren(PRIVDER_PREFIX, async function (error, children) {

      if (error) {
        reject(new Error(i18n.t("connect.exportService.zookeeper.getServiceList.error", { e: error})));
        return;
      }

      resolve((children || []).map(e => new common.ServiceInfo(e, e)));
    });
  });
}


async function getProviderList(serviceName, registryConfig) {
  let zk = await zkClientUtils.createConncetion(registryConfig);
  let path = PRIVDER_PREFIX + "/" + serviceName + "/providers";

  return new Promise((resolve, reject) => {
    zk.getChildren(path, async function (error, children) {
      if (error) {
        reject(new Error(i18n.t("connect.exportService.zookeeper.getProviderList.error", { e: error})));
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


async function getConsumerList(serviceName, registryConfig) {
  let zk = await zkClientUtils.createConncetion(registryConfig);
  let path = PRIVDER_PREFIX + "/" + serviceName + "/consumers";

  return new Promise((resolve, reject) => {
    zk.getChildren(path, async function (error, children) {
      if (error) {
        reject(new Error(i18n.t("connect.exportService.zookeeper.getConsumerList.error", { e: error})));
        return;
      }

      resolve(await (children || []).map(data => parseConsumerInfo(decodeURIComponent(data))));
    });
  });
}




// 获取元数据信息
async function getMetaData(providerInfo, registryConfig) {
  let zk = await zkClientUtils.createConncetion(registryConfig);
  let {
    application,
    serviceName,
    version
  } = providerInfo;
  let path = `/dubbo/metadata/${serviceName}/${version}/provider/${application}`;

  return new Promise((resolve, reject) => {
    zk.getData(path, async function (error, data) {
      if (error) {
        reject(new Error(i18n.t("connect.exportService.zookeeper.getMetaData.error", { e: error})));
        return;
      }

      resolve(JSON.parse(data.toString("utf8")));
    });
  });
}


async function getCurrentConfiguration(registryConfig, providerInfo) {

  let config = await getConfiguration(registryConfig, providerInfo);

  let configData = configuration.yamlToJSON(config)

  return configData || configuration.createDefaultConfiguration(providerInfo.serviceName);
}


async function getConfiguration(registryConfig, providerInfo) {
  let zk = await zkClientUtils.createConncetion(registryConfig);

  let {
    serviceName,
    version
  } = providerInfo;
  let path = getPath(serviceName, version);

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    zk.getData(path, async function (error, data, stat) {

      if (error) {
        // 不存在节点，那么创建一个默认对象
        if (error.code == -101) {
          resolve(null);
          return;
        }
        reject(new Error(i18n.t("connect.exportService.zookeeper.getConfiguration.error", { e: error})));
        return;
      }

      resolve(data.toString("utf8"));
    });
  });

}


async function saveConfiguration(registryConfig, providerInfo, doc) {
  let zkClient = await zkClientUtils.createConncetion(registryConfig);
  let {
    serviceName,
    version
  } = providerInfo;
  let path = getPath(serviceName, version);


  // 如果没有配置，那么就删除他 
  if (!doc || !doc.configs || doc.configs.length == 0) {
    zkClient.remove(path, -1, function (error) {
      // 不存在，忽略即可
      if (error && error.code == -101) {
        return;
      }
      if (error) {
        throw new Error(new Error(i18n.t("connect.exportService.zookeeper.saveConfiguration.error", { e: error})));
      }
    });
    return;
  }

  // 更新
  // eslint-disable-next-line no-unused-vars
  zkClient.setData(path, Buffer.from(configuration.JSONToYaml(doc)), -1, function (error, stat) {
    if (error && error.code == -101) {
      // eslint-disable-next-line no-unused-vars
      zkClient.create(path, Buffer.from(configuration.JSONToYaml(doc)), zookeeperClient.CreateMode.PERSISTENT, function (error, stat) {
        if (error) {
          throw new Error(new Error(i18n.t("connect.exportService.zookeeper.saveConfiguration.error", { e: error})));
        }
      });
      return;
    }
  });

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
    dubboVersion: urlData.params.release,
    deprecated: urlData.params.deprecated,
    weight: urlData.params.weight,
    enabled: urlData.params.enabled,
    qosPort: urlData.params["qos.port"]
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