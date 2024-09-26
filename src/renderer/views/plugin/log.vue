<template>
  <logTerminal class="pluginLogContainer" ref="terminal" themeBackground="#f8f8f8" themeForeground="#3b3b3b" ></logTerminal>
</template>

<script>
import { ipcRenderer }  from 'electron'
import logTerminal          from "@/renderer/components/terminal/logTerminal.vue"

export default {

  components: {
    logTerminal 
  },

  data() {
    return {
    }
  },

  mounted() {
    this.$nextTick(() => {
      ipcRenderer.on('pluginOperationLog', (sender,  message) => {
        this.$refs.terminal.fit();
        this.$refs.terminal.writeData(message);
      })
    })
  },
  methods: {
    fit() {
      this.$refs.terminal.fit();
    }
  },
  destroyed() {
    ipcRenderer.removeAllListeners('pluginOperationLog')
  }

}
</script>

<style>

.pluginLogContainer {
    height: 100%;
    width: 100%;
}

.pane > .header {
  height: 20px !important;
  padding: 5px !important;
}

.pane > .content {
  padding: 0px !important;
  top: 30px !important
}
</style>