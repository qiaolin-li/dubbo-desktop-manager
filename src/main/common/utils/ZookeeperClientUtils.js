import zookeeperClient from "node-zookeeper-client";
import i18n from '@/main/common/i18n'

class ZookeeperClientUtils {
  createConncetion(registryConfig) {
    let { address } = registryConfig;
  
    const OPTIONS = {
      sessionTimeout: registryConfig.sessionTimeout,
    };
  
    let zkClient = new Promise((resolve, reject) => {
        let zk = zookeeperClient.createClient(address, OPTIONS);
        zk.on("connected", function () {
          if(registryConfig.scheme && registryConfig.auth){
            zk.addAuthInfo(registryConfig.scheme, Buffer.from(registryConfig.auth));  
          }
          resolve(zk);
        });
    
        setTimeout(() => {
          reject(new Error(i18n.t("base.connectTimeOut")));
        }, OPTIONS.sessionTimeout);
    
        zk.connect();
      });

    return zkClient;
  }

  async getChildren(registryConfig, path){
    const zk = await this.createConncetion(registryConfig);

    return new Promise((resolve, reject) => {
      zk.getChildren(path, async function (error, children) {
        if (error) {
          reject(new Error(i18n.t("connect.exportService.zookeeper.getServiceList.error", { e: error})));
          return;
        }
  
        resolve(children || []);
      });
    });
  }
}

export default new ZookeeperClientUtils();