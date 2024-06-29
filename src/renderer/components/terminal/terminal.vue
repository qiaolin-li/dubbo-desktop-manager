<template>
  <div :id="terminalKey" class="terminal-container"></div>
</template>

<script>
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
const clipboard = require('@electron/remote').clipboard
const Mousetrap = require('mousetrap');


export default {
  name: "terminal",
  data() {
    return {
      terminal: Object,
      termOptions: {
        rows: 100,
        scrollback: 800,
      },
      input: '',
      prefix: '',
      // 历史指令
      histIndex: 0,
      histCommandList: [],
      currentOffset: Number,
      command: "",
      term: null,
      isOpen: false,
      tSocket: null,
    }
  },
  props: {
    terminalKey: String,
  },
  mounted() {
    this.$nextTick(() => {
      this.initTerm();

      let terminalContainer = document.querySelector(`#${this.terminalKey}`);
      terminalContainer.onmouseup = (e) => {     //在body里点击触发事件
        //如果button=1（鼠标左键），button=2（鼠标右键），button=0（鼠标中间键）
        if (e.button === 2) {
          this.pasteContentToTerminal()
          e.stopPropagation();
        }
      }

      // 绑定快捷键
      Mousetrap(terminalContainer).bind(['command+v', 'ctrl+v'], () => this.pasteContentToTerminal());

    });

    // 需要解除对 areatext 的粘贴
    Mousetrap.prototype.stopCallback = (e, element, combo) => {

      // if the element has the class "mousetrap" then no need to stop
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
        return false;
      }

      // stop for input, select, and textarea
      return element.tagName == 'INPUT' || element.tagName == 'SELECT' || (element.contentEditable && element.contentEditable == 'true');
    }

  },
  methods: {

    initTerm() {
      let term = new Terminal({
        rendererType: 'canvas',
        fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
        theme: {
          foreground: '#e5e5e5',
          background: '#232322',
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

      let terminalContainer = document.querySelector(`#${this.terminalKey}`);
      term.open(terminalContainer)
      // term.fit()
      fitAddon.fit()

      window.addEventListener('resize', () => {
        fitAddon.fit()
      });

      term.focus()
      term.prompt = () => {
        term.write(this.prefix)
      }

      // 实际需要使用socket来交互, 这里不做演示
      term.onKey((event) => {
        let ev = event.domEvent;
        let key = event.key;
        // 每行开头前缀长度 @ashinWu:$ 
        const threshold = this.prefix.length
        // 总偏移(长度) = 输入+前缀
        let fixation = this.input.length + threshold
        // 当前x偏移量
        let offset = term._core.buffer.x
        this.currentOffset = fixation
        // 禁用Home、PgUp、PgDn、Ins、Del键
        if ([36, 33, 34, 45, 46].indexOf(ev.keyCode) !== -1) return

        switch (ev.keyCode) {
          // 回车键
          case 13:
            this.handleInput()
            this.input = ''
            break;
          // 退格键
          case 8:
            if (offset > threshold) {
              if (!this.input) {
                return;
              }
              term._core.buffer.x = offset - 1
              // \x1b[?K: 清除光标至行末的"可清除"字符
              term.write('\x1b[?K' + this.input.slice(offset - threshold))
              // 保留原来光标位置
              // const cursor = this.bulidData(2, '\x1b[D')
              // term.write(cursor)
              // this.input = `${this.input.slice(0, offset - threshold - 1)}${this.input.slice(offset - threshold)}`
              this.input = this.input.substring(0, this.input.length - 1);
            }
            break;
          case 35:
            // eslint-disable-next-line no-case-declarations
            const cursor = this.bulidData(fixation - offset, "\x1b[C")
            term.write(cursor)
            break
          // 方向盘上键
          case 38:
            if (this.histCommandList[this.histIndex - 1]) {
              // 将光标重置到末端
              // term._core.buffer.x = fixation
              let b1 = '', b2 = '', b3 = '';
              // 构造退格(模拟替换效果) \b \b标识退一格; \b\b  \b\b表示退两格...
              for (let i = 0; i < this.input.length; i++) {
                b1 = b1 + '\b'
                b2 = b2 + ' '
                b3 = b3 + '\b'
              }
              term.write(b1 + b2 + b3)
              this.input = this.histCommandList[this.histIndex - 1]
              term.write(this.histCommandList[this.histIndex - 1])
              this.histIndex--
            }
            break;
          // 方向盘下键
          case 40:
            if (this.histCommandList[this.histIndex + 1]) {
              // 将光标重置到末端
              // term._core.buffer.x = fixation
              let b1 = '', b2 = '', b3 = '';
              // 构造退格(模拟替换效果) \b \b标识退一格; \b\b  \b\b表示退两格...
              for (let i = 0; i < this.histCommandList[this.histIndex].length; i++) {
                b1 = b1 + '\b'
                b2 = b2 + ' '
                b3 = b3 + '\b'
              }
              this.input = this.histCommandList[this.histIndex + 1]
              term.write(b1 + b2 + b3)
              term.write(this.histCommandList[this.histIndex + 1])
              this.histIndex++
            }
            break;
          // 方向盘左键
          case 37:
            if (offset > threshold) {
              term.write(key)
            }
            break;
          // 方向盘右键
          case 39:
            if (offset < fixation) {
              term.write(key)
            }
            break;
          default:
            break;
        }

      })

      // 若需要中文输入, 使用on data监听
      term.onData((data) => {
        this.terminal.write(data)
        this.input += data
      })

      this.terminal = term;
      return term
    },

    // 在这里处理自定义输入...
    handleInput() {
      // 判断空值
      this.terminal.write('\r\n')
      if (this.input.trim()) {
        // 记录历史命令
        if (this.histCommandList[this.histCommandList.length - 1] !== this.input) {
          this.histCommandList.push(this.input)
          this.histIndex = this.histCommandList.length
        }
        const command = this.input.trim();
        this.$emit('sendCommand', command)
      } else {
        this.$emit('sendCommand', "\n")
      }
      this.terminal.prompt()
    },
    bulidData(length, subString) {
      let cursor = ''
      for (let i = 0; i < length; i++) {
        cursor += subString
      }
      return cursor;
    },
    pasteContentToTerminal() {
      let content = clipboard.readText();
      if (!content) {
        return;
      }
      this.terminal.write(content)
      this.input += content
      return false;
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
</style>