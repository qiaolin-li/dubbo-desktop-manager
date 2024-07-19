<template>
  <div id="config-form">
    <el-form label-position="right" label-width="120px" :model="ruleForm" ref="form"  >

      <slot name="top"></slot>

      <el-form-item v-for="(item, index) in formConfig" :label="item.label || item.name" :required="item.required" :prop="item.name" :key="item.name + index" >
        
        <el-input v-if="item.type === 'input'" type="input"
          v-model="ruleForm[item.name]" :placeholder="item.message || item.name" ></el-input>

        <el-input v-else-if="item.type === 'password'" type="password"
          v-model="ruleForm[item.name]" :placeholder="item.message || item.name" ></el-input>

        <el-input v-else-if="item.type === 'selectAndInput'" :placeholder="item.placeholder" v-model="ruleForm[item.name]" class="input-with-select">
          <el-select v-model="ruleForm[item.selectName]" slot="prepend" style="width:120px" :placeholder="item.selectPlaceholder" >
            <el-option v-for="(choice, idx) in item.choices" :key="choice.name || choice.value || choice" 
            :label="choice.name || choice.value || choice" :value="choice.value || choice"></el-option>
          </el-select>
        </el-input>

        <el-select v-else-if="item.type === 'select'" v-model="ruleForm[item.name]" :placeholder="item.placeholder" :multiple="item.multiple || false" :collapse-tags="item.collapseCags || false" >
          <el-option v-for="(choice, idx) in item.choices" :key="choice.name || choice.value || choice" 
            :label="choice.name || choice.value || choice" :value="choice.value || choice"></el-option>
        </el-select>

        <el-switch
          v-else-if="item.type === 'confirm'"
          v-model="ruleForm[item.name]"
          active-text="yes"
          inactive-text="no"
        >
        </el-switch>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "dynamicForm",
  props: {
    ruleForm: {
      type: Object,
      required: true
    },
    formConfig: {
      type: Array,
      required: true
    },
  },

  methods: {
    
    submit(callback) {
      this.$refs.form.validate(async (valid) => {
        debugger
        if (valid) {
          callback(this.ruleForm);
        } else {
          return false;
        }
      });
    }

  },

};
</script>

<style>
</style>