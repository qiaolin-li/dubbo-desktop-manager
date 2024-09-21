<template>
  <div class="history-main-container notSelect">
    <div class="history-item-container" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
      <el-tree class="notSelect interfaceTree" ref="tree" :data="groupList" :props="defaultProps" node-key="_id" default-expand-all
          highlight-current  @node-click="openInvokeTab"  
           @node-contextmenu="openMenuList">

        <div class="custom-tree-icon" slot-scope="{ node, data }">
          <span>{{ data.label }}</span>
        </div>

      </el-tree>
      
    </div>
  </div>
</template>

<script>
import invokeHisotryRecord from "@/renderer/api/InvokeHistoryClient.js";
const remote = require("@electron/remote");
import { ipcRenderer } from 'electron'


export default {
  inject: ['dataSourceId', 'collectService', 'addTab'],
  data() {
    return {
      defaultProps: {
        children: "invokeHisotryList",
        label: "label",
      },
      busy: false,
      page: 1,
      size: 50,
      keyword: '',
      activeNames: [],
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
        const label = momentDate.isSame(new Date(), 'day') ? momentDate.fromNow() : momentDate.format('L');
        let group = this.groupList.find(x => x.label === label);
        if (!group) {
          group = {
            _id: `group-${hisotry.createTime}`,
            label,
            invokeHisotryList: [],
          };
          this.activeNames.push(label);
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
      const menuTemplate = [{
          label: this.$t('collect.open'),
          click: async () => this.openInvokeTab(invokeHistry)
        },
        { type: 'separator' },
        {
           label: this.$t('collect.copyInterfaceName'),
          click: async () => {
            navigator.clipboard.writeText(invokeHistry.serviceName)
            this.$message({
              type: "success",
              message: this.$t('editor.copySuccess'),
            });
          }
        },
        { type: 'separator' },
      ];

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

    toggleExpand(data) {
      this.collapseIds = this.collapseIds.includes(data.label) ? this.collapseIds.filter(item => item !== data.label) : [...this.collapseIds, data.label]
    }
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