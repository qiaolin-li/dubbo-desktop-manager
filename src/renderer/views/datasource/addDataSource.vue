<template>
  <div>
    <el-tabs v-model="currentType" v-if="isCreate" @tab-click="init" >
      <el-tab-pane v-for="item in options" :key="item.type" :label="item.label" :name="item.type" />
    </el-tabs>
  
    <dynamicForm ref="dynamicForm" :ruleForm="ruleForm" :formConfig="formConfig">
      <template v-slot:top>
        <el-form-item :label="$t('connect.type')" prop="type"  v-if="!isCreate" >
          <el-input v-model="(options.find(o => o.type === ruleForm.type) || {}).label" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('connect.name')" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" @click="saveDataSourceInfo">{{$t('connect.save')}}</el-button>
      </el-form-item>
    </dynamicForm>
  </div>
</template>

<script>
import dataSourceRepository from "@/renderer/api/DataSourceRepositoryClient.js";
import dynamicForm from "@/renderer/components/dynamicForm.vue";
import dataSource from "@/renderer/api/DataSourceClient.js";

export default {
  components: {
    dynamicForm
  },
  data() {
    return {
      currentType: "zookeeper",
      isCreate : true,
      ruleForm: {},
      formConfig: [],
      options: [],
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
    this.options = await dataSource.getDataSourceList();
    this.currentType = this.options[0].type;
    this.init();
  },
  methods: {
    async init() {
      
      let ruleForm ;
      let formConfig;
      if (this.id) {
        ruleForm = await dataSourceRepository.findById(this.id);
        formConfig = await dataSource.getFormConfig(ruleForm.type);
      } else {
        // 生成默认值
        formConfig = await dataSource.getFormConfig(this.currentType);
        ruleForm = {
          name: "",
          type: this.currentType
        };
        for(let i = 0; i < formConfig.properties.length; i++) {
          const item = formConfig.properties[i];
          ruleForm[item.name] = item.default || '';
          if(item.type === 'selectAndInput'){
            ruleForm[item.selectName] = item.defaultSelect || '';
          }
        }
      }
      
      this.isCreate = this.id ? false : true;
      this.ruleForm = ruleForm;
      this.formConfig = formConfig.properties;
    },
    saveDataSourceInfo() {
      this.$refs.dynamicForm.submit(async () => {
          await dataSourceRepository.save(this.ruleForm);
          this.$message({
            type: "success",
            message: this.isCreate ? this.$t('connect.createSuccess') : this.$t('connect.updateSuccess'),
          });
          this.$emit("saveSuccess", this.ruleForm);
      });
    }
  },
};
</script>

<style  >
</style>