<template>
  <div class="history-main-container">
    <div>调用历史</div>
    <el-divider class="my-divider"></el-divider>

    <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
      <el-collapse v-model="activeNames">
        <el-collapse-item v-for="group in groupList" :key="group.label" :title="group.label" :name="group.label">
          <template slot="title">
            <span class="collapse-title">{{ group.label }}</span>
          </template>
          <ul class="invoke-ui">
            <li v-for="invokeHistry in group.invokeHisotryList" :key="invokeHistry._id" class="invoke-li" @click="openInvokeTab(invokeHistry)">
              {{ `${invokeHistry.serviceName.split(".")[invokeHistry.serviceName.split(".").length - 1] }#${invokeHistry.method}#${$moment(new Date(invokeHistry.createTime)).format('LTS')}` }}
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
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
      activeNames: [],
      groupList: [

      ],
    };
  },
  mounted() {
    this.loadMore();
    setInterval(() => {
      this.queryData(1, this.size, true);
    }, 1000);
  },
  methods: {
    async loadMore() {
      this.queryData(this.page++, this.size);
    },
    async queryData(page, size, insertFront = false) {
      const list = await invokeHisotryRecord.findAllPage(this.keyword, page, size);
      list.map(hisotry => {
        const momentDate = this.$moment(new Date(hisotry.createTime));
        const label = momentDate.isSame(new Date(), 'day') ? momentDate.format('LT') : momentDate.format('ll');
        let group = this.groupList.find(x => x.label === label);
        if (!group) {
          group = {
            label,
            invokeHisotryList: [],
          };
          this.activeNames.push(label);
          if (insertFront) {
            this.groupList = [group, ...this.groupList];
          } else {
            this.groupList.push(group);
          }
        }
        if (!group.invokeHisotryList.find(x => x._id === hisotry._id)) {
          
          group.invokeHisotryList.push(hisotry);
          if (insertFront) {
            group.invokeHisotryList = group.invokeHisotryList.sort((a, b) => b.createTime - a.createTime);
          }
        }
      });
    },
    openInvokeTab(invokeHistry) {
      let tabData = {
        title: this.$t('dubbo.providePage.callTitle', { address: invokeHistry.address }),
        componentName: 'dubboInvoke',
        params: {
          registryCenterId: invokeHistry.registryCenterId,
          serviceName: invokeHistry.serviceName,
          selectProviderAddress: invokeHistry.address
        }
      }

      this.tab.addTab(tabData);
    }
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
}

.invoke-ui li {
  display: block;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
}
.invoke-ui li:hover {
  background: #ccc;
}

.collapse-title {
  flex: 1 0 90%;
  order: 1;
}

.el-collapse-item__header {
  flex: 1 0 auto;
  order: -1;
}
</style>