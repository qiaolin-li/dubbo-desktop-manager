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
import dataSource from "@/renderer/api/DataSourceClient.js";
import yamlCodeEditor from "@/renderer/components/editor/yaml-code-editor.vue";

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
      this.codeConfig.code = await dataSource.getConfiguration(this.provider, this.registryCenterId);
    },
    async save() {
      await dataSource.saveConfiguration(this.registryCenterId, this.provider, this.codeConfig.code);
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