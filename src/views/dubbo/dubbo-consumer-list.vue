<template>
  <el-table :data="consumerList"  class="content" >
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
</template>

<script>
import registry from "@/core/registry";

export default {
  data() {
    return {
      consumerList: [],
    };
  },
  props: {
    registryCenterId : {
      type: String,
      required: true,
    }, 
    serviceName : {
      type: String,
      default:"",
    }
  },
  mounted() {
    this.handleNodeClick();
  },
  methods: {
    async handleNodeClick() {
      this.consumerList = await registry.getConsumerList(this.serviceName, this.registryCenterId);
    },
  },
};
</script>

<style>

</style>