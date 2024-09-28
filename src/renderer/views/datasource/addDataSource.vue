<template>
  <div>
    <el-tabs v-model="currentType" v-if="isCreate" @tab-click="datasourceUpdateComponent = dataSourceUpdateComponentList.find(o => o.type === currentType)" >
      <el-tab-pane v-for="item in dataSourceUpdateComponentList" :key="item.type" :label="item.label" :name="item.type" />
    </el-tabs>
  
    <el-form label-position="right" label-width="120px" :model="ruleForm" ref="form"  >
      <el-form-item :label="$t('connect.type')" prop="type"  v-if="!isCreate" >
        <el-input v-model="(dataSourceUpdateComponentList.find(o => o.type === ruleForm.type) || {}).label" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('connect.name')" prop="name" :rules="nameRule">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
    </el-form>
    <component v-if="datasourceUpdateComponent" ref="datasourceUpdateComponent" :is="datasourceUpdateComponent.component" />

    <el-form label-position="right" label-width="120px" ref="form2"  >
      <el-form-item>
        <el-button type="primary" @click="saveDataSourceInfo">{{$t('connect.save')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import dataSourceRepository from "@/renderer/api/DataSourceRepositoryClient.js";

export default {
  data() {
    return {
      currentType: "",
      isCreate : true,
      ruleForm: {},
      dataSourceUpdateComponentList: [],
      datasourceUpdateComponent: null,

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
  computed: {
    nameRule(){
      return [
        { required: true, message: this.$t('connect.validateMessage.inputName'), trigger: "blur" },
        {
          min: 1,
          max: 32,
          message: this.$t('connect.validateMessage.rangeLimit'),
          trigger: "blur",
        },
      ];
    } 
  },
  async mounted() {
    this.dataSourceUpdateComponentList = this.$appRenderer.getPluginDataSourceUpdateComponentList();
    this.datasourceUpdateComponent = this.dataSourceUpdateComponentList[0];
    this.currentType = this.dataSourceUpdateComponentList[0].type;
    this.init();
  },
  methods: {
    async init() {
      this.isCreate = this.id ? false : true;

      if (this.id) {
        this.ruleForm = await dataSourceRepository.findById(this.id);
        this.currentType = this.ruleForm.type;
        this.datasourceUpdateComponent = this.dataSourceUpdateComponentList.find(o => o.type === this.currentType)
      }  

      this.$nextTick(() => {
        this.$refs.datasourceUpdateComponent.init({...this.ruleForm});
      })
    },
    saveDataSourceInfo() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        const properties = await this.$refs.datasourceUpdateComponent.getDataSourceInfo();
        if(!properties ||  typeof properties !== 'object'){
          return false;
        }

        const dataSourceInfo = {
          ...properties,
          _id: this.ruleForm._id,
          name: this.ruleForm.name,
          type: this.isCreate ? this.datasourceUpdateComponent.type :this.ruleForm.type,
        }

        await dataSourceRepository.save(dataSourceInfo);

        this.$message({
          type: "success",
          message: this.isCreate ? this.$t('connect.createSuccess') : this.$t('connect.updateSuccess'),
        });

        this.$emit("saveSuccess", dataSourceInfo);
      });
    }
  },
};
</script>

<style  >
</style>