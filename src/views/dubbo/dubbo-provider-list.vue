<template>
  <div class="dubboProviderListContainer">

    <el-table :data="providerList" class="content" >
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

    <el-dialog title="Telnet 连接" width="70%" top="5vh" :visible.sync="telnetDialogVisible">
      <dubbo-telnet :provider="currentProvider"></dubbo-telnet>
    </el-dialog>

  </div>
</template>

<script>
import registry from "@/core/registry";
import dubboTelnet from "./dubbo-telnet.vue";

export default {
  components: {
    dubboTelnet
  },
  data() {
    return {
      providerList: [],
      currentProvider: {},
      telnetDialogVisible: false
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
  mounted() {
    this.handleNodeClick();
  },
  methods: {
    openInvokeDrawer(index, data) {
      this.$emit("invokeProvider", data);
    },
    async handleNodeClick() {
      this.providerList = await registry.getProviderList(this.serviceName, this.registryCenterId);
    },
    openTelnet(index, provder) {
      this.currentProvider = provder;
      this.telnetDialogVisible = true;
    }
  },
};
</script>

<style>
.dubboProviderListContainer {
}
</style>