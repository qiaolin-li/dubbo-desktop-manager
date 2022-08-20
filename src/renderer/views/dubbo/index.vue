<template>
  <div class="dubbo-list-main-container">
    <el-tabs :id="tabId" type="card" tab-position="top" v-model="editableTabsValue">
      <el-tab-pane v-for="tabData in tabDataList" :key="tabData.id" :name="tabData.id">
        <span slot="label" class="notSelect"><i class="el-icon-date"></i> {{tabData.label}}</span>
        <div class="tab-content">
          <extend :registryCenterId="registryCenterId" :serviceName="serviceName" :tabData="tabData" @openNewTab="openNewTab"></extend>
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import extend from "./extend/index.vue";
const remote = require("@electron/remote");

export default {
  components: {
    extend,
  },
  data() {
    return {
      tabDataList: [

      ],
      editableTabsValue: "providerList",
      tabId :"",
    };
  },
  props: {
    registryCenterId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      default: "",
    }
  },
  created() {
    
    debugger
    this.tabId = `serviceInfoTab-${this.serviceName}`;
    this.tabDataList.push(
      {
        id: `providerList`,
        label: this.$t('dubbo.serviceTab.providerList'),
        componentName: "dubboProviderList",
        extendData: {
          provider: {},
          consumer: {},
          default: {},
        },
      });
    this.tabDataList.push(
      {
        id: `consumerList`,
        label: this.$t('dubbo.serviceTab.consumerList'),
        componentName: "dubboConsumerList",
        extendData: {
          provider: {},
          consumer: {},
          default: {},
        },
      });
  },
  mounted() {

    let serviceInfoTab = document.getElementById(this.tabId);
    let tabListElement = serviceInfoTab.firstElementChild.firstElementChild.lastElementChild.firstElementChild;

    // 菜单键点击
    tabListElement.addEventListener('contextmenu', ev => {
      // 菜单模板
      const menuTemplate = [
        {
          label: this.$t('base.refresh'),
          click: async () => {
            this.forceUpdateComponent(this.editableTabsValue)
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
      this.editableTabsValue = tabName;

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    });

  },
  methods: {
    openNewTab(tabData) {
      let exist = this.tabDataList.find(tab => tab.id == tabData.id);

      // 不存在，新增一个
      if (!exist) {
        this.tabDataList.push(tabData);
      }

      this.editableTabsValue = tabData.id;
    },
    forceUpdateComponent(targetName) {
      let nextId = targetName;
      for (let i = 0; i < this.tabDataList.length; i++) {
        if (this.tabDataList[i].id == targetName) {
          this.tabDataList[i].id += "1";
          nextId = this.tabDataList[i].id;
          break;
        }
      }

      this.$nextTick(() => {
        this.editableTabsValue = nextId;
      });

    },
    openInvokeDrawer(index, data) {
      data["uniqueId"] = this.serviceName;
      let tabData = {
        id: `invoke-${data.serviceName}-${data.address}`,
        label: this.$t('dubbo.providePage.callTitle', data),
        componentName: "dubboInvoke",
        extendData: {
          provider: data
        },
      }
      this.$emit("openNewTab", tabData);
    },
  },


};
</script>

<style >
.dubbo-list-main-container {
  height: 100vh;
  margin: 5px 0px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: white;
  border-radius: 5px;
}

.tab-content {
  height: 87vh;
  overflow-y: auto;
}
</style>