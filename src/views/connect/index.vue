<template>
  <div>

    <connectList ref="connectList" @clickServiceInfo="clickServiceInfo" @editConnect="editConnect"></connectList>

    <el-dialog title="新增链接" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <addConnect @saveSuccess="saveConnectSuccess" :id="currentConnectId" />
    </el-dialog>
  </div>

</template>

<script>
import addConnect from "./add/add-connect.vue";

import connectList from "./connect-list.vue";
import { ipcRenderer } from 'electron'

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
    clickServiceInfo(data){
        this.$emit("clickServiceInfo", data);
    }
  }
}
</script>

<style>
</style>