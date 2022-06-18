<template>
  <div class="main-container">

    <div class="content-container">
      <split-pane split="vertical" :min-percent="10" :default-percent="25">
        <template slot="paneL">
          <div class="left-container">
            <registryList @clickServiceInfo="clickServiceInfo" />
          </div>
        </template>
        <template slot="paneR">
          <div class="right-tab-container">
            <el-tabs id="dubboListTabs" v-model="currentTabName" type="card" closable @tab-remove="removeTab">
              <el-tab-pane class="tabPane" v-for="(item, index) in dubboListList" :key="item.serviceName" :name="item.serviceName">
                <span slot="label" class="notSelect"><i class="el-icon-date"></i> {{item.title}}</span>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="right-container" :min-percent="30" :default-percent="30">
            <dubbo-list v-for="(item, index) in dubboListList" :key="index" v-show="currentTabName == item.serviceName" :registryCenterId="item.registryCenterId" :serviceName="item.serviceName" />
            <welcome v-if="dubboListList.length == 0" />
          </div>
        </template>
      </split-pane>
    </div>

  </div>
</template>

<script>
import splitPane from "vue-splitpane";
import dubboList from "./dubbo/dubbo-list.vue";

import registryList from "./connect/index.vue";
import welcome from "./welcome.vue";


export default {
  components: {
    splitPane,
    dubboList,
    registryList,
    welcome
  },
  data() {
    return {
      currentTabName: '',
      dubboListList: [],
    };
  },

  created() {
  },
  methods: {

    clickServiceInfo(data) {
      let { serviceName, registryCenterId } = data;
      let exist = this.dubboListList.find(tab => tab.serviceName == serviceName);

      // 不存在，新增一个
      if (!exist) {
        let title = serviceName.split(".")[serviceName.split(".").length - 1];

        this.dubboListList.push({
          title: title,
          serviceName,
          registryCenterId: registryCenterId
        });
      }

      this.currentTabName = serviceName;

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
    removeTab(targetName) {
      let tabs = this.dubboListList;
      let activeName = this.currentTabName;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.serviceName === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.serviceName;
            }
          }
        });
      }

      this.currentTabName = activeName;
      this.dubboListList = tabs.filter(tab => tab.serviceName !== targetName);
    }
  },
};
</script>

<style >
.main-container {
  width: 100vw;
  margin: 0px;
  background-color: rgb(229, 226, 228);
  height: 100vh;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.content-container {
  height: 100vh;
}

.left-container {
  margin: 5px 5px;
  background-color: white;
  overflow-y: auto;
  border-radius: 5px;
  height: 100%;
}
.right-container {
  overflow-y: auto;
}

.right-tab-container {
  height: 5vh;
  background-color: white;
  margin-top: 5px;
  margin-left: 5px;
  margin-right: 5px;
}

/* .el-tabs__nav-scroll {
  overflow-x: auto;
} */

/* .el-tabs__header {
  overflow: auto !important;
}

.el-tabs__nav-wrap {
  overflow: auto !important;
} */

.el-tabs__nav-scroll {
  overflow: auto !important;
}

.el-tabs__nav-scroll::-webkit-scrollbar {
  display: none !important; /* Chrome Safari */
}
</style>