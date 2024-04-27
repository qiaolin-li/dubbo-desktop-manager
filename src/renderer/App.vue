<template>
  <div id="app">
    <mainPage />
  </div>
</template>

<script>
import mainPage from '@/renderer/views/index.vue';
export default {
  components: {
    mainPage
  },
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #2c3e50;
  height: 100%;
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
