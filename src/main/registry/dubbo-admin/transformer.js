import common from "../common";
import urlUtils from "@/main/common/utils/urlUtils.js";


function parseProvderInfo(data) {
    let urlData = urlUtils.parseURL(`dubbo://${data.address}/?${data.parameters}`);
    return new common.ProviderInfo({
        application: data.application,
        protocol: urlData.protocol,
        ip: urlData.host,
        port: urlData.port,
        serviceName: data.service,
        methods: urlData.params.methods.split(","),
        generic: urlData.params.generic,
        version: urlData.params.version,
        revision: urlData.params.revision,
        dubboVersion: urlData.params.release,
        deprecated: urlData.params.deprecated,
        weight: data.weight,
        enabled: data.enabled,
        group: ""
    });
}


function parseConsumerInfo(data) {
    let urlData = urlUtils.parseURL(`${data.url}?${data.parameters}`);
    let methods = urlData.params.methods || "";
    return new common.ConsumerInfo({
      ip: data.address,
      serviceName: urlData.params.interface,
      application: data.application,
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
  parseProvderInfo,
  parseConsumerInfo
}