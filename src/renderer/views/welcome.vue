<template>
  <div class="welcomeContainer notSelect">
    <div class="contentContainer">
      <div class="imgContainer">
        <img src="../../assets/icon.png" width="120" height="120" />
      </div>
      <div class="descContainer">
        <span class="title">{{$t("welcome.productName")}}</span>
      </div>
      <div>
        <span class="version">{{$t("welcome.version")}}{{version}} </span>
      </div>
    </div>

  </div>
</template>

<script>
import pkg from "../../../package.json";
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
  },
};
</script>

<style>
.welcomeContainer {
  /* position : absolute; */
  /* width: 100%; */
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  margin: 5px 0px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: white;
  overflow-y: auto;
  border-radius: 5px;
}

.contentContainer {
  margin-top: -30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 水平居中 */
  height: 100%;
}



.title {
  font-size: 30px;
  font-weight: bold;
  color: #333;
}

.version {
  font-size: 20px;
  color: #333;
}
</style>