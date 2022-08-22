<template>
  <div class="dubboProviderListContainer">
    <el-button type="primary" @click="exportExcel">点击导出</el-button>
    <el-table :data="providerList" class="content" @row-contextmenu="openMenu" id="out-table">
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
      <el-table-column :label="$t('dubbo.providePage.operate')">
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
    this.handleNodeClick();
  },
  methods: {
    exportExcel(id, title) {

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
        /* generate workbook object from table */
        var wb = XLSX.utils.table_to_book(document.querySelector("#out-table"))
        /* get binary string as output */
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
        try {
          require("fs").writeFileSync(filePaths[0] + "/test.xlsx", Buffer.from(wbout), "binary");
        } catch (e) { 
          if (typeof console !== 'undefined') {
            console.log(e, wbout) 
          }
        }
        return wbout
      }

    },
    async handleNodeClick() {
      this.providerList = await registry.getProviderList(this.serviceName, this.registryCenterId);
    },
    openInvokeDrawer(index, data) {
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

    openTelnet(index, data) {
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
    openMenu(row, column, event) {
      // 菜单模板
      const menuTemplate = [
        {
          label: "禁用-服务维度",
          click: async () => {
            await registry.disableProvider(row.serviceName, this.registryCenterId, row.address, row.version);
          }
        },
        {
          label: "禁用-应用维度",
          click: async () => {

          }
        },
        {
          label: "启用-服务维度",
          click: async () => {
            await registry.enableProvider(row.serviceName, this.registryCenterId, row.address, row.version);
          }
        }
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
</style>