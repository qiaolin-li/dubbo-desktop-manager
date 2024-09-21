<template>
  <div class="mytab-container" >
    <div class="mytab-container-title" v-show="tabList.length > 0">
      <el-tabs :id="divId" v-model="currentTabId" type="border-card" @tab-remove="(id) => this.removeTab(this.getTab(id))">
        <el-tab-pane class="tabPane" v-for="tab in tabList" :key="tab.id" :name="tab.id" :closable="tab.closable">
          <span slot="label" class="notSelect"><i class="el-icon-date"></i> {{tab.title}}</span>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="mytab-container-view" v-show="tabList.length > 0">
      <component v-bind="componentProps(tab)" v-for="tab in tabList" :key="tab.id" v-show="currentTabId == tab.id" />
    </div>
    <welcome v-if="tabList.length == 0" />
  </div>
</template>

<script>
import welcome from '@/renderer/components/welcome.vue';
const remote = require("@electron/remote");
import Sortable from "sortablejs";

export default {
  components: {
    welcome
  },
  props: {
    navScrollClassList: {
      type: String,
      default : "",
    },
    tabListClassList: {
      type: String,
      default : "",
    }
  },
  data() {
    return {
      divId: `tabDiv-${Math.random()}`,
      tabId: 1,
      currentTabId: '',
      tabList: [],
    };
  },
  created(){
    
},
  mounted() {
    const tabLisDiv = this.tabLisDiv = document.getElementById(this.divId);
    const tabListElement = tabLisDiv.firstElementChild.firstElementChild.lastElementChild.firstElementChild;
    if(this.navScrollClassList){
      tabLisDiv.firstElementChild.firstElementChild.lastElementChild.classList.add(this.navScrollClassList);
    }
    if(this.tabListClassList){
      tabListElement.classList.add(this.tabListClassList);
    }
    // const options = Object.assign({
    //   direction: "horizontal",
    //   animation: 150,
    //   swapThreshold: 0.20
    // });
    new Sortable(tabListElement, {
      animation: 150,
      ghostClass: 'blue-background-class',
    });

    // 菜单键点击
    tabListElement.addEventListener('contextmenu', ev => {
      // 阻止默认行为
      ev.preventDefault();

      let pre = ev.target;
      let tabId = "";
      do {
        let id = pre.id;
        if (id && id.startsWith("tab-")) {
          tabId = id.substring(4, id.length);
          break;
        }

      } while ((pre = pre.parentElement) != null);

      const currentTab = this.getTab(tabId);

      // 菜单模板
      const menuTemplate = [
        {
          label: this.$t('tab.refresh'),
          click: async () => {
            this.forceUpdateComponent(currentTab)
          }
        },
        { type: 'separator' },
        ...(currentTab.closable ? [{
          label: this.$t('tab.close'),
          click: async () => {
            this.removeTab(currentTab)
          }
        }] : []),
        {
          label: this.$t('tab.closeOther'),
          click: async () => {
            this.removeOtherTab(currentTab)
          }
        },
        {
          label: this.$t('tab.closeAll'),
          click: async () => {
            this.removeAllTab(currentTab)
          }
        }
      ];

      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    });

  },
  methods: {

    addTab(tabInfo) {
      let newTab = {
        id: `${this.tabId++}`,
        title: tabInfo.title,
        fullTitle: tabInfo.fullTitle || tabInfo.title,
        primaryKey: tabInfo.primaryKey || tabInfo.fullTitle || tabInfo.title,
        src: tabInfo.src,
        component: tabInfo.component,
        closable: tabInfo.closable === false ? false : true,
        params: tabInfo.params,
      };

      // 如果为单例并且已经打开了这个tab，让他显示即可
      const existTab = this.tabList.find(x => x.primaryKey === newTab.primaryKey);
      if (tabInfo.multiInstance || !existTab) {
        this.tabList.push(newTab);
        this.currentTabId = newTab.id;
      } else {
        this.currentTabId = existTab.id;
      }

      // 新增了节点
      setTimeout(() => {
        let firstElementChild = this.tabLisDiv.firstElementChild.firstElementChild.lastElementChild.firstElementChild;
        firstElementChild.style.transform = 'translateX(-' + 0 + 'px)'

        let serviceNameDiv = document.getElementById(`tab-${this.currentTabId}`);

        let navScroll = this.tabLisDiv.firstElementChild.firstElementChild.lastElementChild;
        navScroll.scrollLeft = serviceNameDiv.offsetLeft;
      }, 5)

      return newTab;
    },
    getTab(tabId){
      return this.tabList.find(x => x.id === tabId);
    },
    setCurrentTab(tabId){
      this.currentTabId = tabId;
    },
    removeTab(tab) {
      if(!tab.closable){
        return;
      }

      let tabs = this.tabList;

      // 删除tab，并且记录当前删除的下标位置
      let removeTabIndex = 0;
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].id == tab.id) {
          tabs.splice(i, 1);
          removeTabIndex = i;
          break;
        }
      }

      // 如果删除的tab未当前选中的tab，那么需要将后面或者前面的tab设置为选中
      if (this.currentTabId === tab.id) {
        let nextTab = tabs[removeTabIndex] || tabs[removeTabIndex - 1];
        if (nextTab) {
          this.currentTabId = nextTab.id;
        }
      }

    },
    removeOtherTab(tab) {
      this.tabList = this.tabList.filter(info => !info.closable || info.id === tab.id);

      // 当前选中的tab没被删除
      if(this.tabList.find(x => x.id === this.currentTabId)){
        return;
      }
      
      this.currentTabId = tab.id;
    },
    removeAllTab(tab) {
      this.tabList = this.tabList.filter(info => !info.closable);

      // 当前选中的tab没被删除
      if(this.tabList.find(x => x.id === this.currentTabId)){
        return;
      }

      if(this.tabList.length > 0){
        this.currentTabId = (this.tabList.find(x => x.id === tab.id) || this.tabList[0]).id;
      }
    },
    componentProps(tab) {
      if (tab.component) {
        return {
          is: tab.component,
          ...tab.params
        };
      }

      return {
        target: '_blank',
        rel: 'noopener',
        is: 'iframe',
        src: tab.src,
        height: "100%",
        width: "100%",
        style: "vertical-align:top",
        webpreferences: 'nodeIntegration=true, contextIsolation=false'
      }
    },
    forceUpdateComponent(tab) {
      // 相信不会有人点开100000个tab, 所以这里不会有id重复的情况
      tab.id = tab.id + 100000;

      this.$nextTick(() => {
        this.currentTabId = tab.id;
      });

    },
  },
};
</script>

<style >
.mytab-container {
  margin: 0px;
  background-color: white;
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}


.mytab-container-view {
  background-color: white;
  overflow-y: auto;
  height: 100%;
}

.mytab-container .el-tabs__header {
  border-bottom: 0px !important;
}

.mytab-container .el-tabs__item {
  color: #303133 !important;
  border-left: 1px solid rgb(236, 236, 237) !important ;
  border-right: 1px solid rgb(236, 236, 237) !important ;
  border-top: 1px solid rgb(236, 236, 237) !important ;
  line-height: 36px !important;
  height: 36px !important;
}

.mytab-container .el-tabs__nav-scroll {
  overflow: auto !important;
}

.mytab-container .el-tabs__nav-scroll::-webkit-scrollbar {
  display: none !important; /* Chrome Safari */
}

.blue-background-class {
  background-color: #C8E8FB;
}

.mytab-container .el-tabs__content {
  display: none;
}



</style>