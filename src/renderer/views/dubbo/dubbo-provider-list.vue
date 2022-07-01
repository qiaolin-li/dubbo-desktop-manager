<template>
  <div class="dubboProviderListContainer">

    <el-table :data="providerList" class="content">
      <el-table-column type="expand">
        <template slot-scope="props">
          <div v-for="method in props.row.methods" :key="method">{{method}}</div><br />
        </template>
      </el-table-column>
      <el-table-column prop="address" :label="$t('dubbo.providePage.address')" column-key="address">
      </el-table-column>
      <el-table-column prop="application"  :label="$t('dubbo.providePage.application')" >
      </el-table-column>
      <el-table-column prop="version"  :label="$t('dubbo.providePage.version')">
        <template slot-scope="scope">
          <el-tag type="success" disable-transitions>{{
            scope.row.revision
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="methods"  :label="$t('dubbo.providePage.methodCount')" >
        <template slot-scope="scope">
          {{scope.row.methods.length}}
        </template>
      </el-table-column>
      <el-table-column  :label="$t('dubbo.providePage.operate')">
        <template slot-scope="scope">
          <el-button size="mini" @click="openInvokeDrawer(scope.$index, scope.row)">{{$t('dubbo.providePage.call')}}</el-button>
          <el-button size="mini" @click="openTelnet(scope.$index, scope.row)">telnet</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import registry from "@/main/registry";


export default {
  components: {

  },
  data() {
    return {
      providerList: []
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
    async handleNodeClick() {
      this.providerList = await registry.getProviderList(this.serviceName, this.registryCenterId);
    },
    openInvokeDrawer(index, data) {
      let tabData = {
        id: `invoke-${data.serviceName}-${data.address}`,
        label : this.$t('dubbo.providePage.callTitle', data),
        componentName: "dubboInvoke",
        extendData: {
          provider: data
        },
      }
      this.$emit("openNewTab", tabData);
    },

    openTelnet(index, data) {
      let tabData = {
        id: `telnet-${data.serviceName}-${data.address}`,
        label : `telnet ${data.address}`,
        componentName: "dubboTelnet",
        extendData: {
          provider: data
        },
      }
      this.$emit("openNewTab", tabData);
    }
  },
};
</script>

<style>
.dubboProviderListContainer {
}
</style>