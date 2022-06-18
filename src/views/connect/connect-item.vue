<template>
  <div class="interfaceContainer" v-show="connectInfo.isShow">
    <div class="searchTool">
      <el-input v-model="searchKeyword" placeholder="搜一搜" @input="searchKeywordChange($event)"></el-input>
      <span class="serviceSizeTool">{{allServiceList.length}}</span>
    </div>

    <!-- dubbo接口列表  -->
    <el-tree ref="tree" :data="serviceList" :props="defaultProps"  :highlight-current="true" :accordion="true"  
      :expand-on-click-node="false" @node-click="handleNodeClick">
      
        <div class="custom-tree-icon" slot-scope="{ node, data }">
          <i :class="['', data.children && data.children.length > 0  ? 'el-icon-folder' : 'test']" ></i> 
          <span>{{ data.label }}</span>
        </div>
      
      </el-tree>
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
      searchKeyword: "trade",
      expandAll:false,
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
      registry.getServiceList(this.connectInfo._id).then((list) => {
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
        registryCenterId: this.connectInfo._id,
        serviceName: serviceInfo.serviceName,
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

.custom-tree-icon {
   position: relative;
}

.el-icon-folder {
  margin-right: 5px;
   color: rgb(136, 241, 124);
    border-radius: 50%;
}

.test::before {
  content: "I";
  margin-right: 5px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: rgb(136, 241, 124);
  width: 17px;
  height: 17px;
  text-align: center;
  font-size: 17px;
  border-radius: 50%;
  display:inline-block;
  
}
</style>