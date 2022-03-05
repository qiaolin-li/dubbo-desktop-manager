<template>
  <el-form ref="form" :rules="rules" :model="form" label-width="100px">
    <el-form-item label="链接名称" prop="name">
      <el-input v-model="form.name"></el-input>
    </el-form-item>
    <el-form-item label="链接地址" prop="address">
      <el-input v-model="form.address"></el-input>
    </el-form-item>
    <el-form-item label="超时时间" prop="sessionTimeout">
      <el-input v-model="form.sessionTimeout"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="saveZkConnectInfo">立即创建</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import connectRepository from "@/core/repository/connectRepository.js";

export default {
  data() {
    var checkTimeout = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("超时时间不能为空"));
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error("请输入数字值"));
        } else {
          if (value < 10) {
            callback(new Error("必须大于10ms"));
          } else {
            callback();
          }
        }
      }, 1000);
    };
    return {
      form: {
        type: "zookeeper",
        name: "",
        address: "127.0.0.1:2181",
        sessionTimeout: 5000,
      },
      rules: {
        name: [
          { required: true, message: "请输入链接名称", trigger: "blur" },
          {
            min: 1,
            max: 32,
            message: "长度在 1 到 32 个字符",
            trigger: "blur",
          },
        ],
        address: [
          { required: true, message: "请输入链接地址", trigger: "blur" },
        ],
        sessionTimeout: [{ validator: checkTimeout, trigger: "blur" }],
      },
    };
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
        let connect = await connectRepository.findById(this.id);
        this.form = connect;
      } else {
        this.form.type = "zookeeper"
        this.form.name = "";
        this.form.address = "127.0.0.1:2181";
        this.form.sessionTimeout = 5000;
      }
    },
    saveZkConnectInfo() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          connectRepository.save(this.form).then(() => {
            let data = { ...this.form };
            this.form.name = "";
            this.form.address = "127.0.0.1:2181";
            this.form.sessionTimeout = 5000;
            this.$emit("saveSuccess", data);
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style>
</style>