<template>
  <div class="history-main-container">
    <div>
      <span class="btn-plus" >调用历史</span>
    </div>
    <el-divider class="my-divider"></el-divider>
    <div class="" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
      <ul class="invoke-ui">
        <li v-for="invokeHistry in invokeHisotryList" :key="invokeHistry._id" class="invoke-li">
          {{ `${invokeHistry.serviceName}#${invokeHistry.method}` }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import invokeHisotryRecord from "@/renderer/api/invokeHistoryClient.js";
export default {
  props: {
    tab: Object,
  },  
  data() {
    return {
      busy: false,
      page: 1,
      size: 50,
      keyword: '',
      invokeHisotryList: [],
    };
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    async loadMore() {
      const list = await invokeHisotryRecord.findAllPage(this.keyword, this.page++, this.size);
      list.map(x => this.invokeHisotryList.push(x));
    },
  }
}
</script>

<style>

.my-divider {
  margin: 2px 0px;
}
.invoke-ui {
  line-height: 20px;
  font-size: 12px;
  font-weight: bold;
  list-style: none;
  border-radius: 2px;
}

.invoke-ui li {
  display: block;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
  border-radius: 2px;
}
.invoke-ui li:hover {
  background: #ccc;
}
</style>