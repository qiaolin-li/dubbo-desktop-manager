<template>
  <div class="history-main-container notSelect">
    <div class="history-item-container" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
      <el-collapse v-model="activeNames">
        <el-collapse-item v-for="group in groupList" :key="group.label" :title="group.label" :name="group.label">
          <template slot="title">
            <span class="collapse-title">{{ group.label }}</span>
          </template>
          <ul class="invoke-ui">
            <li v-for="invokeHistry in group.invokeHisotryList" :key="invokeHistry._id" class="invoke-li" @dblclick="openInvokeTab(invokeHistry)"  @contextmenu.stop="openMenuList($event, invokeHistry)">
              {{ `${$moment(new Date(invokeHistry.createTime)).format('LTS')}: ${invokeHistry.serviceName.split(".")[invokeHistry.serviceName.split(".").length - 1] }#${invokeHistry.method}` }}
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import invokeHisotryRecord from "@/renderer/api/InvokeHistoryClient.js";
const remote = require("@electron/remote");
import { ipcRenderer } from 'electron'

export default {
  inject: ['dataSourceId', 'collectService'],
  data() {
    return {
      busy: false,
      page: 1,
      size: 50,
      keyword: '',
      activeNames: [],
      groupList: [],
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
        const label = momentDate.isSame(new Date(), 'day') ? '今天' : momentDate.format('ll');
        let group = this.groupList.find(x => x.label === label);
        if (!group) {
          group = {
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