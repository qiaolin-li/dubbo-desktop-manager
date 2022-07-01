<template>
  <component :is="tabData.componentName" :registryCenterId="registryCenterId" :serviceName="serviceName"
         :provider="tabData.extendData.provider" :consumer="tabData.extendData.consumer"></component>
</template>

<script>
import dubboTelnet from "./provider/dubbo-telnet.vue";
import dubboInvoke from "./provider/dubbo-invoke.vue";

export default {
  components: {
    dubboTelnet,
    dubboInvoke
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
        default: () => {
          return {};
        }
      }
    }
  }
}
</script>

<style>
</style>