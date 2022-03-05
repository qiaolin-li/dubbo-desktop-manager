<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { FindInPage } from "electron-find";
import { ipcRenderer } from "electron";

const remote = require("@electron/remote");
let webContent = remote.getCurrentWebContents();
let findInPage = new FindInPage(webContent, {
  boxBgColor: "#333",
  boxShadowColor: "#000",
  inputColor: "#aaa",
  inputBgColor: "#222",
  inputFocusColor: "#555",
  textColor: "#aaa",
  textHoverBgColor: "#555",
  caseSelectedColor: "#555",
});
export default {
  data() {
    return {
      catch_components: [],
      editableTabsValue: "2",
      editableTabs: [],
      tabIndex: 2,
      ccc: "",
    };
  },
  mounted() {
    ipcRenderer.on("asynchronous-reply", function () {
      // 接收到Main进程返回的消息
      findInPage.openFindWindow();
    });

  },
  computed: {},
  methods: {},
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #2c3e50;
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
