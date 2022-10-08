<template>
  <div class="welcomeContainer notSelect">
    <div class="contentContainer">
      <div class="imgContainer">
        <img src="../assets/icon.png" width="120" height="120" />
      </div>
      <div class="descContainer">
        <span class="title">{{$t("welcome.productName")}}</span>
      </div>
      <div style="margin-top:5px;">
        <span class="version">{{$t("welcome.version")}}{{version}} </span>
      </div>
    </div>

  </div>
</template>

<script>
import pkg from "../../../package.json";
const { shell } = require('electron');

export default {
  data() {
    return {
      version: pkg.version,
    };
  },
  methods: {
  },
  created() {
  },
  mounted() {
    let iframeList = document.getElementsByTagName("iframe");

    for (let i = 0; i < iframeList.length; i++) {
      const iframe = iframeList[i];
      iframe.onload = function () {
        const links = iframe.contentWindow.document.querySelectorAll('a[href]');
        links.forEach(link => {
          link.addEventListener('click', e => {
            const url = link.getAttribute('href');
            e.preventDefault();
            shell.openExternal(url);
          });
        });
      }
    }
  },
};
</script>

<style>
.welcomeContainer {
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  overflow-y: auto;
  border-radius: 5px;
  -webkit-app-region: drag;
}

.contentContainer {
  margin-top: -30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* 水平居中 */
  height: 100%;
}

.title {
  font-size: 30px;
  font-weight: bold;
  color: #333;
}
.version {
  color: #333;
}
</style>