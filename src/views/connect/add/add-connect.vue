<template>
  <div>
    <el-tabs v-model="componentName">
      <el-tab-pane v-for="item in options" :key="item.value" @click="changeView(item.value)" :label="item.label" :name="item.value" :disabled="item.disabled" />
    </el-tabs>
    <component :is="componentName" @saveSuccess="saveZkConnectInfo" :id="id"></component>
  </div>
</template>

<script>
import zookeeperAdd from "./zookeeper-add.vue";
import nacosAdd from "./nacos-add.vue";
import connectRepository from "@/core/repository/connectRepository.js";

export default {
  components: {
    zookeeperAdd,
    nacosAdd,
  },
  data() {
    return {
      componentName: "zookeeperAdd",
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
        let connect = await connectRepository.findById(this.id);
        for (let index = 0; index < this.options.length; index++) {
          let element = this.options[index];
          if (element.label == connect.type) {
            this.componentName = element.value;
          }
          element.disabled = true;
        }
      } else {
        for (let index = 0; index < this.options.length; index++) {
          this.options[index].disabled = false;
        }
      }
    },
    saveZkConnectInfo(data) {
      this.$emit("saveSuccess", data);
    }
  },
};
</script>

<style  >
</style>