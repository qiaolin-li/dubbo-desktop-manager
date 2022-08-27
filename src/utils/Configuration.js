import yaml from "js-yaml";



function yamlToJSON(data) {
  if(!data){
    return null;
  }
  
  return yaml.load(data.toString("utf8"));
}

function JSONToYaml(doc) {
  return yaml.dump(doc);
}

function createDefaultConfiguration(serviceName) {
  let doc = {
    configVersion: "v2.7",
    key: serviceName,
    scope: "service",
    enabled: true,
    configs: []
  }
  return doc;
}


export default {
  yamlToJSON,
  JSONToYaml,
  createDefaultConfiguration,

}