import common from "./common";
import zookeeperClient from "node-zookeeper-client";
import urlUtils from "@/utils/urlUtils.js";
import resolveMateData from "./resolveMateData";
import i18n from '../i18n'

const PRIVDER_PREFIX = "/dubbo";


function getServiceList(registryConfig) {
  let { address } = registryConfig;

  const OPTIONS = {
    sessionTimeout: 1000,
    requestTimeout : true
  };

  return new Promise((resolve, reject) => {
    let zk = zookeeperClient.createClient(address, OPTIONS);
    zk.on("connected", function () {
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

    setTimeout(() => {
      reject(i18n.t("dubbo.invokePage.connectTimeOut"));
    }, OPTIONS.sessionTimeout);

    zk.connect();
  });
}


function getProviderList(serviceName, registryConfig) {
  let { address } = registryConfig;

  const OPTIONS = {
    sessionTimeout: registryConfig.sessionTimeout,
  };

  return new Promise((resolve, reject) => {
    let zk = zookeeperClient.createClient(address, OPTIONS);
    zk.on("connected", function () {
      zk.getChildren(PRIVDER_PREFIX + "/" + serviceName + "/providers", async function (error, children) {
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
          array.push(parseProvderInfo(children[i]));
        }
        resolve(array);
      });
    });
    zk.connect();
  });
}


function parseProvderInfo(data) {
  let content = decodeURIComponent(data);
  let urlData = urlUtils.parseURL(content);
  return new common.ProviderInfo({
    application:urlData.params.application,
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

function getMethodFillObject(providerInfo, registryConfig, methodName){
  let { address } = registryConfig;
  const OPTIONS = {
    sessionTimeout: registryConfig.sessionTimeout,
  };

  let {application,serviceName, version} = providerInfo;

  let path = `/dubbo/metadata/${serviceName}/${version}/provider/${application}`;
  return new Promise((resolve, reject) => {
    let zk = zookeeperClient.createClient(address, OPTIONS);
    zk.on("connected", function () {
      zk.getData(path, async function (error, data) {
        if (error) {
          reject(error);
          return;
        }
        let jsonData = JSON.parse(data.toString("utf8"));
        resolve(resolveMateData.generateParam(jsonData, methodName));
      });
    });
    zk.connect();
  });
}


function getConsumerList(serviceName, registryConfig) {
  let { address } = registryConfig;

  const OPTIONS = {
    sessionTimeout: registryConfig.sessionTimeout,
  };

  return new Promise((resolve, reject) => {
    let zk = zookeeperClient.createClient(address, OPTIONS);
    zk.on("connected", function () {
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
    zk.connect();
  });
}


function parseConsumerInfo(data) {
  let urlData = urlUtils.parseURL(data);
  let methods = urlData.params.methods || "";
  return new common.ConsumerInfo({
    ip : urlData.host,
    serviceName : urlData.params.interface,
    application : urlData.params.application,
    check:urlData.params.check,
    version:urlData.params.version,
    timeout:urlData.params.timeout,
    enable:urlData.params["qos.enable"],
    revision:urlData.params.revision,
    methods: methods.split(","),
    dubbo:urlData.params.dubbo,
    lazy:urlData.params.lazy,
    pid:urlData.params.pid,
    release:urlData.params.release,
    retries:urlData.params.retries || 2,
    sticky:urlData.params.sticky,
    category:urlData.params.category,
    timestamp:urlData.params.timestamp,
  });
}


export default {
  getServiceList,
  getProviderList,
  getConsumerList,
  getMethodFillObject
}



