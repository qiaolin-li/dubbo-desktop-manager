<template>
  <div id="connectDiv">

    <connectList ref="connectList" @clickServiceInfo="clickServiceInfo" @editConnect="editConnect"></connectList>

    <el-dialog :title="$t('connect.addConnect')" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <addConnect @saveSuccess="saveConnectSuccess" :id="currentConnectId" />
    </el-dialog>
  </div>

</template>

<script>
import addConnect from "./add/add-connect.vue";

import connectList from "./connect-list.vue";
import { ipcRenderer } from 'electron'
const remote = require("@electron/remote");

export default {
  components: {
    addConnect,
    connectList
  },
  data() {
    return {
      dialogVisible: false,
      currentConnectId: "",
    };
  },
  created() {
    ipcRenderer.on('openAddConnectDialogEvent', (event) => {
      this.openAddConnectDialog();
    });


  },
  mounted() {
    let connectDiv = document.getElementById("connectDiv");

    // 菜单键点击
    connectDiv.addEventListener('contextmenu', ev => {
      // 菜单模板
      const menuTemplate = [
        {
          label: this.$t('menu.addConnect'),
          click: async () => {
            this.openAddConnectDialog();
          }
        }
      ];

      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);
      // 阻止默认行为
      ev.preventDefault();

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    });
  },
  methods: {
    openAddConnectDialog() {
      this.dialogVisible = true;
      this.currentConnectId = "";
    },
    // eslint-disable-next-line no-unused-vars
    saveConnectSuccess(data) {
      this.$message({
        type: "success",
        message: "新增连接成功!",
      });
      this.$refs.connectList.findConnectList();
      this.dialogVisible = false;
    },
    editConnect(id) {
      this.currentConnectId = id;
      this.dialogVisible = true;
    },
    clickServiceInfo(data) {
      this.$emit("clickServiceInfo", data);
    }
  }
}
</script>

<style>

#connectDiv {
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>