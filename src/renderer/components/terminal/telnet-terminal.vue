<template>
  <terminal ref="terminal" :terminalKey="terminalKey" @sendCommand="handleInput"></terminal>
</template>

<script>
import terminal from "./terminal.vue";
import net from "net";
import telnetSocket from "telnet-stream";


export default {
  name: "telnet-terminal",
  data() {
    return {
      tSocket: null,
    }
  },
  components: {
    terminal
  },
  props: {
    ip: String,
    port: [String, Number],
    terminalKey : String
  },
  mounted() {

    this.$nextTick(() => {
      this.connect();
    });
  },
  methods: {
    // 在这里处理自定义输入...
    handleInput(command) {
      this.tSocket.write(command + "\n");
    },

    connect() {
      // provder为空
      if (!this.ip || !this.port) {
        return;
      }

      let socket = net.createConnection(this.port, this.ip);

      let tSocket = new telnetSocket.TelnetSocket(socket);
      this.tSocket = tSocket;
      //   tSocket.setTimeout(1000);
      tSocket.on('connect', () => {
        this.$refs.terminal.writeDataIn(this.$t('telnetTerminal.connecting', {
          ip: this.ip,
          port: this.port
        }));
      });
      tSocket.on('error', () => {
        this.$refs.terminal.writeDataIn(this.$t('telnetTerminal.connectionTimeout', {
          ip: this.ip,
          port: this.port
        }));
      });

      tSocket.on("close", () => {
        this.$refs.terminal.writeDataIn(this.$t('telnetTerminal.connectionClosed', this));
        this.connect();
      });

      tSocket.on("data", buffer => {
        this.$refs.terminal.writeData(buffer.toString("utf8"));
      });

      tSocket.write(Buffer.from('\n').toString("utf8"));
    }
  }
}
</script>

<style>
.dubbo-telnet-container {
  width: 100%;
}
</style>