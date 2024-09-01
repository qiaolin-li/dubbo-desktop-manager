<template>
  <div ref="terminal" class="terminal-container"></div>
</template>

<script>
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";


export default {
  name: "log-terminal",
  data() {
    return {
      terminal: Object,
      termOptions: {
        rows: 100,
        scrollback: 800,
      },
      input: '',
      prefix: '',
      command: "",
      term: null,
      isOpen: false,
      tSocket: null,
    }
  },
  props: {
    themeForeground: {
      type: String,
      default: '#e5e5e5',
    },
    themeBackground: {
      type: String,
      default: '#232322',
    }
  },
  mounted() {
    this.initTerm();
  },
  methods: {

    initTerm() {
      let term = new Terminal({
        rendererType: 'canvas',
        fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
        theme: {
          foreground: this.themeForeground,
          background: this.themeBackground,
        },
        //cursorStyle: 'underline',
        //scrollSensitivity: 15,
        //tabStopWidth: 4,
        // rendererType: 'canvas',
        cursorBlink: true,
        convertEol: true,
        scrollback: this.termOptions.scrollback,
        row: this.termOptions.rows,
      })
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon)

      let terminalContainer = this.$refs.terminal;
      term.open(terminalContainer)
      fitAddon.fit()

      window.addEventListener('resize', () => {
        fitAddon.fit()
      });

      term.focus()
      term.prompt = () => {
        term.write(this.prefix)
      }

      this.terminal = term;
      this.fitAddon = fitAddon;
      return term
    },
    fit() {
      this.fitAddon.fit()
    },

    writeDataIn(command) {
      this.terminal.writeln(command);
      this.terminal.prompt()
    },
    writeData(command) {
      this.terminal.write(command);
      this.terminal.prompt()
    }
  }
}
</script>

<style>
.terminal-container {
  width: 100%;
  height: 100%;
}

.terminal-container div{
  width: 100%;
  height: 100%;
}
</style>