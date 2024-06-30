<template>
  <div class="interfaceContainer">
    <div class="searchTool">
      <el-input v-model="searchKeyword" :placeholder="$t('connect.searchContent')" @input="() => serviceList = optimizationTree()" size="mini"></el-input>
    </div>

    <!-- dubbo接口列表  -->
    <el-tree class="notSelect interfaceTree" ref="tree" :data="serviceList" :props="defaultProps" node-key="id" :default-expanded-keys="defaultExpandIds"
        :highlight-current="true" :accordion="true" :expand-on-click-node="false" @node-click="handleNodeClick" @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse" @node-contextmenu="openContextMenu">

      <div class="custom-tree-icon" slot-scope="{ node, data }">
        <i :class="['', data.children && data.children.length > 0  ? 'el-icon-folder' : 'interfaceIcon']"></i>
        <span>{{ data.label }}</span>
      </div>

    </el-tree>
  </div>
</template>

<script>
import dataSource from "@/renderer/api/DataSourceClient.js";
import serviceCollectClient from "@/renderer/api/ServiceCollectClient.js";
import treeUtils from "@/renderer/common/utils/treeUtils.js";
const remote = require("@electron/remote");
import lodash from 'lodash';

export default {
  components: {
  },
  data() {
    return {
      init: false,
      allServiceList: [],
      serviceList: [],
      searchKeyword: "",
      expandAll: false,
      defaultExpandIds: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      exculdeName: ["mapping", "config", "metadata"]
    };
  },
  props: {
    connectInfo: Object,
  },
  mounted(){
    this.findInterfaceList();
  },
  methods: {
    async findInterfaceList() {
      let list = await dataSource.getServiceList(this.connectInfo._id);
      for (let i = 0; i < list.length; i++) {
        list[i].leaf = true;
      }
      this.allServiceList = list;
      this.serviceList = this.optimizationTree();
      this.$message({
        type: "success",
        message: this.$t('connect.refreshSuccess'),
      });
    },
    handleNodeClick(serviceInfo) {
      // 不是接口
      if (!serviceInfo || (serviceInfo.children && serviceInfo.children.length > 0)) {
        return;
      }
      let data = {
        registryCenterId: this.connectInfo._id,
        serviceName: serviceInfo.serviceName,
        interfaceName: serviceInfo.label,
      };
      this.$emit("clickServiceInfo", data);
    },
    async openContextMenu(event, serviceInfo) {
      const menuTemplate = [
        ...(!serviceInfo.children || serviceInfo.children.length === 0 ? [{
          label: this.$t('collect.open'),
          click: async () => this.handleNodeClick(serviceInfo)
        }] : []),
        ...(serviceInfo.children && serviceInfo.children.length > 0 && !this.defaultExpandIds.find(item => item === serviceInfo.id) ? [{
          label: this.$t('expand'),
          click: async () => this.handleNodeExpand(serviceInfo)
        }] : []),
        ...(serviceInfo.children && serviceInfo.children.length > 0 && this.defaultExpandIds.find(item => item === serviceInfo.id) ? [{
          label: this.$t('collapse'),
          click: async () => this.handleNodeCollapse(serviceInfo)
        }] : []),
        { type: 'separator' },
        ...(!serviceInfo.children || serviceInfo.children.length === 0 ? [{
           label: this.$t('collect.copyInterfaceName'),
          click: async () => {
            navigator.clipboard.writeText(serviceInfo.serviceName)
            this.$message({
              type: "success",
              message: this.$t('editor.copySuccess'),
            });
          }
        }] : []),
      ];

      if(!serviceInfo.children || serviceInfo.children.length === 0 ) {
        const collectMenuList = [];
        const groupList = await serviceCollectClient.findGroupList(this.connectInfo._id);
        groupList.forEach(name => {
          collectMenuList.push({
            label: name,
            click: async () => this.collectServiceToGroup(serviceInfo, name)
          })
        })
    
        collectMenuList.push({
          label: this.$t('collect.newGroup'),
          click: async () => {
            this.$prompt(this.$t('collect.inputGroupName'), this.$t('hint'), {
              confirmButtonText: this.$t('confirm'),
              cancelButtonText:  this.$t('cancel')
            }).then(({ value }) => {
              this.collectServiceToGroup(serviceInfo, value);
            });
          }
        })

        collectMenuList.push({
          label: this.$t('collect.defaultGroup'),
          click: async () => this.collectServiceToGroup(serviceInfo)
        })

        menuTemplate.push({
          label: this.$t('collect.collect'),
          submenu: collectMenuList
        });
      }

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
    async collectServiceToGroup(serviceInfo, group = null) {
      await serviceCollectClient.save({
        registryCenterId: this.connectInfo._id,
        serviceName: serviceInfo.serviceName,
        name: serviceInfo.id,
        group: group
      })

      this.$message({
        type: "success",
        message: this.$t('editor.collectSuccess'),
      });

      this.$emit("collectServiceToGroup", serviceInfo, group);
    },
    optimizationTree() {
      let keyword =  this.searchKeyword ?this.searchKeyword.toLowerCase() : "";
      let filtedInterface = this.allServiceList.filter((i) => this.match(i, keyword));
      this.$emit("interfaceCountChange", filtedInterface.length);
      return treeUtils.createTree(filtedInterface, ".");
    },
    match(service, keyword) {
      if (this.exculdeName.find(name => name == service.name)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      // 未来还可能支持其他的过滤方式
      return service.name.toLowerCase().indexOf(keyword) !== -1;
    },
    // 树节点展开
    handleNodeExpand(data) {
      // 保存当前展开的节点
      // 不存在则存到数组里
      if (!this.defaultExpandIds.find(item => item === data.id)) { 
        this.defaultExpandIds.push(data.id)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.$refs.tree.store._getAllNodes().forEach(item => {
        if(item.data.id === data.id){
          item.expanded = false
        }
      });
      lodash.remove(this.defaultExpandIds, item =>  item === data.id);
      this.removeChildrenIds(data) // 这里主要针对多级树状结构，当关闭父节点时，递归删除父节点下的所有子节点
    },

    // 删除树子节点
    removeChildrenIds(data) {
      if (!data.children) {
        return;
      }
      data.children.forEach((item) =>{
        const index = this.defaultExpandIds.indexOf(item.id)
        if (index > 0) {
          this.defaultExpandIds.splice(index, 1)
        }
        this.removeChildrenIds(item)
      })
    }
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
</style>