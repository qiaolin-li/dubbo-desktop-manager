<template>
  <div class="dubboProviderListContainer">
    <el-table :data="providerList" class="content" @row-contextmenu="openMenu" ref="report-table" :highlight-current-row="true" :stripe="true" :header-row-class-name="providerListTableHeaderRowClassName" size="medium" :border="true">
      <el-table-column type="expand">
        <template slot="header">
          <el-tooltip class="item" effect="light" :content="$t('dubbo.providePage.exportExcel')" placement="top-start">
            <i class="el-icon-document" @click="exportExcel"></i>
          </el-tooltip>
        </template>
        <template slot-scope="props">
          <div v-for="method in props.row.methods" :key="method">{{method}}</div><br />
        </template>
      </el-table-column>
      <el-table-column prop="address" :label="$t('dubbo.providePage.address')" column-key="address" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column prop="application" :label="$t('dubbo.providePage.application')" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column prop="version" :label="$t('dubbo.providePage.version')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span class="versionSpan">{{ scope.row.revision  }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="disabled" width="100px" :label="$t('dubbo.providePage.disabled')" :show-overflow-tooltip="true">
        <template slot-scope="scope" v-if="scope.row.disabled ">
          <span class="versionSpan">{{ scope.row.disabled ? $t(`dubbo.providePage.disableTypeMap.${scope.row.disabledType}`) : ''  }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="methods" width="120px" :label="$t('dubbo.providePage.methodCount')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{scope.row.methods.length}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dubbo.providePage.operate')" fixed="right" width="150px">
        <template slot-scope="scope">
          <el-button size="mini" @click="openInvokeDrawer(scope.row)">{{$t('dubbo.providePage.call')}}</el-button>
          <el-button size="mini" @click="openTelnet(scope.row)">telnet</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import registry from "@/renderer/api/registryClient.js";
import ExcelExportUtils from "@/renderer/api/excelExporterClient.js";
const remote = require("@electron/remote");

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
    this.refreshProviderList();
  },
  methods: {
    providerListTableHeaderRowClassName() {
      return "provider-list-table-header";
    },
    async exportExcel() {
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

      if (!filePaths) {
        return;
      }
      let headerList = [
        {
          key: 'address',
          title: this.$t('dubbo.providePage.address'),
          width: 30
        },
        {
          key: 'application',
          title: this.$t('dubbo.providePage.application'),
        },
        {
          key: 'version',
          title: this.$t('dubbo.providePage.version'),
        },
        {
          title: this.$t('dubbo.providePage.disabled'),
          getContent: (row) => {
            return row.disabled ? this.$t(`dubbo.providePage.disableTypeMap.${row.disabledType}`) : '';
          }
        },
        {
          title: this.$t('dubbo.providePage.methodCount'),
          getContent: (row) => {
            return row.methods.length;
          }
        }
      ]

      let suffix = this.$moment(new Date()).format("YYYYMMDD_HHmmss");
      let filePath = filePaths[0] + `/${this.$t('dubbo.serviceTab.providerList').replace(/\s/g, '_')}-${suffix}.xlsx`;
      try {
        ExcelExportUtils.generateExcelAndWriterFile(headerList, this.providerList, filePath);
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
    },
    async refreshProviderList() {
      this.providerList = await registry.getProviderList(this.serviceName, this.registryCenterId);
    },
    openInvokeDrawer(data) {
      let tabData = {
        id: `invoke-${data.serviceName}-${data.address}`,
        label: this.$t('dubbo.providePage.callTitle', data),
        componentName: "dubboInvoke",
        extendData: {
          provider: data
        },
      }
      this.$emit("openNewTab", tabData);
    },

    openTelnet(data) {
      let tabData = {
        id: `telnet-${data.serviceName}-${data.address}`,
        label: `telnet ${data.address}`,
        componentName: "dubboTelnet",
        extendData: {
          provider: data
        },
      }
      this.$emit("openNewTab", tabData);
    },
    openConfiguration(data) {
      let tabData = {
        id: `configuration-${data.serviceName}-${data.version}`,
        label: `configuration ${data.version}`,
        componentName: "dubboProviderConfiguration",
        extendData: {
          provider: data
        },
      }
      this.$emit("openNewTab", tabData);
    },
    openMenu(row, column, event) {
      // 菜单模板
      const menuTemplate = [

        {
          label: this.$t('dubbo.providePage.call'),
          click: async () => {
            this.openInvokeDrawer(row);
          }
        },
        {
          label: "Telnet",
          click: async () => {
            this.openTelnet(row);
          }
        },
        { type: 'separator' },
        row.disabled ? {
          label: this.$t('dubbo.providePage.serviceEnable'),
          click: async () => {
            await registry.enableProvider(this.registryCenterId, row);
            this.refreshProviderList();
          }
        } : {
          label: this.$t('dubbo.providePage.serviceDisable'),
          click: async () => {
            await registry.disableProvider(this.registryCenterId, row);
            this.refreshProviderList();
          }
        }
        ,
        { type: 'separator' },
        {
          label: this.$t('dubbo.providePage.editConfiguration'),
          click: async () => {
            this.openConfiguration(row);
          }
        },
        // {
        //   label: "应用维度-禁用",
        //   click: async () => {

        //   }
        // }
      ];

      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });

      // 阻止默认行为
      event.preventDefault();
    }
  },

};
</script>

<style>
.versionSpan {
  color: rgb(114, 197, 76);
  background-color: rgb(237, 249, 230);
  padding: 5px 5px;
  border-radius: 5px;
}

.provider-list-table-header .el-table__cell {
  /* border-right : 0px !important; */
  background-color: rgb(249, 249, 249) !important;
  /* border-left: 1px solid rgb(234, 234, 234) !important; */
}

.el-table__cell {
  /* border-right : 0px !important; */
}
</style>