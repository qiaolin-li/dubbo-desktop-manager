<template>
  <div class="dubbo-list-main-container">
    <div class="servicenNameContainer">
      服务名：{{serviceInfo.serviceName}}
    </div>
    <el-divider content-position="left">提供者列表</el-divider>
    <el-table :data="providerList" class="content"  border>
      <el-table-column type="expand">
        <template slot-scope="props">
          <div v-for="method in props.row.methods" :key="method">{{method}}</div><br />
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" column-key="address">
      </el-table-column>
      <el-table-column prop="application" label="所属应用">
      </el-table-column>
      <el-table-column prop="version" label="版本号">
        <template slot-scope="scope">
          <el-tag type="success" disable-transitions>{{
            scope.row.revision
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="methods" label="方法数量">
        <template slot-scope="scope">
          {{scope.row.methods.length}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="openInvokeDrawer(scope.$index, scope.row)">调用</el-button>
          <el-button size="mini" @click="openTelnet(scope.$index, scope.row)">telnet</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-divider content-position="left">消费者列表</el-divider>
    <el-table :data="consumerList"  class="content"  border>
      <el-table-column type="expand">
        <template slot-scope="props">
          <div v-for="method in props.row.methods" :key="method">{{method}}</div><br />
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="ip" column-key="ip" show-overflow-tooltip min-width="110px"> </el-table-column>
      <el-table-column prop="application" label="所属应用" show-overflow-tooltip min-width="200px"> </el-table-column>
      <el-table-column prop="version" label="版本号" show-overflow-tooltip>
        <template slot-scope="scope">
           {{scope.row.revision}} 
        </template>
      </el-table-column>
      <el-table-column prop="check" label="检查">
        <template slot-scope="scope">
          {{scope.row.check ? '是' : '否'}}
        </template>
      </el-table-column>
      <el-table-column prop="enable" label="是否可用">
        <template slot-scope="scope">
          {{scope.row.enable ? '是' : '否'}}
        </template>
      </el-table-column>
      <el-table-column prop="timeout" label="超时"> </el-table-column>
      <el-table-column prop="retries" label="重试"> </el-table-column>
    </el-table>

    <el-dialog title="DUBBO 调用" width="70%" top="5vh" :visible.sync="dialogVisible">
      <dubbo-invoke :connectInfo="connectInfo" :provider="currentProvider" />
    </el-dialog>
    <el-dialog title="Telnet 连接" width="70%" top="5vh" :visible.sync="telnetDialogVisible">
      <dubbo-telnet :provider="currentProvider"></dubbo-telnet>
    </el-dialog>
  </div>
</template>

<script>
import dubboInvoke from "./dubbo-invoke.vue";
import registry from "@/core/registry";
import dubboTelnet from "./dubbo-telnet.vue";

export default {
  components: {
    dubboInvoke,
    dubboTelnet
  },
  data() {
    return {
      providerList: [],
      currentProvider: {},
      consumerList: [],
      dialogVisible: false,
      telnetDialogVisible: false
    };
  },
  props: {
    connectInfo: Object,
    serviceInfo: Object,
  },
  mounted() {

  },
  watch: {
    serviceInfo: {
      deep: true,
      handler() {
        this.handleNodeClick();
      },
    },
  },
  computed: {
    // 计算属性的 getter
    invokeDialogTitle: function () {
      return "调用Dubbo " + this.currentProvider.serviceName;
    },
  },
  methods: {
    openInvokeDrawer(index, data) {
      this.currentProvider = data;
      this.dialogVisible = true;
    },
    handleNodeClick() {

      registry.getConsumerList(this.serviceInfo, this.connectInfo).then(consumerList => {
        this.consumerList = consumerList;
      });
      registry.getProviderList(this.serviceInfo, this.connectInfo)
        .then((providerList) => {
          this.method = providerList[0] ? providerList[0].methods[0] : "";
          this.providerList = providerList;
        });
    },
    openTelnet(index, provder) {
      this.currentProvider = provder;
      this.telnetDialogVisible = true;
    }
  },
};
</script>

<style >
.dubbo-list-main-container {
  height: 95vh;
  overflow-y: auto;
  margin: 5px 0px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: white;
  overflow-y: auto;
  border-radius: 5px;
}

.servicenNameContainer {
  padding-left: 10px;
  padding-top: 10px;
  line-height: 30px;
}

.dubbo-list-main-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin: 5px 0px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: bisque;
  overflow-y: auto;
  border-radius: 5px;
}

.dubbo-list-main-telnet {
  width: 1000px;
  background-color: aquamarine;
}

.content{
   overflow-y: auto;
}

.top-container {
  border-bottom: rgb(230, 233, 243) 1px solid;
  /* height: 40px; */
  height: 5vh;
}
.top-container .el-button {
  height: 30px;
  margin-top: 5px;
  justify-content: center;
  padding: 0px 15px;
}

.content-container {
  height: 95vh;
}

.left-container {
  overflow-y: auto;
  height: 100%;
}
.right-container {
  overflow-y: auto;
}

.el-collapse-item {
  white-space: nowrap;
}

.methodSelect {
  width: 100%;
}
</style>