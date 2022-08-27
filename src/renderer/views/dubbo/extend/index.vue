<template>
  <component :is="tabData.componentName" :registryCenterId="registryCenterId" :serviceName="serviceName" :provider="tabData.extendData.provider" :consumer="tabData.extendData.consumer" @openNewTab="openNewTab"></component>
</template>

<script>
import dubboProviderList from "./dubbo-provider-list.vue";
import dubboConsumerList from "./dubbo-consumer-list.vue";
import dubboTelnet from "./dubbo-telnet.vue";
import dubboInvoke from "./dubbo-invoke.vue";
import dubboProviderConfiguration from "./dubbo-provider-configuration.vue";

export default {
  components: {
    dubboProviderList,
    dubboConsumerList,
    dubboTelnet,
    dubboInvoke,
    dubboProviderConfiguration
  },
  props: {
    registryCenterId: String,
    serviceName: String,
    tabData: {
      type: Object,
      required: true,
      componentName: String,
      extendData: {
        type: Object,
        required: false,
        provider: {
          type: Object,
          required: false,
          default: {},
        },
        consumer: {
          type: Object,
          required: false,
          default: {},
        },
        default: {}
      }
    }
  },
  methods: {
    openNewTab(data) {
      this.$emit("openNewTab", data);
    },
  }
}
</script>

<style>
</style>