<template>
  <div class="history-main-container notSelect">
    <div class="history-item-container" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
      <el-tree class="notSelect interfaceTree" ref="tree" :data="groupList" :props="defaultProps" node-key="_id" 
          highlight-current   :default-expanded-keys="defaultExpandIds" @node-expand="handleNodeExpand" @node-collapse="handleNodeCollapse"
          @node-click="openInvokeTab"   @node-contextmenu="openMenuList">

        <div class="custom-tree-icon" slot-scope="{ node, data }">
            <span slot="reference">{{ data.label }}</span>
        </div>

      </el-tree>
      
    </div>
  </div>
</template>

<script>
import invokeHisotryRecord from "@/renderer/api/InvokeHistoryClient.js";
const remote = require("@electron/remote");
import { ipcRenderer } from 'electron'
const lodash = require('lodash');

export default {
  inject: ['dataSourceId', 'collectService', 'addTab'],
  data() {
    return {
      defaultExpandIds: [],
      defaultProps: {
        children: "invokeHisotryList",
        label: "label",
      },
      busy: false,
      page: 1,
      size: 50,
      keyword: '',
      groupList: [],
      collapseIds: [],
    };
  },
  mounted() {
    this.loadMore();
    ipcRenderer.on(`newInvokeHisotryRecordEvent-${this.dataSourceId}`, () => {
      this.queryData(1, this.size, true);
    });
  },
  methods: {
    async loadMore() {
      this.queryData(this.page++, this.size);
    },
    async queryData(page, size, insertFront = false) {
      const list = await invokeHisotryRecord.findAllPage(this.dataSourceId, this.keyword, page, size);
      list.map(hisotry => {
        const momentDate = this.$moment(new Date(hisotry.createTime));
        const label = momentDate.isSame(new Date(), 'day') ? "Today" : momentDate.format('L');
        let group = this.groupList.find(x => x.label === label);
        if (!group) {
          group = {
            _id: `group-${label}`,
            label,
            invokeHisotryList: [],
          };
          this.defaultExpandIds.push(group._id);
          if (insertFront) {
            this.groupList = [group, ...this.groupList];
          } else {
            this.groupList.push(group);
          }
        }
        if (!group.invokeHisotryList.find(x => x._id === hisotry._id)) {
          hisotry.label = `${hisotry.serviceName.split(".")[hisotry.serviceName.split(".").length - 1]}#${hisotry.method}`;
          group.invokeHisotryList.push(hisotry);
          if (insertFront) {
            group.invokeHisotryList = group.invokeHisotryList.sort((a, b) => b.createTime - a.createTime);
          }
        }
      });
    },
    openInvokeTab(invokeHistry) {
      if(invokeHistry.invokeHisotryList && invokeHistry.invokeHisotryList.length > 0){
        return;
      }
      
      const startIndex = invokeHistry.serviceName.lastIndexOf(".") || -1;
      let tabData = {
        title: this.$t('service.callTitle', { address: invokeHistry.serviceName.substring(startIndex + 1) }),
        component: this.$appRenderer.getServiceInvokeComponent(invokeHistry.type || "dubbo"),
        params: {
          serviceInfo: invokeHistry,
          selectProviderAddress: invokeHistry.address,
          selectMethod: invokeHistry.method
        },
        multiInstance: true
      }

      this.$emit('openTab', tabData);
    },
    
    async openMenuList(event, invokeHistry){
      const menuTemplate = [];

      if(invokeHistry.invokeHisotryList && invokeHistry.invokeHisotryList.length > 0){
        if(!this.defaultExpandIds.find(item => item === invokeHistry._id)) {
          menuTemplate.push({
            label: this.$t('expand'), 
            click: () => this.handleNodeExpand(invokeHistry)
          });
        } else {
          menuTemplate.push({
            label: this.$t('collapse'), 
            click: () => this.handleNodeCollapse(invokeHistry)
          });
        }
      } else {
        menuTemplate.push({
          label: this.$t('collect.open'),
          click: async () => this.openInvokeTab(invokeHistry)
        });
        menuTemplate.push({ type: 'separator' });
        
        menuTemplate.push({
          label: this.$t('collect.collect'),
          click: async () => {
            const collectInfo = {
              name: invokeHistry.serviceName.substring(invokeHistry.serviceName.lastIndexOf('.') + 1),
              serviceName: invokeHistry.serviceName,
              serviceType: invokeHistry.serviceType || "dubbo",
              uniqueServiceName: invokeHistry.uniqueServiceName,
            }
            this.collectService(collectInfo)
          }
        });
      }
      menuTemplate.push({ type: 'separator' });

      // 注册插件菜单
      this.$appRenderer.fillPluginMenu("historyList", menuTemplate, {
        tab: {
          addTab: this.addTab
        }
      }, invokeHistry);

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
      if (!this.defaultExpandIds.find(item => item === data._id)) { 
        this.defaultExpandIds.push(data._id)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.$refs.tree.store._getAllNodes().forEach(item => {
        if(item.data._id === data._id){
          item.expanded = false
        }
      });

      lodash.remove(this.defaultExpandIds, item =>  item === data._id);
    },
  }
}
</script>

<style>
.history-main-container{
  min-width: max-content;
}


.my-divider {
  margin: 2px 0px;
}
.invoke-ui {
  line-height: 20px;
  font-size: 12px;
  font-weight: bold;
  list-style: none;
}

.invoke-ui li {
  display: block;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
}
.invoke-ui li:hover {
  background: #ccc;
}

.collapse-title {
  flex: 1 0 90%;
  order: 1;
}

.el-collapse-item__header {
  flex: 1 0 auto;
  order: -1;
}

</style>