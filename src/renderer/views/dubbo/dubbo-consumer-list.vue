<template>
  <el-table :data="consumerList"  class="content" >
      <el-table-column type="expand">
        <template slot-scope="props">
          <div v-for="method in props.row.methods" :key="method">{{method}}</div><br />
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="ip" column-key="ip" show-overflow-tooltip min-width="110px"> </el-table-column>
      <el-table-column prop="application" :label="$t('dubbo.consumerPage.application')" show-overflow-tooltip min-width="200px"> </el-table-column>
      <el-table-column prop="version" :label="$t('dubbo.consumerPage.version')" show-overflow-tooltip>
        <template slot-scope="scope">
           {{scope.row.revision}} 
        </template>
      </el-table-column>
      <el-table-column prop="check" :label="$t('dubbo.consumerPage.check')">
        <template slot-scope="scope">
          {{scope.row.check ? $t('base.yes') : $t('base.no')}}
        </template>
      </el-table-column>
      <el-table-column prop="enable" :label="$t('dubbo.consumerPage.enable')">
        <template slot-scope="scope">
          {{scope.row.enable ? $t('base.yes') : $t('base.no')}}
        </template>
      </el-table-column>
      <el-table-column prop="timeout" :label="$t('dubbo.consumerPage.timeout')"> </el-table-column>
      <el-table-column prop="retries" :label="$t('dubbo.consumerPage.retries')"> </el-table-column>
    </el-table>
</template>

<script>
import registry from "@/main/registry";

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