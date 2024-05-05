<template>
  <div ref="dragTab" class="drag-tab-panel-container">
    <div class="drag-tab-sub-panel" :style="{ flex: collapsed0 ? `0 0 22px` : '' }" >
      <div class="drag-tab-panel-header notSelect" @click="collapsible && togglePanel(0)">
        <div>
          <i class="el-icon-arrow-right expandButton" v-if="collapsible && collapsed0"></i>
          <i class="el-icon-arrow-down expandButton" v-if="collapsible && !collapsed0" ></i>
          <el-link class="drag-tab-panel-header-link" :underline="false" v-for="props in fisrtTabProps" :key="props.name" :type="fisrtSelectedName === props.name ? 'primary' : ''" @click="switchTab('fisrt', props.name)"> {{ props.titel }}</el-link>
        </div>
        <div>
          <slot name="fisrtToolBar"></slot>
        </div>
      </div>
      <div v-show="!collapsed0"  class="drag-tab-content-panel"  >
        <slot name="fisrtContent"></slot>
      </div>
    </div>
    
    <div class="drag-tab-sub-panel"  :style="{ flex: `0 0 ${collapsed1 ? 22 : mainPanelHeight1}px` }" >
      <div v-show="!collapsed1" class="drag-tab-resizer" @mousedown.stop="startResize($event, 1)"></div>
      <div class="drag-tab-panel-header notSelect" @click="collapsible && togglePanel(1)">
        <div>
          <i class="el-icon-arrow-right expandButton" v-if="collapsible && collapsed1" ></i>
          <i class="el-icon-arrow-down expandButton" v-if="collapsible && !collapsed1"></i>
           <el-link class="drag-tab-panel-header-link" :underline="false" v-for="props in secondTabProps" :key="props.name" :type="secondSelectedName === props.name ? 'primary' : ''" @click="switchTab('second', props.name)"> {{ props.titel }}</el-link>
        </div>
        <div>
          <slot name="secondToolBar"></slot>
        </div>
      </div>

        <div v-show="!collapsed1"  class="drag-tab-content-panel" >
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

      fisrtSelectedName: '',
      secondSelectedName: '',
    };
  },
  props: {
    collapsible: {
      type: Boolean,
      default: true,
    },
    fisrtTabProps: {
      type: Array,
      required: true,
    },
    fisrtDefaultName: {
      type: String,
      required: true,
    },
    secondTabProps: {
      type: Array,
      required: true,
    },
    secondDefaultName: {
      type: String,
      required: true,
    }
  },
  mounted() {
    this.collapsed1 = this.collapsible;
    
    this.fisrtSelectedName = this.fisrtDefaultName;
    this.secondSelectedName = this.secondDefaultName;
    this.$slots.fisrtContent.forEach(x => {
      if(this.fisrtSelectedName !== x.componentInstance.name){
        x.elm.style.display = 'none';
      }
    });
    this.$slots.fisrtToolBar.forEach(x => {
      if(this.fisrtSelectedName !== x.componentInstance.name){
        x.elm.style.display = 'none';
      }
    });
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
      const fisrtcomponent = (this.$slots.fisrtContent || []).find(x => x.componentInstance.name === this.fisrtSelectedName);
      if(fisrtcomponent) {
        fisrtcomponent.componentInstance.show();
      }
      const secondcomponent = (this.$slots.secondContent || []).find(x => x.componentInstance.name === this.secondSelectedName);
      if(secondcomponent) {
        secondcomponent.componentInstance.show();
      }
    },
    togglePanel(index) {
      if(index === 0){
        this.collapsed0 = !this.collapsed0;
      }
      if(index === 1){
        this.collapsed1 = !this.collapsed1;
      }
    },
    switchTab(type, name) {
      if(type === 'fisrt'){
        if(this.fisrtSelectedName === name){
          return;
        }

        const oldToolBarComponent = (this.$slots.fisrtToolBar || []).find(x => x.componentInstance.name === this.fisrtSelectedName);
        const newToolBarComponent = (this.$slots.fisrtToolBar || []).find(x => x.componentInstance.name === name);
        if(oldToolBarComponent){
          oldToolBarComponent.elm.style.display = 'none'
        }
        if(newToolBarComponent){
          newToolBarComponent.elm.style.display = ''
        }


        const oldComponent = this.$slots.fisrtContent.find(x => x.componentInstance.name === this.fisrtSelectedName);
        const newComponent = this.$slots.fisrtContent.find(x => x.componentInstance.name === name);
        if(oldComponent){
          oldComponent.elm.style.display = 'none'
        }
        newComponent.elm.style.display = ''
        if(newComponent.componentInstance.show){
          newComponent.componentInstance.show();
        }
        
        this.fisrtSelectedName = name;
      } else {
        if(this.secondSelectedName === name){
          return;
        }

        const oldToolBarComponent = (this.$slots.secondToolBar || []).find(x => x.componentInstance.name === this.secondSelectedName);
        const newToolBarComponent = (this.$slots.secondToolBar || []).find(x => x.componentInstance.name === name);
        if(oldToolBarComponent){
          oldToolBarComponent.elm.style.display = 'none'
        }
        if(newToolBarComponent){
          newToolBarComponent.elm.style.display = ''
        }

        const oldComponent = this.$slots.secondContent.find(x => x.componentInstance.name === this.secondSelectedName);
        const newComponent = this.$slots.secondContent.find(x => x.componentInstance.name === name);
        if(oldComponent){
          oldComponent.elm.style.display = 'none'
        }

        newComponent.elm.style.display = ''
        if(newComponent.componentInstance.show){
          newComponent.componentInstance.show();
        }
        this.secondSelectedName = name;
      }
    }
  },
};
</script>

<style>

.drag-tab-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.drag-tab-panel-header {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  background-color: #e0e0e0;
  cursor: pointer; 
  /* font-weight: bold; */
  font-size: 16px;
  height: 22px;
}

.drag-tab-panel-header-link {
  padding: 0px 10px;
}

.drag-tab-sub-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow: auto;
}

.drag-tab-content-panel {
  overflow: auto;
  height: 100%;
}

.drag-tab-resizer {
  /* border-top: 1px solid #dcdee2; */
  background-color: #f8f8f9;
  width: 100%;
  height: 2px;
  cursor: ns-resize;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drag-tab-resizer:hover {
  background-color: #3fb24f;
  border-color: #3fb24f;
}  

.expandButton {
  padding-right: 3px;
}

.el-link.el-link--primary {
  color: #409EFF;
  background-color: aliceblue;
  line-height: 20px;
  height: 100%;
  margin-top: 1px;
}
</style>