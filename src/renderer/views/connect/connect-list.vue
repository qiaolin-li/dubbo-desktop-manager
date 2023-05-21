<template>
  <div class="container">
    <div class="mainContainer" v-for="connectInfo in connectInfoList" :key="connectInfo.name">
      <!-- zk 连接 -->
      <div class="connectContainer notSelect" @click="openConnect(connectInfo)">
        <!-- zk 连接名称 -->
        <div class="connectContainer-left">
          <i class="iconfont icon-lianjie-connect"></i>
          <span class="txt">{{ connectInfo.name }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="connectContainer-right">
          <i class="el-icon-refresh" v-if="connectInfo.isShow" @click="refreshServiceList($event,connectInfo)"></i>
          
          <el-tooltip effect="light" content="修改" placement="right-start">
            <i class="el-icon-edit" @click="editConnect($event, connectInfo._id)"></i>
          </el-tooltip>
          <el-tooltip effect="light" content="删除" placement="right-start">
            <i class="el-icon-delete" @click="deleteConnect($event,connectInfo._id)"></i>
          </el-tooltip>
        </div>
      </div>
      <connectItem :connectInfo="connectInfo" @clickServiceInfo="clickServiceInfo"> </connectItem>
    </div>
  </div>
</template>

<script>
import connectRepository from "@/renderer/api/connectManangerClient.js";
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
    async findConnectList() {
      let connectInfoList = await connectRepository.findList();
      for (let i = 0; i < connectInfoList.length; i++) {
        connectInfoList[i].interfaceList = [];
        connectInfoList[i].isShow = false;
        connectInfoList[i].refreshNum = 0;
      }
      this.connectInfoList = connectInfoList;
    },
    openConnect(connectInfo) {
      connectInfo.isShow = !connectInfo.isShow;

    },
    clickServiceInfo(data) {
      this.$emit("clickServiceInfo", data);
    },
    refreshServiceList(e, connectInfo) {
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
      this.$confirm(this.$t('connect.confirmDeleteConnect'), this.$t('base.hintTitle'), {
        confirmButtonText: this.$t('base.confirm'),
        cancelButtonText: this.$t('base.cancel'),
        type: "warning",
      }).then(async () => {
        // eslint-disable-next-line no-unused-vars
        await connectRepository.deleteConnect(id);
        this.$message({
          type: "success",
          message: this.$t('base.deleteSuccess'),
        });
        this.findConnectList();
      }).catch(() => { });

      //W3C阻止冒泡方法
      e.stopPropagation();
    },
  }
}
</script>

<style>
.mainContainer {

}


.connectContainer {
  display: flex;
  justify-content: space-between;
  line-height: 30px;
  white-space: nowrap;
  padding-left: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.connectContainer:hover {
  background:#d5ebe1;
}

.txt {
  margin-left: 5px;
}

.connectContainer-right i {
  margin-right: 5px;
  padding: 5px 5px;
}

.connectContainer-right i:hover {
  background-color: #ccc;
  border-radius: 50%;
}
</style>