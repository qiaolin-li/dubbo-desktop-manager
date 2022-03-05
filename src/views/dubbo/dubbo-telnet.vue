<template>
  <div id="terminal"></div>
</template>

<script>
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import net from "net";
import telnetSocket from "telnet-stream";

export default {
  name: "dubbo-telnet",
  data() {
    return {
      terminal: Object,
      termOptions: {
        rows: 40,
        scrollback: 800
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
      tSocket: null
    }
  },
  props: {
    provider: Object
  },
  created() {
    // let term = new Terminal({
    //   // 光标闪烁
    //   cursorBlink: true,
    //   fontFamily: `'Fira Mono', monospace`,
    //   fontSize: 15,
    //   rows: 20, theme: {
    //     foreground: 'white',
    //     background: '#060101'
    //   },
    //   scrollback: 800,
    //   rendererType: 'canvas',
    //   convertEol: true,
    // });

    // const searchAddon = new SearchAddon();
    // term.loadAddon(searchAddon);
    // searchAddon.findNext("foo");



    // this.term = term;

    // this.term.onData((data) => {
    //   if (!data) {
    //     return;
    //   }
    //   // 粘贴的情况
    //   if (data.length > 1) {
    //     this.term.write(data);
    //     this.command += data;
    //     return;
    //   }

    //   // 用户手动输入
    //   // 删除动作
    //   if (Buffer.from(data)[0] == 127) {
    //     if (this.command) {
    //       this.term.write("\b \b");
    //       this.command = this.command.substring(0, this.command.length - 1);
    //     }
    //     return;
    //   }

    //   // 按了回车
    //   if (data == "\r") {
    //     this.term.writeln("");
    //     this.tSocket.write(this.command + "\n");
    //     this.command = "";
    //     return;
    //   }

    //   this.term.write(data);
    //   this.command += data;
    // });

    // let arr1 = new Array(100).fill("x")
    // this.term.writeln(arr1.join(""));
    // //选中 复制
    // this.term.onSelectionChange(() => {
    //   if (this.term.hasSelection()) {
    //     console.log("copy内容：" + this.term.getSelection());
    //   }
    // });

    // const fitAddon = new FitAddon();
    // term.loadAddon(fitAddon);
    // fitAddon.fit();

    // window.onresize = () => {
    //   fitAddon.fit();
    //   this.term.scrollToBottom();
    // };


  },
  mounted() {
    this.initTerm();
    this.connect();
  },
  updated() {
    this.connect();
  },
  watch: {
    provider: {
      deep: true,
      // eslint-disable-next-line no-unused-vars
      handler(provider, oldProvider) {
        console.log("dubbo telnet watch : " + this.provider.ip);
        if (provider) {
          this.connect();
        }
      },
    },
  },
  methods: {

    initTerm() {
      let term = new Terminal({
        rendererType: 'canvas',
        cursorBlink: true,
        convertEol: true,
        scrollback: this.termOptions.scrollback,
        row: this.termOptions.rows,
        theme: {
          foreground: 'white',
          background: '#060101'
        }
      })
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon)
      let terminalContainer = document.querySelector('#terminal')
      term.open(terminalContainer)
      // term.fit()
      fitAddon.fit()
      term.focus()
      term.writeln(`Hello from web terminal`)
      term.prompt = () => {
        term.write(this.prefix)
      }


      // 实际需要使用socket来交互, 这里不做演示

      term.onKey((event) => {
        let ev = event.domEvent;
        let key = event.key;
        const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
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
              const cursor = this.bulidData(fixation - offset, '\x1b[D')
              term.write(cursor)
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
            if (printable) {
              // 限制输入最大长度 防止换行bug
              if (fixation >= term.cols) return

              // 不在末尾插入时 要拼接
              if (offset < fixation) {
                term.write('\x1b[?K' + `${key}${this.input.slice(offset - threshold)}`)
                const cursor = this.bulidData(fixation - offset, '\x1b[D')
                term.write(cursor)
                this.input = `${this.input.slice(0, offset - threshold)}${key}${this.input.slice(offset - threshold)}`
              } else {
                term.write(key)
                this.input += key
              }
              this.histIndex = this.histCommandList.length
            }
            break;
        }

      })

      // 选中复制
      term.onSelectionChange(() => {
        if (term.hasSelection()) {
          this.copy = term.getSelection()
        }
      })

      term.attachCustomKeyEventHandler((ev) => {
        // curl+v
        if (ev.keyCode === 86 && ev.ctrlKey) {
          const inline = (this.currentOffset + this.copy.length) >= term.cols
          if (inline) return
          if (this.copy) {
            term.write(this.copy)
            this.input += this.copy
          }
        }
      })

      // 若需要中文输入, 使用on data监听
      // term.on('data', function(data){
      // todo something
      // })

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
        this.tSocket.write(command + "\n");

      } else {
        this.tSocket.write("\n");
      }
      this.terminal.prompt()
    },

    connect() {

      // provder为空
      if (!this.provider || !this.provider.ip || !this.provider.port) {
        return;
      }

      if (!this.isOpen) {
        // this.terminal.open(document.getElementById("terminal"));
        this.isOpen = true;
      }

      let socket = net.createConnection(this.provider.port, this.provider.ip);

      let tSocket = new telnetSocket.TelnetSocket(socket);
      this.tSocket = tSocket;
      //   tSocket.setTimeout(1000);
      tSocket.on('connect', () => {
        this.terminal.writeln(`正在连接 ${this.provider.ip} ${this.provider.port}`);
        this.terminal.prompt()
        // socket.end();
      });
      tSocket.on('error', () => {
        this.terminal.writeln(`连接超时，请检查网络! ${this.provider.ip} ${this.provider.port}`);
        // socket.end();
      });

      tSocket.on("close", () => {
        this.terminal.writeln("连接断开!");
      });

      tSocket.on("data", buffer => {
        let message = buffer.toString("utf8");
        this.terminal.write(message);
      });

      tSocket.write(Buffer.from('\n').toString("utf8"));


    },

    bulidData(length, subString) {
      let cursor = ''
      for (let i = 0; i < length; i++) {
        cursor += subString
      }
      return cursor;
    }
  }
}
</script>

<style>
.dubbo-telnet-container {
  width: 100%;
}
</style>