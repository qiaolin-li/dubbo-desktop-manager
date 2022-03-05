<template>
  <div class="main-container">
    <div class="top-container">
      <button @click="openAddConnectDialog()">增加链接</button>
    </div>
    <div class="content-container">
      <split-pane split="vertical" :min-percent="10" :default-percent="25">
        <template slot="paneL">
          <div class="left-container">
            <connectList ref="connectList" @clickServiceInfo="clickServiceInfo" @editConnect="editConnect"></connectList>
          </div>
        </template>
        <template slot="paneR">
          <div class="right-container" :min-percent="30" :default-percent="30">
            <dubbo-list :serviceInfo="serviceInfo" :connectInfo="connectInfo" />
          </div>
        </template>
      </split-pane>
    </div>

    <el-dialog title="新增链接" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <addConnect @saveSuccess="saveConnectSuccess" :id="currentConnectId" />
    </el-dialog>
  </div>
</template>

<script>
import splitPane from "vue-splitpane";
import dubboList from "./dubbo/dubbo-list.vue";
import addConnect from "./connect/add/add-connect.vue";
import connectList from "./connect/connect-list.vue";

export default {
  components: {
    splitPane,
    dubboList,
    addConnect,
    connectList,
  },
  data() {
    return {
      dialogVisible: false,
      serviceInfo: {},
      connectInfo: {},
      currentConnectId: "",
    };
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
    clickServiceInfo({ connectInfo, serviceInfo }) {
      this.connectInfo = connectInfo;
      this.serviceInfo = serviceInfo;
    },
    editConnect(id) {
      this.currentConnectId = id;
      this.dialogVisible = true;
    }
  },
};
</script>

<style >
.main-container {
  margin: 0px;
  background-color: rgb(229, 226, 228);
  height: 100vh;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.top-container {
  /* height: 40px; */
  height: 5vh;
  display: flex;
  flex-direction: row;
  background-color: white;
  margin-top: 5px;
  margin-left: 5px;
  margin-right: 5px;
}

button {
  border-radius: 0px;
  border: 1px solid;
}

.top-container button {
  justify-content: center;
  padding: 0px 15px;
  border-radius: 0px;
}

.content-container {
  height: 95vh;
}

.left-container {
  margin: 5px 5px;
  background-color: white;
  overflow-y: auto;
  border-radius: 5px;
  height: 100%;
}
.right-container {
  overflow-y: auto;
}
</style>