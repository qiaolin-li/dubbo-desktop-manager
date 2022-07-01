<template>
  <div class="settingsContainer">
    <el-divider content-position="left">{{$t('settings.baseSettings')}}</el-divider>
    {{$t('settings.language')}}：<el-select v-model="selectMessage">
      <el-option v-for="message in messages" :key="message.code" :label="message.name" :value="message.code"></el-option>
    </el-select>

    <el-divider content-position="left"></el-divider>
    <el-button  @click="saveConfig">{{$t('settings.apply')}}</el-button>
  </div>
</template>

<script>

import i18n from '@/i18n/index.js';
import appConfig from "@/main/repository/appConfig.js";
export default {
  data() {
    return {
      selectMessage: "",
      messages: []
    }
  },
  created() {
    this.selectMessage = i18n.locale;
    this.messages = i18n.messages;
  },
  methods: {
    saveConfig() {
      i18n.locale = this.selectMessage;
      appConfig.setProperty("systemLocale", this.selectMessage);
    }
  }

}
</script>

<style>
.settingsContainer {
  height: 100vh;
  margin: 5px 0px;
  margin-left: 5px;
  margin-right: 5px;
  padding: 10px;
  background-color: white;
  border-radius: 5px;
}
</style>