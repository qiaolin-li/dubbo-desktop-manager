<template>
  <telnetTerminal :terminalKey="terminalKey" :ip="provider.ip" :port="provider.port"></telnetTerminal>
</template>

<script>
import telnetTerminal from "../../../../components/terminal/telnet-terminal.vue";


export default {
  name: "dubbo-telnet",
  data() {
    return {
      terminalKey: ""
    }
  },
  components: {
    telnetTerminal
  },
  props: {
    provider: Object
  },
  mounted() {
    this.terminalKey = `terminal-${this.provider.serivceName}-${this.provider.ip.replace(/\./g, "-")}`;
  }
}
</script>

<style>
.dubbo-telnet-container {
  width: 100%;
}
</style>