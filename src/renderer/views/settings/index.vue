<template>
  <div class="settingsContainer">

    <el-form label-position="left" label-width="100px" ref="form"  >
      <el-form-item :label="$t('settings.baseSettings.language')" >
        <el-select v-model="selectMessage">
          <el-option v-for="message in messages" :key="message.code" :label="message.name" :value="message.code"></el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="JAVA_HOME：">
        <el-input placeholder="请选择JAVA_HOME位置" v-model="javaHome" class="input-with-select" > 
          <el-button slot="append" icon="el-icon-search" @click="selectJavaHomePath"></el-button>
        </el-input>
      </el-form-item>

      <el-form-item :label="$t('settings.baseSettings.jvmArgs')">
        <el-input :placeholder="$t('settings.baseSettings.jvmArgsTips')" v-model="jvmArgs" > </el-input>
      </el-form-item>

      <el-form-item label="开发者模式">
        <el-checkbox v-model="developerModel">开发者模式</el-checkbox>
      </el-form-item>
    </el-form>

    <div v-for="pluginSettingComponent in pluginSettingComponentList" :key="pluginSettingComponent.id">
      <el-divider content-position="left">{{ pluginSettingComponent.label }}</el-divider>
      <component ref="pluginComponent" :is="pluginSettingComponent.component" />
    </div>
    
    <el-divider content-position="left"></el-divider>
    <el-button @click="saveConfig">{{$t('settings.apply')}}</el-button>
  </div>
</template>

<script>

import i18n           from '@/renderer/common/i18n'
import appConfig      from "@/renderer/api/AppConfigClient.js";
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
      pluginSettingComponentList: []
    }
  },
  async created() {
    this.selectMessage = await appConfig.getProperty("systemLocale");
    this.messages = i18n.messages;
    this.javaHome = await appConfig.getProperty("javaHome");
    this.jvmArgs = await appConfig.getProperty("jvmArgs");
    this.developerModel = await appConfig.getProperty('developer-model') || false;
  },
  async mounted() {
    this.pluginSettingComponentList = this.$appRenderer.getPluginSettingComponentList();
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

      this.$refs.pluginComponent.forEach(async (pluginComponent, index) => {
        const pluginSettingsInfo = this.pluginSettingComponentList[index];
        const pluginSettings = await pluginComponent.getPluginSettings();
        await appConfig.setProperty("pluginConfig." + pluginSettingsInfo.id, pluginSettings);
      });

      const developerModel = await appConfig.getProperty('developer-model') || false;
      if(developerModel !== this.developerModel){
        await appConfig.setProperty("developer-model", this.developerModel);
        const successNotification = new window.Notification("重启通知", { body: "请点击此通知重启应用以生效"});
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
  padding: 15px;
  background-color: white;
  border-radius: 5px;
}
</style>