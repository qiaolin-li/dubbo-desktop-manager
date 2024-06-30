<template>
  <div>
    <el-tabs v-model="componentName">
      <el-tab-pane v-for="item in options" :key="item.value" @click="changeView(item.value)" :label="item.label" :name="item.value" :disabled="item.disabled" />
    </el-tabs>
    <component :is="componentName" @saveSuccess="saveDataSourceInfo" :id="id"></component>
  </div>
</template>

<script>
import zookeeperAdd from "./zookeeper-add.vue";
import nacosAdd from "./nacos-add.vue";
import dubboAdminAdd from "./dubbo-admin-add.vue";
import dataSourceRepository from "@/renderer/api/DataSourceRepositoryClient.js";

export default {
  components: {
    zookeeperAdd,
    nacosAdd,
    dubboAdminAdd
  },
  data() {
    return {
      componentName: "zookeeperAdd",
      createConnect : true,
      options: [
        {
          value: "zookeeperAdd",
          label: "zookeeper",
          disabled: false
        },
        {
          value: "nacosAdd",
          label: "nacos",
          disabled: false
        },
        {
          value: "dubboAdminAdd",
          label: "dubbo-admin",
          disabled: false
        },
      ],
    };
  },
  props: {
    id: String
  },
  watch: {
    id: {
      handler() {
        this.init();
      },
    }
  },
  async mounted() {
    this.init();
  },
  methods: {
    async init() {
      if (this.id) {
        let connect = await dataSourceRepository.findById(this.id);
        for (let index = 0; index < this.options.length; index++) {
          let element = this.options[index];
          if (element.label == connect.type) {
            this.componentName = element.value;
          }
          element.disabled = true;
        }
        this.createConnect = false;
      } else {
        for (let index = 0; index < this.options.length; index++) {
          this.options[index].disabled = false;
        }
        this.createConnect = true;
      }
    },
    saveDataSourceInfo(data) {
      this.$message({
        type: "success",
        message: this.createConnect ? this.$t('connect.createSuccess') : this.$t('connect.updateSuccess'),
      });
      this.$emit("saveSuccess", data);
    }
  },
};
</script>

<style  >
</style>