<template>
  <div class="interfaceContainer">
    <div class="searchTool">
      <el-input v-model="searchKeyword" :placeholder="$t('connect.searchContent')" @input="optimizationTreeFun" size="mini"></el-input>
    </div>

    <!-- dubbo接口列表  -->
    <el-tree class="notSelect interfaceTree" ref="tree" :data="serviceList" :props="defaultProps" node-key="nodeId" :default-expanded-keys="defaultExpandIds"
        :highlight-current="true" :accordion="true"  @node-click="handleNodeClick" @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse" @node-contextmenu="openContextMenu">

      <div class="custom-tree-icon" slot-scope="{ node, data }">
        <!-- <i :class="['', data.nodeType === 'package'  ? '' : 'interfaceIcon']"></i> -->
        <span>{{ data.nodeLabel }}</span>
      </div>

    </el-tree>
  </div>
</template>

<script>
import dataSource from "@/renderer/api/DataSourceClient.js";
import treeUtils from "@/renderer/common/utils/TreeUtils";
const remote = require("@electron/remote");
import lodash from 'lodash';



export default {
  components: {
  },
  data() {
    return {
      separator: '.',
      packageSeparator: '.',
      allServiceList: [],
      serviceList: [],
      searchKeyword: "",

      defaultExpandIds: [],
      defaultProps: {
        children: "nodeChildren",
        label: "nodeLabel",
      },
    };
  },
  inject: ['openServiceInfoPage', 'dataSourceInfo', 'dataSourceId', 'collectService', 'addTab'],
  mounted(){
    this.optimizationTreeFun = lodash.debounce(() => this.filterServiceList(), 300);
    this.findList();
  },
  methods: {
    async findList() {
      const data = await dataSource.getServiceList(this.dataSourceInfo);
      this.allServiceList = data.list;
      this.separator = data.separator;
      this.packageSeparator = data.packageSeparator;
    
      this.filterServiceList();
      this.$message({
        type: "success",
        message: this.$t('connect.refreshSuccess'),
      });
    },
    optimizationTreeFun(){},
    filterServiceList() {
      this.serviceList = this.optimizationTree(this.allServiceList);
    },
    optimizationTree() {
      const keyword =  this.searchKeyword ?this.searchKeyword.toLowerCase() : "";
      if (!keyword) {
        this.$emit("interfaceCountChange", this.allServiceList.length);
        return treeUtils.createTree(this.allServiceList, this.separator, this.packageSeparator);
      }

      const filtedInterface = this.allServiceList.filter((i) => this.match(i, keyword));
      this.$emit("interfaceCountChange", filtedInterface.length);
      return treeUtils.createTree(filtedInterface, this.separator, this.packageSeparator);
    },
    match(service, keyword) {
      return service.serviceName.toLowerCase().indexOf(keyword) !== -1;
    },
    handleNodeClick(serviceInfo) {
      if (!serviceInfo ){
        return;
      }
  
      if (serviceInfo.nodeType !== 'service') {
        return;
      }

      this.openServiceInfoPage(serviceInfo.nodeLabel, serviceInfo.serviceName, {
        serviceName: serviceInfo.serviceName,
        uniqueServiceName: serviceInfo.uniqueServiceName,
        type: serviceInfo.type || "dubbo"
      })
    },
    async openContextMenu(event, serviceInfo) {
      const menuTemplate = [
        ...(serviceInfo.nodeType === 'service' ? [{
          label: this.$t('collect.open'), click: () => this.handleNodeClick(serviceInfo)
        }] : []),
        ...(serviceInfo.nodeType === 'package' && !this.defaultExpandIds.find(item => item === serviceInfo.nodeId) ? [{
          label: this.$t('expand'), click: () => this.handleNodeExpand(serviceInfo)
        }] : []),
        ...(serviceInfo.nodeType === 'package' && this.defaultExpandIds.find(item => item === serviceInfo.nodeId) ? [{
          label: this.$t('collapse'), click: () => this.handleNodeCollapse(serviceInfo)
        }] : []),
        { type: 'separator' },
        ...(serviceInfo.nodeType === 'service' ? [{
          label: this.$t('collect.copyInterfaceName'),
          click: async () => this.$writeClipboard(serviceInfo.serviceName)
        }] : []),
      ];

      if(serviceInfo.nodeType === 'service' ) {
        menuTemplate.push({
          label: this.$t('collect.collect'),
          click: async () => {
            const collectInfo = {
              name: serviceInfo.nodeLabel,
              serviceName: serviceInfo.serviceName,
              serviceType: serviceInfo.serviceType || "dubbo",
              uniqueServiceName: serviceInfo.uniqueServiceName,
            }
            this.collectService(collectInfo)
          } 
        });
      }

      // 注册插件菜单
      this.$appRenderer.fillPluginMenu("serviceTree", menuTemplate, {
        tab: {
          addTab: this.addTab
        }
      }, serviceInfo);

      // 阻止默认行为
      event.preventDefault();
      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    },
    // 树节点展开
    handleNodeExpand(data) {
      // 保存当前展开的节点
      if (!this.defaultExpandIds.find(item => item === data.nodeId)) { 
        this.defaultExpandIds.push(data.nodeId)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.$refs.tree.store._getAllNodes().forEach(item => {
        if(item.data.nodeId === data.nodeId){
          item.expanded = false
        }
      });
      lodash.remove(this.defaultExpandIds, item =>  item.startsWith(data.nodeId));
    },
  },
};
</script>

<style  >

.interfaceContainer {
  height: 100%;
  min-width: max-content;
  display: flex;
  flex-direction: column;
}

.searchTool {
  display: flex;
}

.interfaceTree {
  height: 100%;
  overflow: auto;
}

.custom-tree-icon {
  position: relative;
}

.el-icon-folder {
  margin-right: 5px;
  color: rgb(136, 241, 124);
  border-radius: 50%;
}
.el-input.is-active .el-input__inner, .el-input__inner:focus {
    border-color: rgb(62, 177, 78) !important;
    outline: 0;
}

/* 未展开 */
.el-tree .el-icon-caret-right:before{   
  content: "\e6e0";
  font-size: 16px;
  color: #389e0d;
}

.el-tree .is-leaf::before {
    content: "S";
    /* margin-left: 5px; */
    /* font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; */
    font-family: Georgia, serif;
    color: #389e0d;
    border: 1px solid #389e0d ;
    width: 12px;
    height: 12px;
    text-align: center;
    font-size: 12px;
    border-radius: 50%;
    display: inline-block;
}
</style>