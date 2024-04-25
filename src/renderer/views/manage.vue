<template>
  <split-pane @resize="resize" split="vertical" :min-percent="15" :default-percent="20">
    <template slot="paneL">
      <div class="left-container">
        <split-pane @resize="resize" split="horizontal" :min-percent="30" :default-percent="70" :fold="false">
          <template slot="paneL">
            <div class="panel-item-container">
              <connectItem :connectInfo="connectInfo"  @clickServiceInfo="clickServiceInfo"></connectItem>
            </div>
          </template>
          <template slot="paneR">
            <div class="panel-item-container">
              <historyList :connectInfo="connectInfo"  @openTab="addTab"></historyList>
            </div>
          </template>
        </split-pane>
      </div>
    </template>
    <template slot="paneR">
      <myTabList ref="myTabs" navScrollClassList="dragRegion" tabListClassList="noDragRegion"></myTabList>
    </template>
  </split-pane>
</template>

<script>
import myTabList from '@/renderer/components/tabs/index.vue';
import connectItem from "@/renderer/views/connect/connect-item.vue";
import historyList from '@/renderer/views/history/index.vue';

export default {
  components: {
    myTabList,
    connectItem,
    historyList
  },
  props: {
    connectInfo: Object,
  },  
  data() {
    return {
      currentMenu: {},
      menuList: [],
      menuPageList: [],
    }
  },
  methods: {
    resize() {},
    clickServiceInfo(data) {
      let { serviceName, interfaceName, registryCenterId } = data;
      this.addTab({
        title: interfaceName.split(".")[interfaceName.split(".").length - 1],
        fullTitle: interfaceName,
        componentName: 'dubboPage',
        params: {
          registryCenterId,
          interfaceName,
          uniqueServiceName: serviceName
        }
      });
    },
    addTab(tabInfo) {
      this.$refs.myTabs.addTab(tabInfo);
    },
  },
}
</script>

<style>

.el-main {
  padding: 0px !important;
}

.left-container {
  height: 100%;
  overflow: auto;
}

.panel-item-container {
  height: 100%;
  overflow: auto;
}


</style>