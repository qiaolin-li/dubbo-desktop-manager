<template>
  <el-tooltip class="item" effect="light" :content="$t('editor.copy')" placement="top-start">
    <i class="el-icon-document-copy" @click="copy"></i>
  </el-tooltip>
</template>

<script>
export default {
  props: {
    message: String,
  },
  methods: {
    copy() {
      navigator.clipboard.writeText(this.message)
      this.$message({
        type: "success",
        message: this.$t('editor.copySuccess'),
      });
    },
  }
}
</script>

<style>
</style>