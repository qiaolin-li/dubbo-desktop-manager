<template>
  <div class="dubboProviderListContainer">
    <el-table :data="providerList" class="content" @row-contextmenu="openMenu" ref="report-table" :highlight-current-row="true" :stripe="true" :header-row-class-name="providerListTableHeaderRowClassName" size="medium">
      <el-table-column type="expand">
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
      <el-table-column prop="disabled" :label="$t('dubbo.providePage.disabled')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span class="versionSpan">{{ scope.row.disabled ? disableTypeMap[scope.row.disabledType] :''  }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="methods" :label="$t('dubbo.providePage.methodCount')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{scope.row.methods.length}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dubbo.providePage.operate')" fixed="right" width="150px">
        <template slot="header">
          <el-tooltip class="item" effect="light" :content="$t('dubbo.providePage.exportExcel')" placement="top-start">
            <i class="el-icon-document" @click="exportExcel"></i>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="openInvokeDrawer(scope.row)">{{$t('dubbo.providePage.call')}}</el-button>
          <el-button size="mini" @click="openTelnet(scope.row)">telnet</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import registry from "@/main/registry";
const remote = require("@electron/remote");
const XLSX = require("xlsx");


export default {
  components: {

  },
  data() {
    return {
      disableTypeMap: {
        service: "服务维度",
        application: "应用维度"
      },
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
    providerListTableHeaderRowClassName(row, column, cell, event) {
      return "provider-list-table-header";
    },
    exportExcel() {
      let filePaths = remote.dialog.showOpenDialogSync({
        title: "选择导出文件",
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
        const $e = this.$refs['report-table'].$el;
        // 如果表格加了fixed属性，则导出的文件会生产两份一样的数据，所以可在这里判断一下
        let $table = $e.querySelector('.el-table__fixed');
        if (!$table) {
          $table = $e;
        }
        // 为了返回单元格原始字符串，设置{ raw: true }
        const wb = XLSX.utils.table_to_book($table, { raw: true });
        const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
        try {
          require("fs").writeFileSync(filePaths[0] + "/提供者列表.xlsx", Buffer.from(wbout), "binary");
        } catch (e) {
          if (typeof console !== 'undefined') {
            console.log(e, wbout)
          }
        }
        return wbout
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
          label: "telnet",
          click: async () => {
            this.openTelnet(row);
          }
        },
        { type: 'separator' },
        {
          label: "服务维度-禁用",
          click: async () => {
            await registry.disableProvider(this.registryCenterId, row);
            this.refreshProviderList();
          }
        },
        {
          label: "服务维度-启用",
          click: async () => {
            await registry.enableProvider(this.registryCenterId, row);
            this.refreshProviderList();
          }
        },
        { type: 'separator' },
        {
          label: "编辑服务动态配置",
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
  background-color: rgb(249, 249, 249) !important;
  border-left: 1px solid rgb(234, 234, 234) !important;
  border-top: 1px solid rgb(234, 234, 234) !important;
  border-bottom: 1px solid rgb(234, 234, 234) !important;
}

.provider-list-table-header .el-table__cell {
}
</style>