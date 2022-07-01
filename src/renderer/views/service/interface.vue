<template>
  <div>
    <div
      :class="styleClass(interfaceInfo)"
      v-for="(interfaceInfo, index) in interfaceData"
      :key="interfaceInfo.label"
      @click="handleNodeClick(index, interfaceInfo)"
    >
      {{ interfaceInfo.label }}

      <!-- 子节点 -->
      <interface-tree
        v-if="interfaceInfo.children"
        v-show="interfaceInfo.show"
        :interfaceData="interfaceInfo.children"
      ></interface-tree>
    </div>
  </div>
</template>

<script>
export default {
  name: "interface-tree",
  data() {
    return {
      show: false,
    };
  },
  props: {
    interfaceData: Array,
  },
  mounted(){
      for (let i = 0; i < this.interfaceData.length; i++) {
          this.interfaceData[i].show = true;
      }
  },

  methods: {
    styleClass: (interfaceInfo) => {
      let classNames = "interface-container notSelect ";
      if (
        interfaceInfo &&
        interfaceInfo.children &&
        interfaceInfo.children.length == 0
      ) {
        classNames += " iconfont icon-interface1";
      }
      return classNames;
    },
    handleNodeClick(index, interfaceInfo) {
      interfaceInfo.show = !interfaceInfo.show;
    },
  },
};
</script>

<style>


.connectContainer-right i:hover {
  background-color: rgb(155, 206, 255);
}

.interface-container {
  margin-left: 5px;
  line-height: 30px;
  white-space: nowrap;
}

.selected {
  background-color: rgb(155, 206, 255);
}



.notSelect {
  /* 不让用户选中 */
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
  not supported by any browser */
}
</style>