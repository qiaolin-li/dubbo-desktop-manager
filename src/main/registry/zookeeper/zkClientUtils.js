import zookeeperClient from "node-zookeeper-client";
import i18n from '@/i18n'


function createConncetion(registryConfig) {
    let { address } = registryConfig;
  
    const OPTIONS = {
      sessionTimeout: registryConfig.sessionTimeout,
    };
  
    let zkClient = new Promise((resolve, reject) => {
        let zk = zookeeperClient.createClient(address, OPTIONS);
        zk.on("connected", function () {
          resolve(zk);
        });
    
        setTimeout(() => {
          reject(i18n.t("base.connectTimeOut"));
        }, OPTIONS.sessionTimeout);
    
        zk.connect();
      });


    return zkClient;
  }
  

  export default { 
    createConncetion,
  }