<template>
  <div class="invoke-dubbo-dialog-content-hisotry">
    {{ $t('count') }}:{{ invokeHisotryList.length }}
    <br/>
    <br/>
    <el-timeline>
      <el-timeline-item  v-for="invokeHistry in invokeHisotryList" :key="invokeHistry._id" :timestamp="getInvokeHisotryTitle(invokeHistry)" placement="top" >
        <el-card :class="['history-item', invokeHistry === currentInvokeHistry ? 'history-item-selected' : '']" @click.native="selectionChange(invokeHistry)">
          <p>{{invokeHistry.param}}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>

import invokeHisotryRecord from "@/renderer/api/InvokeHistoryClient.js";

export default {
  data() {
    return {
      currentInvokeHistry: null,
      invokeHisotryList: [],
    };
  },
  methods: {
    async changeParam(registryCenterId, provider, method) {
      this.invokeHisotryList =  await invokeHisotryRecord.findList(registryCenterId, provider.serviceName, method, 1, 50) || [];
    },
    selectionChange(invokeHistory) {
      this.currentInvokeHistry = invokeHistory;
    },
    getHistory(){
      return this.currentInvokeHistry
    },
    getInvokeHisotryTitle(invokeHistory) {
      return this.$moment(new Date(invokeHistory.createTime)).format("YYYY-MM-DD HH:mm:ss");
    },
  },
};
</script>

<style>
.broder {
  border: rgb(230, 233, 243) 1px solid;
}

.invoke-dubbo-dialog-content-hisotry {
  overflow-y: auto;
  height: 69vh;
}

.history-item {
  background: beige;
}
.history-item:hover, .history-item-selected {
  background: #999;
}

</style>