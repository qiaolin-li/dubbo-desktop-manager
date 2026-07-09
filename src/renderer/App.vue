<template>
  <app-layout />
</template>

<script>
import AppLayout from '@/renderer/layout/index.vue';

export default {
  components: {
    AppLayout,
  }
};
</script>
<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: var(--app-theme-bg);
  color: var(--app-theme-text-primary);
}

#app {
  font-family: var(--app-font-family);
  -webkit-font-smoothing: subpixel-antialiased;
  -moz-osx-font-smoothing: auto;
  color: var(--app-theme-text-primary);
  background: var(--app-theme-bg);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  flex: 1;
  min-height: 0;
}

#nav {
  text-align: center;
}

body {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
}

</style>
