<template>
  <el-dialog :key="tableKey" :fullscreen="fullscreen" :title="title" :top="top" :visible.sync="dialogVisible" :width="width" :before-close="hide" :close-on-click-modal="false" center>
    <!-- eslint-disable-next-line vue/require-component-is -->
    <component v-bind="componentProps()" />
    <span v-if="showFooter" slot="footer" class="dialog-footer">
      <el-button type="primary" @click="$emit('submit')">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    component: {
      type: [String, Object],
      required: false,
    },
    params: {
      type: Object,
      required: false,
    },
    src: {
      type: String,
      required: false,
    },
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
      default: false,
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
      this.$destroy(); // 销毁组件
      this.$el.remove(); // 从 DOM 中移除
    },
    componentProps() {
      if (this.component) {
        return {
          is: this.component,
          ...this.params
        };
      }

      return {
        target: '_blank',
        rel: 'noopener',
        is: 'iframe',
        src: this.src,
        height: "100%",
        width: "100%",
        style: "vertical-align:top",
        webpreferences: 'nodeIntegration=true, contextIsolation=false'
      }
    },
  },
};
</script>


<style>
.el-dialog--center .el-dialog__body {
  padding: 10px;
}

.el-dialog__header {
  padding: 5px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.el-dialog__headerbtn {
  top: 10px;
}
</style>
