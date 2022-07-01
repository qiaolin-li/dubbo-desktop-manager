<template>
  <div class="dubbo-list-main-container">
    <el-tabs type="card" tab-position="top" v-model="editableTabsValue">
      <el-tab-pane>
        <span slot="label" class="notSelect"><i class="el-icon-date"></i>{{$t('dubbo.serviceTab.providerList')}}</span>
        <div class="tab-content">
          <dubboProviderList :registryCenterId="registryCenterId" :serviceName="serviceName" @openNewTab="openNewTab" />
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label" class="notSelect"><i class="el-icon-date"></i> {{$t('dubbo.serviceTab.consumerList')}}</span>
        <div class="tab-content">
          <dubboConsumerList :registryCenterId="registryCenterId" :serviceName="serviceName" />
        </div>
      </el-tab-pane>
      <el-tab-pane v-for="tabData in tabDataList" :key="tabData.id" :name="tabData.id">
        <span slot="label" class="notSelect"><i class="el-icon-date"></i> {{tabData.label}}</span>
        <div class="tab-content">
          <extend :registryCenterId="registryCenterId" :serviceName="serviceName" :tabData="tabData"></extend>
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import dubboProviderList from "./dubbo-provider-list.vue";
import dubboConsumerList from "./dubbo-consumer-list.vue";
import extend from "./extend/index.vue";


export default {
  components: {
    extend,
    dubboProviderList,
    dubboConsumerList,
  },
  data() {
    return {
      tabDataList: [],
      editableTabsValue: "",
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
  },
  methods: {
    openNewTab(tabData){
        let exist = this.tabDataList.find(tab => tab.id == tabData.id);

      // 不存在，新增一个
      if (!exist) {
        this.tabDataList.push(tabData);
      }

      this.editableTabsValue = tabData.id;
    }
  },


};
</script>

<style >
.dubbo-list-main-container {
  height: 100vh;
  margin: 5px 0px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: white;
  border-radius: 5px;
}

.tab-content {
  height: 87vh;
  overflow-y: auto;
}
</style>