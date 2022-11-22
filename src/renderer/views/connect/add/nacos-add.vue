<template>
  <el-form ref="form" :rules="rules" :model="form" label-width="100px">
    <el-form-item :label="$t('connect.name')" prop="name">
      <el-input v-model="form.name"></el-input>
    </el-form-item>
    <el-form-item :label="$t('connect.address')" prop="address">
      <el-input v-model="form.address"></el-input>
    </el-form-item>
    <el-form-item :label="$t('connect.namespaceId')">
      <el-input v-model="form.namespaceId"></el-input>
    </el-form-item>
    <el-form-item :label="$t('connect.sessionTimeout')" prop="sessionTimeout">
      <el-input v-model="form.sessionTimeout"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="saveZkConnectInfo">{{$t('connect.save')}}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import connectRepository from "@/renderer/api/connectManangerClient.js";

export default {
  data() {


    return {
      form: {
        type: "nacos",
        name: "",
        address: "http://127.0.0.1:8848",
        namespaceId: "",
        sessionTimeout: 5000,
      },

    };
  },
  computed: {
    rules() {
      let checkTimeout = (rule, value, callback) => {
        if (!value) {
          return callback(new Error(this.$t('connect.validateMessage.timeOutNotNull')));
        }
        setTimeout(() => {
          let timeOutTime = parseInt(value);
          if (Number.isNaN(timeOutTime)) {
            callback(new Error(this.$t('connect.validateMessage.inputNumber')));
          } else {
            if (value < 10) {
              callback(new Error(this.$t('connect.validateMessage.inputNumberRange')));
            } else {
              callback();
            }
          }
        }, 1000);
      };

      const rules = {
        name: [
          { required: true, message: this.$t('connect.validateMessage.inputName'), trigger: "blur" },
          {
            min: 1,
            max: 32,
            message: this.$t('connect.validateMessage.rangeLimit'),
            trigger: "blur",
          },
        ],
        address: [
          { required: true, message: this.$t('connect.validateMessage.inputConnectionAddress'), trigger: "blur" },
        ],
        sessionTimeout: [{ validator: checkTimeout, trigger: "blur" }],
      }
      return rules;
    }
  },
  props: {
    id: String
  },
  watch: {
    id: {
      handler() {
        this.init();
      }
    }
  },
  async mounted() {
    this.init();
  },
  methods: {
    async init() {
      if (this.id) {
        this.form = await connectRepository.findById(this.id);
      } else {
        this.form.type = "nacos"
        this.form.name = "";
        this.form.address = "127.0.0.1:2181";
        this.form.namespaceId = "";
        this.form.sessionTimeout = 5000;
      }
    },
    saveZkConnectInfo() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          await connectRepository.save(this.form);
          let data = { ...this.form };
          this.form.name = "";
          this.form.address = "127.0.0.1:2181";
          this.form.sessionTimeout = 5000;
          this.form.namespaceId = "";
          this.$emit("saveSuccess", data);
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style>
</style>