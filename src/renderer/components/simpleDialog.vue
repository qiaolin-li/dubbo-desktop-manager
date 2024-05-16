<template>
  <el-dialog :key="tableKey" :fullscreen="fullscreen" :title="title" :top="top" :visible.sync="dialogVisible" :width="width" :before-close="handleClose" :close-on-click-modal="false" center>
    <slot></slot>
    <span v-if="showFooter" slot="footer" class="dialog-footer">
      <el-button type="primary" @click="$emit('submit')">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'dialog',
    },
    top: {
      type: String,
      default: '5vh',
    },
    width: {
      type: String,
      default: '80%',
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    tableKey: {
      type: String,
      default: () => {
        return 'dialog-' + Math.random();
      },
    },
  },
  data() {
    return {
      dialogVisible: false,
    };
  },
  methods: {
    show() {
      this.dialogVisible = true;
    },
    hide() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style></style>
