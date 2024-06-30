import yaml from "js-yaml";


class Configuration {

  yamlToJSON(data) {
    if(!data){
      return null;
    }
    
    return yaml.load(data.toString("utf8"));
  }

  JSONToYaml(doc) {
    return yaml.dump(doc);
  }

  createDubboDefaultConfiguration(serviceName) {
    let doc = {
      configVersion: "v2.7",
      key: serviceName,
      scope: "service",
      enabled: true,
      configs: []
    }
    return doc;
  }
}

export default new Configuration();