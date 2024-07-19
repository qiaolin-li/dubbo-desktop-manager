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
    <br />
    {{$t('settings.invokerSettings.invokerTypeTips')}}
    <div style="margin-top: 15px;">
      <el-input placeholder="请选择JAVA_HOME位置" v-model="javaHome" class="input-with-select">
        <template slot="prepend">JAVA_HOME：</template>
        <el-button slot="append" icon="el-icon-search" @click="selectJavaHomePath"></el-button>
      </el-input>
    </div>
    <br/>
    {{$t('settings.baseSettings.jvmArgs')}}：
    <el-input :placeholder="$t('settings.baseSettings.jvmArgsTips')" v-model="jvmArgs" style="width: 90%"  > </el-input>
    <el-divider content-position="left"></el-divider>

    <el-checkbox v-model="developerModel">开发者模式</el-checkbox>
    <el-button @click="saveConfig">{{$t('settings.apply')}}</el-button>
  </div>
</template>

<script>

import i18n from '@/renderer/common/i18n'
import appConfig from "@/renderer/api/AppConfigClient.js";
const remote = require("@electron/remote");

export default {
  data() {
    return {
      selectMessage: "",
      messages: [],
      invokerType: "telnet",
      javaHome: "",
      jvmArgs: "",
      developerModel: false,
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
    this.invokerType = await appConfig.getProperty("invokerType") || "telnet";
    this.javaHome = await appConfig.getProperty("javaHome");
    this.jvmArgs = await appConfig.getProperty("jvmArgs");
    this.developerModel = await appConfig.getProperty('developer-model') || false;
  },
  methods: {
    async selectJavaHomePath() {
      // 打开文件夹选择框
      const result = await remote.dialog.showOpenDialog({
        defaultPath: this.javaHome,
        properties: ['openDirectory']
      });
      if (!result.canceled) {
        this.javaHome = result.filePaths[0];
      }
    },
    async saveConfig() {
      i18n.locale = this.selectMessage;
      await appConfig.setProperty("systemLocale", this.selectMessage);
      await appConfig.setProperty("invokerType", this.invokerType);
      await appConfig.setProperty("javaHome", this.javaHome);
      await appConfig.setProperty("jvmArgs", this.jvmArgs);
      const developerModel = await appConfig.getProperty('developer-model') || false;
      if(developerModel !== this.developerModel){
        await appConfig.setProperty("developer-model", this.developerModel);
        const successNotification = new window.Notification("重启通知", {
                body: "请点击此通知重启应用以生效",
            });
            successNotification.onclick = () => {
                remote.app.relaunch();
                remote.app.exit(0);
            };
      }
    }
  }

}
</script>

<style>
.settingsContainer {
  padding-left: 15px;
  background-color: white;
  border-radius: 5px;
}
</style>