<template>
  <div class="dubbo-list-main-container">
    <myTabList ref="myTabs"></myTabList>
  </div>
</template>

<script>
import myTabList from '@/renderer/components/tabs/index.vue';

export default {
  components: {
    myTabList,
  },
  data() {
    return {};
  },
  props: {
    registryCenterId: String,
    serviceName: String
  },
  mounted() {
    const providerTab = this.$refs.myTabs.addTab({
      title: this.$t('dubbo.serviceTab.providerList'),
      fullTitle: this.$t('dubbo.serviceTab.providerList'),
      componentName: 'dubboProviderList',
      closable: false,
      params: {
        registryCenterId: this.registryCenterId,
        serviceName: this.serviceName,
        tab: this,
      }
    });

    this.$refs.myTabs.addTab({
      title: this.$t('dubbo.serviceTab.consumerList'),
      fullTitle: this.$t('dubbo.serviceTab.consumerList'),
      componentName: 'dubboConsumerList',
      closable: false,
      params: {
        registryCenterId: this.registryCenterId,
        serviceName: this.serviceName,
        tab: this,
      }
    });

    this.$refs.myTabs.setCurrentTab(providerTab.id);
  },
  methods: {
    openNewTab(tabData) {
      this.$refs.myTabs.addTab(tabData);
    },
  },


};
</script>

<style >
.dubbo-list-main-container {
  height: 100vh;
  background-color: white;
}

</style>