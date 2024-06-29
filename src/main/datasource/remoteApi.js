import appCore       from '@/main/AppCore.js';
import registry from "./index";

import zookeeperDataSource from "./dubbo/ZookeeperDataSource";
import nacosDataSource from "./dubbo/NacosDataSource";
import dubboAdminDataSource from './dubbo/DubboAdminDataSource';

appCore.registerDataSource('zookeeper', zookeeperDataSource);
appCore.registerDataSource('nacos', nacosDataSource);
appCore.registerDataSource('dubbo-admin', dubboAdminDataSource);

export default  [

    // 配置管理对象
    {
        name: "registry",
        target: registry,
    } 
]
