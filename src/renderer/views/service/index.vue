<template>
  <split-pane @resize="resize" split="vertical" :min-percent="10" :default-percent="20">
    <template slot="paneL">
      <dragPane>
        <template slot="fisrtTitle">{{dataSourceInfo.name}}</template>
        <template slot="fisrtToolBar">
          <el-tooltip effect="light" :content="$t('refresh')" placement="right-start">
            <i class="el-icon-refresh iconButton" @click.stop="() => $refs.serviceTree.findList()"></i>
          </el-tooltip>
          <span class="serviceSizeTool">{{$t('count') }}:{{serviceCount}} </span>
        </template>
        <template slot="fisrtContent">
          <serviceTree ref="serviceTree"   @interfaceCountChange="count => serviceCount = count"  @collectService="(collectInfo) => $refs.collectItem.openCollectDialog(collectInfo)" />
        </template>

        <template slot="secondTitle">{{ $t('menu.myCollection') }}</template>
        <template slot="secondToolBar">
          <el-tooltip effect="light" :content="$t('refresh')"  placement="right-start">
            <i class="el-icon-refresh iconButton" @click.stop="() => $refs.collectItem.findList()"></i>
          </el-tooltip>
        </template>
        <template slot="secondContent">
          <collectItem ref="collectItem"  @openTab="addTab" ></collectItem>
        </template>

        <template slot="threeTitle">{{ $t('menu.invokeHistory') }}</template>
        <template slot="threeContent">
          <historyList @openTab="addTab"  @collectService="(collectInfo) => $refs.collectItem.openCollectDialog(collectInfo)"></historyList>
        </template>
      </dragPane>
    </template>
    <template slot="paneR">
      <myTabList ref="myTabs" navScrollClassList="dragRegion" tabListClassList="noDragRegion"></myTabList>
    </template>
  </split-pane>
</template>

<script>
import myTabList        from '@/renderer/components/tabs/index.vue';
import dragPane         from '@/renderer/components/drag-pane/index.vue';
import serviceTree      from "@/renderer/views/service/serviceTree.vue";
import collectItem      from "@/renderer/views/service/collectList.vue";
import historyList      from '@/renderer/views/service/historyList.vue';

export default {
  components: {
    myTabList,
    dragPane,
    serviceTree,
    collectItem,
    historyList
  },
  props: {
    dataSourceInfo: Object,
  },  
  data() {
    return {
      serviceCount: 0,
    }
  },
  provide() {
    return {
      mainPanel: this,
      dataSourceInfo: this.dataSourceInfo,
      dataSourceId: this.dataSourceInfo._id,
      
      addTab: this.addTab,
      openServiceInfoPage: this.openServiceInfoPage,
      collectService:(collectInfo) => this.$refs.collectItem.openCollectDialog(collectInfo)
    }
  },
  methods: {
    resize() {},
    openServiceInfoPage(title, fullTitle, serviceInfo) {
      this.addTab({
        title: title,
        fullTitle: fullTitle,
        component: this.$appRenderer.getServicePageComponent(serviceInfo.type || "dubbo"),
        params: {
          serviceInfo
        }
      });
    },
    addTab(tabInfo) {
      this.$refs.myTabs.addTab(tabInfo);
    },

    getServiceManager() {
      return {
        addTab: (tabInfo) => {
          this.addTab(tabInfo);
        },
      };
    }
  },
}
</script>

<style>
</style>