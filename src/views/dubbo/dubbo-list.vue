<template>
  <div class="dubbo-list-main-container">
    <el-tabs type="border-card" v-model="editableTabsValue">
      <el-tab-pane>
        <span slot="label" class="notSelect"><i class="el-icon-date"></i> 提供者列表</span>
        <div class="tab-content">
          <dubboProviderList :registryCenterId="registryCenterId" :serviceName="serviceName" @invokeProvider="invokeProvider" />
        </div>
      </el-tab-pane>
      <el-tab-pane >
         <span slot="label" class="notSelect"><i class="el-icon-date"></i> 消费者列表</span>
        <div class="tab-content">
          <dubboConsumerList :registryCenterId="registryCenterId" :serviceName="serviceName" />
        </div>
      </el-tab-pane>
      <el-tab-pane  v-for="provider in invokeProviderList" :key="provider.ip" :name="provider.ip">
          <span slot="label" class="notSelect"><i class="el-icon-date"></i> {{provider.label}}</span>
        <div class="tab-content">
          <dubbo-invoke :registryCenterId="registryCenterId" :provider="provider" />
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import dubboProviderList from "./dubbo-provider-list.vue";
import dubboConsumerList from "./dubbo-consumer-list.vue";
import dubboInvoke from "./dubbo-invoke.vue";

export default {
  components: {
    dubboProviderList,
    dubboConsumerList,
    dubboInvoke
  },
  data() {
    return {
      invokeProviderList: [],
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
    invokeProvider(provider) {
      let exist = this.invokeProviderList.find(tab => tab.ip == provider.ip);

      // 不存在，新增一个
      if (!exist) {
        let data = Object.assign(provider);
        data["label"] = `调用 ${provider.ip}`;
        this.invokeProviderList.push(data);
      }

      this.editableTabsValue = provider.ip
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
  height: 90vh;
  overflow-y: auto;
}


</style>