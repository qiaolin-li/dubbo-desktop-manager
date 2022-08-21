<template>
  <div class="settingsContainer">
    <el-divider content-position="left">{{$t('settings.baseSettings')}}</el-divider>
    {{$t('settings.baseSettings.language')}}：
    <el-select v-model="selectMessage">
      <el-option v-for="message in messages" :key="message.code" :label="message.name" :value="message.code"></el-option>
    </el-select>

    <el-divider content-position="left">{{$t('settings.invokerSettings')}}</el-divider>
    {{$t('settings.invokerSettings.invokerType')}}：
    <el-select v-model="invokerType">
      <el-option v-for="invokerType in invokerTypes" :key="invokerType.code" :label="invokerType.name" :value="invokerType.code"></el-option>
    </el-select>
    <br />
    <br />
    {{$t('settings.invokerSettings.invokerTypeTips')}}

    <el-divider content-position="left"></el-divider>

    <el-button @click="saveConfig">{{$t('settings.apply')}}</el-button>
  </div>
</template>

<script>

import i18n from '@/i18n/index.js';
import appConfig from "@/main/repository/appConfig.js";
export default {
  data() {
    return {
      selectMessage: "",
      messages: [],
      invokerType: "telnet",
      invokerTypes: [
        {
          code: "telnet",
          name: "Telnet"
        },
        {
          code: "java",
          name: "Java"
        }
      ]
    }
  },
  async created() {
    this.selectMessage =  appConfig.getProperty("systemLocale");
    this.messages = i18n.messages;
    this.invokerType =  appConfig.getProperty("invokerType") || "telnet";
  },
  methods: {
    async saveConfig() {
      i18n.locale = this.selectMessage;
       appConfig.setProperty("systemLocale", this.selectMessage);
       appConfig.setProperty("invokerType", this.invokerType);
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