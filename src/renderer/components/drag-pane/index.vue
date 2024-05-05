<template>
  <div ref="dragTab" class="panel-container">
    <div class="sub-panel" :style="{ flex: collapsed0 ? `0 0 22px` : '' }" >
      <div class="panel-header notSelect" @click="collapsible && togglePanel(0)">
        <div>
          <i class="el-icon-arrow-right expandButton" v-if="collapsible && collapsed0"></i>
          <i class="el-icon-arrow-down expandButton" v-if="collapsible && !collapsed0" ></i>
          <slot name="fisrtTitle"></slot>
        </div>
        <div>
          <slot name="fisrtToolBar"></slot>
        </div>
      </div>
      <div v-show="!collapsed0"  class="content-panel"  >
        <slot name="fisrtContent"></slot>
      </div>
    </div>
    
    <div class="sub-panel"  :style="{ flex: `0 0 ${collapsed1 ? 22 : mainPanelHeight1}px` }" >
      <div v-show="!collapsed1" class="resizer" @mousedown.stop="startResize($event, 1)"></div>
      <div class="panel-header notSelect" @click="collapsible && togglePanel(1)">
        <div>
          <i class="el-icon-arrow-right expandButton" v-if="collapsible && collapsed1" ></i>
          <i class="el-icon-arrow-down expandButton" v-if="collapsible && !collapsed1"></i>
          <slot name="secondTitle"></slot>
        </div>
        <div>
          <slot name="secondToolBar"></slot>
        </div>
      </div>

        <div v-show="!collapsed1"  class="content-panel" >
          <slot name="secondContent"></slot>
        </div>
    </div>
  </div>


</template>

<script>
// collapse 展开折叠

export default {
  name: 'DragPane',
  data() {
    return {
      mainPanelHeight1: 200,
       
      index: 0,
      isResizing: false,
      startY: 0,
      collapsed0: false,
      collapsed1: true,
    };
  },
  props: {
    collapsible: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    this.collapsed1 = this.collapsible;
  },
  methods: {
    startResize(e, index) {
      e.preventDefault();
      this.index = index;
      this.isResizing = true;
      this.startY = e.clientY;
      document.addEventListener('mousemove', this.resize);
      document.addEventListener('mouseup', this.stopResize);
    },
    resize(e) {
      if (this.isResizing) {
        // (windows)地址栏高度 + 上一个标题栏高度 + 拖动条高度
        if(e.clientY < (this.$refs.dragTab.offsetTop + (process.platform === 'win32' ? 30 : 0) + 22)){
          return;
        }

        const deltaY = e.clientY - this.startY;
        if(this.index === 1){
          this.mainPanelHeight1 -= deltaY;
        }
        this.startY = e.clientY;
      }
    },
    stopResize() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.resize);
      document.removeEventListener('mouseup', this.stopResize);
    },
    togglePanel(index) {
      if(index === 0){
        this.collapsed0 = !this.collapsed0;
      }
      if(index === 1){
        this.collapsed1 = !this.collapsed1;
      }
    },
  },
};
</script>

<style>
.panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  background-color: #e0e0e0;
  padding-left: 3px;
  cursor: pointer; 
  font-weight: bold;
  font-size: 14px;
  height: 22px;
  padding-right: 5px;
}

.sub-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow: auto;
}

.content-panel {
  overflow: auto;
  height: 100%;
}

.resizer {
  /* border-top: 1px solid #dcdee2; */
  background-color: #f8f8f9;
  width: 100%;
  height: 2px;
  cursor: ns-resize;
  display: flex;
  justify-content: center;
  align-items: center;
}

.resizer:hover {
  background-color: #3fb24f;
  border-color: #3fb24f;
}  

.expandButton {
  padding-right: 3px;
}
</style>