<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
// collapse 展开折叠

export default {
  data() {
    return {};
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
   
  },
};
</script>

<style>
</style>