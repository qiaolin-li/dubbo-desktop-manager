<template>
  <el-table :data="consumerList" :stripe="true" size="medium" :highlight-current-row="true" :border="true" :header-row-class-name="consumerListTableHeaderRowClassName">
    <el-table-column type="expand">
      <template slot="header">
        <el-tooltip class="item" effect="light" :content="$t('dubbo.consumerPage.exportExcel')" placement="top-start">
          <i class="el-icon-document" @click="exportExcel"></i>
        </el-tooltip>
      </template>
      <template slot-scope="props">
        <div v-for="method in props.row.methods" :key="method">{{method}}</div><br />
      </template>
    </el-table-column>
    <el-table-column prop="ip" :label="$t('dubbo.consumerPage.ip')" column-key="ip" show-overflow-tooltip min-width="110px"> </el-table-column>
    <el-table-column prop="application" :label="$t('dubbo.consumerPage.application')" show-overflow-tooltip min-width="200px"> </el-table-column>
    <el-table-column prop="version" :label="$t('dubbo.consumerPage.version')" show-overflow-tooltip>
      <template slot-scope="scope">
        {{scope.row.revision}}
      </template>
    </el-table-column>
    <el-table-column prop="check" :label="$t('dubbo.consumerPage.check')" show-overflow-tooltip>
      <template slot-scope="scope">
        {{scope.row.check ? $t('base.yes') : $t('base.no')}}
      </template>
    </el-table-column>
    <el-table-column prop="enable" :label="$t('dubbo.consumerPage.enable')" show-overflow-tooltip>
      <template slot-scope="scope">
        {{scope.row.enable ? $t('base.yes') : $t('base.no')}}
      </template>
    </el-table-column>
    <el-table-column prop="timeout" :label="$t('dubbo.consumerPage.timeout')" show-overflow-tooltip> </el-table-column>
    <el-table-column prop="retries" :label="$t('dubbo.consumerPage.retries')" show-overflow-tooltip> </el-table-column>
  </el-table>
</template>

<script>
import registry from "@/main/registry";
import ExcelExportUtils from "@/utils/ExcelExportUtilsClient.js";
const remote = require("@electron/remote");

export default {
  data() {
    return {
      consumerList: [],
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
      this.consumerList = await registry.getConsumerList(this.serviceName, this.registryCenterId);
    },
    consumerListTableHeaderRowClassName() {
      return "consumer-list-table-header";
    },
    exportExcel() {
      let filePaths = remote.dialog.showOpenDialogSync({
        title: this.$t('dubbo.consumerPage.selectExportDirectory'),
        defaultPath: "./",

        filters: [{
          name: "Excel",
          extensions: ["xlsx"]
        }],
        properties: [
          "openDirectory",
          "createDirectory"
        ]
      })

      if (filePaths) {
        let headerList = [
          {
            key: 'ip',
            title: this.$t('dubbo.consumerPage.ip'),
            width: 30
          },
          {
            key: 'application',
            title: this.$t('dubbo.consumerPage.application'),
          },
          {
            key: 'version',
            title: this.$t('dubbo.consumerPage.version'),
          },
          {
            title: this.$t('dubbo.consumerPage.check'),
            getContent: (row) => {
              return row.check ? this.$t('base.yes') : this.$t('base.no');
            }
          },
          {
            title: this.$t('dubbo.consumerPage.enable'),
            getContent: (row) => {
              return row.check ? this.$t('base.yes') : this.$t('base.no');
            }
          },
          {
            key: 'timeout',
            title: this.$t('dubbo.consumerPage.timeout'),
          },
          {
            key: 'retries',
            title: this.$t('dubbo.consumerPage.retries'),
          },
        ]


        let suffix = this.$moment(new Date()).format("YYYYMMDD_HHmmss");
        let filePath = filePaths[0] + `/${this.$t('dubbo.serviceTab.consumerList').replace(/\s/g, '_')}-${suffix}.xlsx`;
        try {

          ExcelExportUtils.generateExcelAndWriterFile(headerList, this.consumerList, filePath);
          this.$message({
            type: "success",
            message: this.$t('dubbo.providePage.exportSuccess'),
          });
        } catch (e) {
          this.$message({
            type: "error",
            message: this.$t('dubbo.providePage.exportError'),
          });
          console.log(e)
        }
      }

    },
  },
};
</script>

<style>
.consumer-list-table-header .el-table__cell {
  background-color: rgb(249, 249, 249) !important;
}
</style>