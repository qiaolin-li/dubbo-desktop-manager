<template>
  <div class="interfaceContainer" v-show="connectInfo.isShow">
    <div class="searchTool">
      <el-input v-model="searchKeyword" placeholder="搜一搜" @input="searchKeywordChange($event)"></el-input>
      <span class="serviceSizeTool">{{allServiceList.length}}</span>
    </div>

    <!-- dubbo接口列表  -->
    <el-tree :data="serviceList" :props="defaultProps" :expand-on-click-node="false" @node-click="handleNodeClick"></el-tree>
  </div>
</template>

<script>
import registry from "@/core/registry";
import treeUtils from "@/utils/treeUtils.js";

export default {
  components: {
  },
  data() {
    return {
      init: false,
      allServiceList: [],
      serviceList: [],
      searchKeyword: "",
      defaultProps: {
        children: "children",
        label: "label",
      }
    };
  },
  props: {
    connectInfo: Object,
  },
  watch: {
    "connectInfo.isShow": {
      handler() {
        this.show();
      }
    },
    "connectInfo.refreshNum": {
      handler() {
        // 强行刷新
        this.findInterfaceList();

      }
    }
  },
  methods: {
    show() {
      // 已经初始化了
      if (this.init) {
        return;
      }
      this.init = true;
      // 初始化
      this.findInterfaceList();
    },
    findInterfaceList() {
      registry.getServiceList(this.connectInfo).then((list) => {
        for (let i = 0; i < list.length; i++) {
          list[i].leaf = true;
        }
        this.allServiceList = list;
        this.serviceList = this.optimizationTree();
        this.$message({
          type: "success",
          message: "刷新服务列表完成!",
        });
      }).catch(e => {
        this.$message({
          message: `刷新服务列表失败！原因：${e}`,
          type: 'warning'
        });
      });
    },
    searchKeywordChange() {
      this.serviceList = this.optimizationTree();
    },
    handleNodeClick(serviceInfo) {
      // 不是接口
      if (!serviceInfo || (serviceInfo.children && serviceInfo.children.length > 0)) {
        return;
      }
      let data = {
        connectInfo: this.connectInfo,
        serviceInfo: serviceInfo,
      };
      this.$emit("clickServiceInfo", data);
    },
    optimizationTree() {
      return treeUtils.createTree(this.allServiceList, ".", this.searchKeyword);
    },
  },
};
</script>

<style  >
.searchTool {
  display: flex;
}

.serviceSizeTool {
  line-height: 40px;
}

.el-tree-node__content {
  line-height: 40px;
  margin-top: 2px;
  font-size: 40px;
}

.el-tree-node {
}

.el-tree-node__label {
  margin-top: 10px 10px !important;
  font-size: 17px !important;
  line-height: 30px !important;
}
</style>