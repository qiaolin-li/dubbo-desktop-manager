<template>
  <div class="interfaceContainer" v-show="connectInfo.isShow">
    <div class="searchTool">
      <el-input v-model="searchKeyword" :placeholder="$t('connect.searchContent')" @input="searchKeywordChange($event)"></el-input>
      <span  class="serviceSizeTool">{{this.connectInfo.serviceSize}}</span>
    </div>

    <!-- dubbo接口列表  -->
    <el-tree class="notSelect" ref="tree" :data="serviceList" :props="defaultProps" node-key="label" :default-expanded-keys="defaultExpandIds" :highlight-current="true" :accordion="true" :expand-on-click-node="false" @node-click="handleNodeClick" @node-expand="handleNodeExpand" @node-collapse="handleNodeCollapse">

      <div class="custom-tree-icon" slot-scope="{ node, data }">
        <i :class="['', data.children && data.children.length > 0  ? 'el-icon-folder' : 'test']"></i>
        <span>{{ data.label }}</span>
      </div>

    </el-tree>
  </div>
</template>

<script>
import registry from "@/main/registry";
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
      expandAll: false,
      defaultExpandIds: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      exculdeName: ["mapping", "config", "metadata"]
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
        let a = "111";
        this.$message({
          type: "success",
          message: this.$t('connect.refreshSuccess'),
        });
      }).catch(e => {
        this.$message({
          message: this.$t('connect.refreshError', { e }),
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
      let keyword = "";
      if (this.searchKeyword) {
        keyword = this.searchKeyword.toLowerCase();
      }
      let filtedInterface = this.allServiceList.filter((i) => this.match(i, keyword));
      this.connectInfo.serviceSize = filtedInterface.length;
      return treeUtils.createTree(filtedInterface, ".");
    },
    match(service, keyword) {
      if (this.exculdeName.find(name => name == service.name)) {
        return false;
      }

      if (keyword) {
        if (service.name.toLowerCase().indexOf(keyword) !== -1) {
          return true;
        }
      } else {
        return true;
      }

      // 未来还可能支持其他的过滤方式
      return false;
    },
    // 树节点展开
    handleNodeExpand(data) {
      // 保存当前展开的节点
      let flag = false
      this.defaultExpandIds.some(item => {
        if (item === data.label) { // 判断当前节点是否存在， 存在不做处理
          flag = true
          return true
        }
      })
      if (!flag) { // 不存在则存到数组里
        this.defaultExpandIds.push(data.label)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.defaultExpandIds.some((item, i) => {
        if (item === data.label) {
          this.defaultExpandIds.splice(i, 1)
        }
      })
      this.removeChildrenIds(data) // 这里主要针对多级树状结构，当关闭父节点时，递归删除父节点下的所有子节点
    },

    // 删除树子节点
    removeChildrenIds(data) {
      const ts = this
      if (data.children) {
        data.children.forEach(function (item) {
          const index = ts.defaultExpandIds.indexOf(item.label)
          if (index > 0) {
            ts.defaultExpandIds.splice(index, 1)
          }
          ts.removeChildrenIds(item)
        })
      }

    }
  },
};
</script>

<style  >
.searchTool {
  display: flex;
}

.serviceSizeTool {
  line-height: 40px;
  width: 50px;
  padding-left: 2px;
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
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: rgb(136, 241, 124);
  width: 17px;
  height: 17px;
  text-align: center;
  font-size: 17px;
  border-radius: 50%;
  display: inline-block;
}
</style>