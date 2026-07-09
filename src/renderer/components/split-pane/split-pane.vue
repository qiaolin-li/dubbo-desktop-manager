<template>
  <div ref="container" :style="{ cursor, userSelect }" class="vue-splitter-container clearfix">

    <pane class="splitter-pane splitter-paneL" v-show="percent >= minPercent" :split="split" :style="{ [type]: percent+'%'}">
      <slot name="paneL"></slot>
    </pane>

    <resizer v-if="showResizer" :className="className" :style="{ [resizeType]: percent+'%'}" :split="split" :percent="percent" :fold="fold" @onMouseDown="onMouseDown" @switchSplit="switchSplit"></resizer>

    <pane v-if="showPaneR" class="splitter-pane splitter-paneR" :split="split" :style="{ [type]: 100-percent+'%'}">
      <slot name="paneR"></slot>
    </pane>
    <div class="vue-splitter-container-mask" v-if="active"></div>
  </div>
</template>

<script>
  import Resizer from './resizer.vue'
  import Pane from './pane.vue'

  export default {
    name: 'AppSplitPane',
    components: { Resizer, Pane },
    props: {
      minPercent: {
        type: Number,
        default: 10
      },
      defaultPercent: {
        type: Number,
        default: 50
      },
      split: {
        validator(value) {
          return ['vertical', 'horizontal'].indexOf(value) >= 0
        },
        required: true
      },
      // 当小于minPercent时，是否折叠
      fold: {
        type: Boolean,
        default: true
      },
      showResizer: {
        type: Boolean,
        default: true
      },
      showPaneR: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      userSelect() {
        return this.active ? 'none' : ''
      },
      cursor() {
        return this.active ? (this.split === 'vertical' ? 'col-resize' : 'row-resize') : ''
      }
    },
    watch: {
      // eslint-disable-next-line no-unused-vars
      defaultPercent(newValue, oldValue){
        this.percent = this.normalizePercent(newValue)
      }
    },
    data() {
      return {
        active: false,
        hasMoved: false,
        percent: this.normalizePercent(this.defaultPercent),
        type: this.split === 'vertical' ? 'width' : 'height',
        resizeType: this.split === 'vertical' ? 'left' : 'top',
        className: ''
      }
    },
    beforeDestroy() {
      this.removeDragListeners()
    },
    methods: {
      normalizePercent(percent) {
        if (typeof percent !== 'number' || Number.isNaN(percent)) {
          return 50
        }

        if (this.fold) {
          return Math.max(0, Math.min(100 - this.minPercent, percent))
        }

        return Math.max(this.minPercent, Math.min(100 - this.minPercent, percent))
      },
      addDragListeners() {
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
      },
      removeDragListeners() {
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
      },
      onClick() {
        if (!this.hasMoved) {
          this.percent = 50
          this.$emit('resize', this.percent)
        }
      },
      switchSplit(){
        if(this.percent === 0){
          this.percent = this.defaultPercent
        }else {
          this.percent = 0;
        }
        this.$emit('resize', this.percent)
      },
      onMouseDown() {
        this.className = "aaa";
        this.active = true
        this.hasMoved = false
        this.addDragListeners()
      },
      onMouseUp() {
        if (!this.active) {
          return
        }

        this.active = false
        this.className = ''
        this.removeDragListeners()
      },
      onMouseMove(e) {
        if (!this.active) {
          return
        }

        if (e.buttons === 0 || e.which === 0) {
          this.active = false
          this.removeDragListeners()
          return
        }

        const container = this.$refs.container
        if (!container) {
          return
        }

        const rect = container.getBoundingClientRect()
        const offset = this.split === 'vertical' ? rect.left : rect.top
        const size = this.split === 'vertical' ? rect.width : rect.height
        if (!size) {
          return
        }

        const current = this.split === 'vertical' ? e.clientX : e.clientY
        const rawPercent = Math.floor(((current - offset) / size) * 10000) / 100

        if (rawPercent > this.minPercent && rawPercent < 100 - this.minPercent) {
          this.percent = rawPercent
        } else if (rawPercent <= this.minPercent) {
          this.percent = this.fold ? 0 : this.minPercent
        } else {
          this.percent = 100 - this.minPercent
        }

        this.$emit('resize', this.percent)
        this.hasMoved = true
      }
    }
  }
</script>

<style scoped>
.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}

.vue-splitter-container {
  height: 100%;
  position: relative;
}

.vue-splitter-container-mask {
  z-index: 9999;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}


.aaa {
  background-color: var(--app-theme-splitter-hover) !important;
  opacity: 0.8; 
}

</style>
