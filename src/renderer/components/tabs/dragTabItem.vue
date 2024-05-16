<template>
  <div class="drag-tab-item">
    <slot></slot>
  </div>
</template>

<script>
// collapse 展开折叠

export default {
  data() {
    return {
    };
  },
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  mounted() {
  },
  methods: {
    show() {
      this.$emit("show");
    }
  },
};
</script>

<style>
.drag-tab-item {
  height: 100%;
}
</style>