<template>
  <split-pane @resize="resize" split="vertical" :min-percent="10" :default-percent="20">
    <template slot="paneL">
      <dragPane>
        <template slot="fisrtTitle">{{connectInfo.name}}</template>
        <template slot="fisrtToolBar">
          <el-tooltip effect="light" content="刷新" placement="right-start">
            <i class="el-icon-refresh iconButton" @click.stop="() => $refs.connectItem.findInterfaceList()"></i>
          </el-tooltip>
          <span class="serviceSizeTool">总数: {{interfaceCount}} </span>
        </template>
        <template slot="fisrtContent">
          <connectItem ref="connectItem" :connectInfo="connectInfo"  @clickServiceInfo="clickServiceInfo" @interfaceCountChange="count => interfaceCount = count"  @collectServiceToGroup="() => $refs.collectItem.findInterfaceList()" />
        </template>

        <template slot="secondTitle">我的收藏</template>
        <template slot="secondToolBar">
          <el-tooltip effect="light" content="刷新" placement="right-start">
            <i class="el-icon-refresh iconButton" @click.stop="() => $refs.collectItem.findInterfaceList()"></i>
          </el-tooltip>
        </template>
        <template slot="secondContent">
          <collectItem ref="collectItem" :connectInfo="connectInfo"  @openTab="addTab"  @clickServiceInfo="clickServiceInfo" ></collectItem>
        </template>

        <template slot="threeTitle">调用历史</template>
        <template slot="threeContent">
          <historyList :connectInfo="connectInfo"  @openTab="addTab"></historyList>
        </template>
      </dragPane>
    </template>
    <template slot="paneR">
      <myTabList ref="myTabs" navScrollClassList="dragRegion" tabListClassList="noDragRegion"></myTabList>
    </template>
  </split-pane>
</template>

<script>
import myTabList from '@/renderer/components/tabs/index.vue';
import dragPane from '@/renderer/components/drag-pane/index.vue';
import connectItem from "@/renderer/views/connect/connect-item.vue";
import collectItem from "@/renderer/views/collect/collect-item.vue";
import historyList from '@/renderer/views/history/index.vue';

export default {
  components: {
    myTabList,
    dragPane,
    connectItem,
    collectItem,
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
      interfaceCount: 0,
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
}

.panel-item-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>