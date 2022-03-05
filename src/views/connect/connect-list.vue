<template>
  <div>
    <div class="mainContainer" v-for="connectInfo in connectInfoList" :key="connectInfo.name">
      <!-- zk 连接 -->
      <div :class="connectInfo.clickZk ? 'connectContainer notSelect selected' : 'connectContainer notSelect'" @click="openConnect(connectInfo)">
        <!-- zk 连接名称 -->
        <div class="connectContainer-left">
          <i class="iconfont icon-lianjie-connect" />
          {{ connectInfo.name }}
        </div>

        <!-- 操作按钮 -->
        <div class="connectContainer-right">
          <i class="el-icon-refresh" v-if="connectInfo.isShow" @click="refreshServiceList($event,connectInfo)"></i>
          <i class="el-icon-edit" @click="editConnect($event, connectInfo._id)"></i>
          <i class="el-icon-delete" @click="deleteConnect($event,connectInfo._id)"></i>
        </div>
      </div>
      <connectItem :connectInfo="connectInfo" @clickServiceInfo="clickServiceInfo"> </connectItem>
    </div>
  </div>
</template>

<script>
import connectRepository from "@/core/repository/connectRepository.js";
import connectItem from "./connect-item.vue";

export default {
  components: {
    connectItem,
  },
  data() {
    return {
      connectInfoList: [],
      interfaceInfo: {}
    };
  },
  mounted() {
    this.findConnectList();
  },
  methods: {
    findConnectList() {
      connectRepository.findList().then((connectInfoList) => {
        for (let i = 0; i < connectInfoList.length; i++) {
          connectInfoList[i].interfaceList = [];
          connectInfoList[i].isShow = false;
          connectInfoList[i].refreshNum = 0;
        }
        this.connectInfoList = connectInfoList;
      });
    },
    openConnect(connectInfo) {
      connectInfo.isShow = !connectInfo.isShow;

    },
    clickServiceInfo(data) {
      this.$emit("clickServiceInfo", data);
    },
    refreshServiceList(e,connectInfo){
      // TODO 暂时通过这种方式，后续再研究
      connectInfo.refreshNum++;
        e.stopPropagation();
    },
    // eslint-disable-next-line no-unused-vars
    editConnect(e, id) {
      this.$emit("editConnect", id);
      //W3C阻止冒泡方法
      e.stopPropagation();
    },
    deleteConnect(e, id) {
      this.$confirm(`此操作将永久删除改链接, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // eslint-disable-next-line no-unused-vars
        connectRepository.deleteConnect(id).then((num) => {
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.findConnectList();
        });
      }).catch(() => { });

      //W3C阻止冒泡方法
      e.stopPropagation();
    },
  }
}
</script>

<style>

.mainContainer {
  background-color: white;
  margin-top: 10px;
}


.connectContainer {
  display: flex;
  justify-content: space-between;
  line-height: 30px;
  padding-left: 10px;
}

.connectContainer-right i {
  margin-right: 5px;
  padding: 5px 5px;
}

.connectContainer-right i:hover {
  background-color: rgb(155, 206, 255);
}


.selected {
  background-color: rgb(155, 206, 255);
}

.notSelect {
  /* 不让用户选中 */
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
  not supported by any browser */
}

.is-current {
  background-color: #66b1ff87;
}


</style>