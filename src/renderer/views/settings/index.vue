<template>
  <div class="settingsContainer">
    <el-divider content-position="left">{{$t('settings.baseSettings.title')}}</el-divider>
    {{$t('settings.baseSettings.language')}}：
    <el-select v-model="selectMessage">
      <el-option v-for="message in messages" :key="message.code" :label="message.name" :value="message.code"></el-option>
    </el-select>

    <el-divider content-position="left">{{$t('settings.invokerSettings.title')}}</el-divider>
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

import i18n      from '@/renderer/common/i18n'
import appConfig from "@/renderer/api/appConfig.js";
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
    this.selectMessage = await appConfig.getProperty("systemLocale");
    this.messages = i18n.messages;
    this.invokerType =  await appConfig.getProperty("invokerType") || "telnet";
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
  padding-left: 15px;
  background-color: white;
  border-radius: 5px;
}
</style>