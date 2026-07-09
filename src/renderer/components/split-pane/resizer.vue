<template>
  <div :class="classes" @mousedown="onMouseDown" @mouseenter="() => foldingShow = true" @mouseleave="() => foldingShow = false">
    <div :class="anchorClasses" v-show="fold && foldingShow">
      <svg v-show="isExpanded && split === 'vertical'" style="font-size: 10px" viewBox="64 64 896 896" data-icon="left" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
      </svg>
      <svg v-show="!isExpanded && split === 'vertical'" style="font-size: 10px" viewBox="64 64 896 896" data-icon="right" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z"></path>
      </svg>
      <svg v-show="isExpanded && split === 'horizontal'" style="font-size: 10px" viewBox="64 64 896 896" data-icon="up" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M868 732h-70.3c-4.8 0-9.5-2.1-12.7-5.7L512 415 239 726.3a18.1 18.1 0 0 1-12.7 5.7H156c-6.9 0-10.7-8-6.4-13.4l347.6-396.1a24 24 0 0 1 29.1-6.5c2.6 1.1 4.9 2.9 6.6 5.1l347.6 397c4.2 5.4.4 13.9-6.5 13.9z"></path>
      </svg>
      <svg v-show="!isExpanded && split === 'horizontal'" style="font-size: 10px" viewBox="64 64 896 896" data-icon="down" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M856 296H786.2c-5 0-9.8 2.2-13 6L512 615 250.8 302a17 17 0 0 0-13-6H168c-6.8 0-10.6 7.8-6.5 13.2l333.9 399.7a24 24 0 0 0 36.9 0l330.2-395.5c4.4-5.2.6-13.4-6.5-13.4z"></path>
      </svg>
    </div>
  </div>
</template>
  
  <script>
export default {
  props: {
    split: {
      validator(value) {
        return ['vertical', 'horizontal'].indexOf(value) >= 0
      },
      required: true
    },
    percent: Number,
    className: String,
    fold: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      foldingShow: false,
    }
  },
  computed: {
    classes() {
      const classes = ['splitter-pane-resizer', this.split, this.className]
      return classes.join(' ')
    },
    anchorClasses() {
      return ['anchor', this.split].join(' ')
    },
    isExpanded: function () {
      return this.percent !== 0;
    },
  },
  methods: {
    onMouseDown(event) {
      if (event.currentTarget === event.target) {
        this.$emit("onMouseDown");
      } else {
        this.$emit("switchSplit")
      }
    }
  }
}
  </script>
  
<style scoped>
.splitter-pane-resizer {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background: var(--app-theme-splitter);
  position: absolute;
  z-index: 1;
  -moz-background-clip: padding;
  -webkit-background-clip: padding;
  background-clip: padding-box;
}

.splitter-pane-resizer.horizontal {
  height: 7px;
  margin: -3px 0;
  border-top: 3px solid rgba(255, 255, 255, 0);
  border-bottom: 3px solid rgba(255, 255, 255, 0);
  cursor: row-resize;
  width: 100%;
}

.splitter-pane-resizer.vertical {
  width: 7px;
  height: 100%;
  margin-left: -3px;
  border-left: 3px solid rgba(255, 255, 255, 0);
  border-right: 3px solid rgba(255, 255, 255, 0);
  cursor: col-resize;
}

.splitter-pane-resizer:hover {
  background-color: var(--app-theme-splitter-hover);
  opacity: 1; 
}

.anchor {
  width: 12px;
  height: 30px;
  position: absolute;
  background-color: var(--app-theme-splitter-hover);
  color: var(--app-theme-splitter-text);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.anchor.vertical {
  right: -11px;
  top: 50%;
  transform: translateY(-50%);
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.anchor.horizontal {
  left: 50%;
  top: -11px;
  transform: translateX(-50%);
  width: 30px;
  height: 12px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
</style>
  
