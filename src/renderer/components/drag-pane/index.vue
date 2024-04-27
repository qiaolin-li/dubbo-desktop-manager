<template>
  <div class="panel-container">
    <div class="sub-panel" :style="{ flex: collapsed0 ? `0 0 22px` : '' }" >
      <div class="panel-header notSelect" @click="togglePanel(0)">
        <div>
          <i class="el-icon-arrow-right" v-if="collapsed0"></i>
          <i class="el-icon-arrow-down" v-else></i>
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
      <div v-show="!collapsed1" class="resizer" @mousedown="startResize($event, 1)"></div>
      <div class="panel-header notSelect" @click="togglePanel(1)">
        <div>
          <i class="el-icon-arrow-right" v-if="collapsed1"></i>
          <i class="el-icon-arrow-down" v-else></i>
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
    title: {
      type: String,
      default: 'Panel Title',
    },
  },
  methods: {
    startResize(e, index) {
      this.index = index;
      this.isResizing = true;
      this.startY = e.clientY;
      document.addEventListener('mousemove', this.resize);
      document.addEventListener('mouseup', this.stopResize);
    },
    resize(e) {
      if (this.isResizing) {
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
  padding-left: 10px;
  cursor: pointer; 
  font-weight: bold;
  font-size: 12px;
  height: 22px;
}

.sub-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow: auto;
}

.content-panel {
  background-color: #d5ebe1;
  overflow: auto;
  height: 100%;
}

.resizer {
  border: 1px solid #dcdee2;
  background-color: #f8f8f9;
  width: 100%;
  height: 2px;
  cursor: ns-resize;
  display: flex;
  justify-content: center;
  align-items: center;
}

.resizer :hover {
  background-color: red;
  border-color: red;
}  

</style>