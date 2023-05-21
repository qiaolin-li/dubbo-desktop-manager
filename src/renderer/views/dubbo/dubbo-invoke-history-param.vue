<template>
  <div class="invoke-dubbo-dialog-content-hisotry broder">
    {{$t('dubbo.invokePage.historyInvokeParamList')}}{{ invokeHisotryList.length }}）

    <ul class="infinite-list">
      <el-popover v-for="invokeHistry in invokeHisotryList" :key="invokeHistry._id"  placement="left" title="参数信息" width="200" trigger="hover" :content="invokeHistry.param">
        
        <li class="infinite-list-item" @click="selectionChange(invokeHistry)"  slot="reference">
          {{ getInvokeHisotryTitle(invokeHistry) }}
        </li>
      </el-popover>
    </ul>
  </div>
</template>

<script>

import jsonCodeEditor from "@/renderer/components/editor/json-code-editor.vue";
import invokeHisotryRecord from "@/renderer/api/invokeHistoryClient.js";

export default {
  components: {
    jsonCodeEditor,
  },
  data() {
    return {
      codeConfig: {
        code: "[]",
      },
      invokeHisotryList: [],
    };
  },
  methods: {
    async changeParam(registryCenterId, provider, method) {
      // 先刷新列表
      const invokeHisotryList = await invokeHisotryRecord.findList(provider.serviceName, method, 1, 50) || [];
      this.invokeHisotryList =  invokeHisotryList;
      return this.invokeHisotryList;
    },
    selectionChange(invokeHistory) {
      this.$emit("selectionChange", invokeHistory);
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
  width: 25%;
  padding-left: 10px;
  margin-left: 10px;
  height: 69vh;
}

.infinite-list {
  line-height: 20px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid rgb(248, 245, 245);
  border: 0px;
  list-style: none;
  border-radius: 2px;
}

.infinite-list li {
  display: block;
  width: 100%;
  background: beige;
  margin-top: 5px;
  margin-bottom: 5px;

  border-radius: 2px;
}
.infinite-list li:hover {
  background: #999;
}

.item {
  margin-left: 2px;
  padding: 4px;
}
.item:hover {
  background-color: #ccc;
  border-radius: 50%;
}
</style>