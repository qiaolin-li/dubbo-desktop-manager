<template>
  <div class="main-container">
    <div class="content-container">
      <split-pane split="vertical" :min-percent="25" :default-percent="25">
        <template slot="paneL">
          <div class="left-container">
            <registryList @clickServiceInfo="clickServiceInfo" />
          </div>
        </template>
        <template slot="paneR">
          <div class="right-tab-container" v-show="dubboListList.length > 0">
            <el-tabs id="dubboListTabs" v-model="currentTabId" type="border-card" closable @tab-remove="removeTab">
              <el-tab-pane class="tabPane" v-for="(item, index) in dubboListList" :key="item.id" :name="item.id">
                <span slot="label" class="notSelect"><i class="el-icon-date"></i> {{item.title}}</span>
              </el-tab-pane>
            </el-tabs>  
          </div>
          <div class="right-container" :min-percent="30" :default-percent="30" v-show="dubboListList.length > 0">
            <div v-for="(item, index) in dubboListList" :key="item.serviceName">
              <dubbo-list v-show="currentTabId == item.serviceName" :registryCenterId="item.registryCenterId" :serviceName="item.serviceName" />
            </div>
          </div>
          <welcome v-if="dubboListList.length == 0" />
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script>
import splitPane from "vue-splitpane";
import dubboList from "./dubbo/index.vue";

import registryList from "./connect/index.vue";
import welcome from "./welcome.vue";
import settings from "./settings/index.vue";
// import { ipcRenderer, remote, Menu } from 'electron'
const remote = require("@electron/remote");
import { ipcRenderer } from 'electron'

export default {
  components: {
    splitPane,
    dubboList,
    registryList,
    welcome,
    settings
  },
  data() {
    return {
      currentTabId: '',
      dubboListList: [],
      rightClickTabName: ""
    };
  },

  mounted() {

    let dubboListTabs = document.getElementById('dubboListTabs');
    let tabListElement = dubboListTabs.firstElementChild.firstElementChild.lastElementChild.firstElementChild;

    // 菜单键点击
    tabListElement.addEventListener('contextmenu', ev => {
      // 菜单模板
      const menuTemplate = [
        {
          label: this.$t('tab.close'),
          click: async () => {
            this.removeTab(this.rightClickTabName)
          }

        },
        {
          label: this.$t('tab.closeOther'),
          click: async () => {
            this.removeOtherTab(this.rightClickTabName)
          }
        },
        {
          label: this.$t('tab.closeAll'),
          click: async () => {
            this.removeAllTab(this.rightClickTabName)
          }
        }
      ];

      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);
      // 阻止默认行为
      ev.preventDefault();

      let pre = ev.target;
      let tabName = "";
      do {
        let id = pre.id;
        if (id && id.startsWith("tab-")) {
          tabName = id.substring(4, id.length);
          break;
        }

      } while ((pre = pre.parentElement) != null);
      this.rightClickTabName = tabName;

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    });


    ipcRenderer.on('openSettingsTabEvent', (event) => {
      this.openSettingsTab();
    });
  },
  methods: {

    clickServiceInfo(data) {
      let { serviceName, interfaceName, registryCenterId } = data;
      let exist = this.dubboListList.find(tab => tab.serviceName == serviceName);

      // 不存在，新增一个
      if (!exist) {
        let title = interfaceName.split(".")[interfaceName.split(".").length - 1];

        let data = {
          id: serviceName,
          title: title,
          serviceName,
          registryCenterId: registryCenterId
        };

        this.dubboListList.push(data);
      }

      this.currentTabId = serviceName;

      // 新增了节点
      setTimeout(() => {
        let dubboListTabs = document.getElementById('dubboListTabs');
        let firstElementChild = dubboListTabs.firstElementChild.firstElementChild.lastElementChild.firstElementChild;
        firstElementChild.style.transform = 'translateX(-' + 0 + 'px)'

        let serviceNameDiv = document.getElementById(`tab-${serviceName}`);

        let navScroll = dubboListTabs.firstElementChild.firstElementChild.lastElementChild;
        navScroll.scrollLeft = serviceNameDiv.offsetLeft;

      }, 5)

    },
    removeTab(id) {
      let tabs = this.dubboListList;
      let activeName = this.currentTabId;
      if (activeName === id) {
        tabs.forEach((tab, index) => {
          if (tab.id === id) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.id;
            }
          }
        });
      }

      for (let i = 0; i < this.dubboListList.length; i++) {
        if (this.dubboListList[i].id == id) {
          this.dubboListList.splice(i, 1);
          break;
        }
      }
      this.currentTabId = activeName;
    },
    removeOtherTab(id) {
      this.dubboListList = this.dubboListList.filter(info => info.id == id);
      this.currentTabId = id;
    },
    removeAllTab() {
      this.dubboListList = [];
      this.currentTabId = ""
    },
    openSettingsTab() {
      let exist = this.dubboListList.find(tab => tab.id == "settings");
      if (!exist) {

        this.dubboListList.push({
          id: "settings",
          title: "settings"
        });
      }

      this.currentTabId = "settings";
    }
  },
};
</script>

<style >
body {
  -webkit-app-region: drag;
}
.menu-div,.el-dialog,.el-table,table,.invoke-dubbo-dialog-content,.container,span,i,i:hover {
  -webkit-app-region: no-drag !important;
}
.main-container {
  margin: 0px;
  background-color: rgb(236, 236, 237);
  height: 100vh;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.content-container {
  height: 100vh;
}

.left-container {
  background-color: white;
  overflow-y: auto;
  height: 100%;
}
.right-container {
  overflow-y: auto;
}

.right-tab-container {
  height: 5vh;
  margin:5px;
  margin-bottom: 10px;
}

.el-tabs__item {
  color: #303133 !important;
  border: 1px solid rgb(236, 236, 237) !important ;
 }

.el-tabs__nav-scroll {
  overflow: auto !important;
}

.el-tabs__nav-scroll::-webkit-scrollbar {
  display: none !important; /* Chrome Safari */
}
</style>