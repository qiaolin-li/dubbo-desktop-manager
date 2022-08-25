<template>
  <div class="configuration-container">
    <yamlCodeEditor ref="codeEditor" :codeConfig="codeConfig">
      <template v-slot:titel>
        {{$t('dubbo.configurationPage.title')}}
      </template>
      <template v-slot:content>
        <el-tooltip class="item" effect="light" :content="$t('dubbo.configurationPage.save')" placement="top">
          <i class="el-icon-news" @click="save"></i>
        </el-tooltip>
      </template>
    </yamlCodeEditor>
  </div>
</template>

<script>
import registry from "@/main/registry";
import yamlCodeEditor from "@/renderer/components/editor/yaml-code-editor.vue";
import configuration from '@/utils/Configuration';

export default {
  components: {
    yamlCodeEditor,
  },
  props: {
    registryCenterId: String,
    provider: Object,
  },
  data() {
    return {
      codeConfig: {
        code: "",
      },
    }
  },
  created() {
    this.getConfiguration();
  },
  mounted() {
    this.$refs.codeEditor.fullScreen();
  },
  methods: {
    async getConfiguration() {
      let config = await registry.getConfiguration(this.provider, this.registryCenterId);
      if(config){
        this.codeConfig.code = config;
        return;
      }
      config = configuration.createDefaultConfiguration(this.provider.serviceName);
      this.codeConfig.code = configuration.JSONToYaml(config);
    },
    async save() {
      let doc = null;
      try {
        doc = configuration.yamlToJSON(this.codeConfig.code);
      } catch (e) {
        this.$message({
          type: "error",
          message: this.$t('dubbo.configurationPage.invalidFormat'),
        });
        return;
      }

      await registry.saveConfiguration(this.registryCenterId, this.provider, doc);
      this.$message({
        type: "success",
        message: this.$t('dubbo.configurationPage.saveSuccess'),
      });
    }
  }
}
</script>

<style>
.configuration-container {
  height: 100%;
}

.configuration-container .vue-codemirror {
  height: 80vh;
}

.configuration-container .CodeMirror {
  height: 100% !important;
}
</style>