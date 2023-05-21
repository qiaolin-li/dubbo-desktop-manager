<template>
  <div :class="classes" @mousedown="onMouseDown" @mouseenter="() => foldingShow = true" @mouseleave="() => foldingShow = false">
    <div class="anchor" v-show="foldingShow">
      <svg v-show="isExpanded" style="font-size: 14px" viewBox="64 64 896 896" data-icon="left" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
      </svg>
      <svg v-show="!isExpanded" style="font-size: 14px" viewBox="64 64 896 896" data-icon="right" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z"></path>
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
    className: String
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
  background: #000;
  position: absolute;
  opacity: 0.2;
  z-index: 1;
  -moz-background-clip: padding;
  -webkit-background-clip: padding;
  background-clip: padding-box;
}

.splitter-pane-resizer.horizontal {
  height: 11px;
  margin: -5px 0;
  border-top: 5px solid rgba(255, 255, 255, 0);
  border-bottom: 5px solid rgba(255, 255, 255, 0);
  cursor: row-resize;
  width: 100%;
}

.splitter-pane-resizer.vertical {
  width: 11px;
  height: 100%;
  margin-left: -5px;
  border-left: 5px solid rgba(255, 255, 255, 0);
  border-right: 5px solid rgba(255, 255, 255, 0);
  cursor: col-resize;
}

.splitter-pane-resizer:hover {
  border-left: 5px solid rgb(64, 111, 180) !important;
  border-right: 5px solid rgb(64, 111, 180) !important;
  border-top: 5px solid rgb(64, 111, 180) !important;
  border-bottom: 5px solid rgb(64, 111, 180) !important;
}

.anchor {
  width: 16px;
  height: 60px;
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgb(64, 111, 180);
  color: #bebebe;
  font-size: 20px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  padding-top: 30px;
  text-align: center;
}
</style>
  