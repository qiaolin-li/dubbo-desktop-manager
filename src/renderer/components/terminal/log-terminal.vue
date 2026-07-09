<template>
    <div ref="terminal" class="app-log-terminal"></div>
</template>

<script>
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import lodash from "lodash";
import { useThemeStore } from '@/renderer/store/modules/theme.js';

export default {
    name: "AppLogTerminal",
    data() {
        return {
            terminal: Object,
            themeStore: useThemeStore(),
            termOptions: {
                rows: 100,
                scrollback: 800,
            },
            input: "",
            prefix: "",
            command: "",
            term: null,
            isOpen: false,
            tSocket: null,
        };
    },
    computed: {
        isDarkTheme() {
            return this.themeStore.isDarkTheme;
        },
    },
    props: {
        themeForeground: {
            type: String,
            default: "#e5e5e5",
        },
        themeBackground: {
            type: String,
            default: "#232322",
        },
    },
    mounted() {
        this.initTerm();
    },
    watch: {
        isDarkTheme() {
            this.applyTerminalTheme();
        },
    },
    methods: {
        getThemeToken(name, fallback = '') {
            if (typeof document === 'undefined') {
                return fallback;
            }

            return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
        },
        getTerminalTheme() {
            return {
                foreground: this.getThemeToken('--app-theme-terminal-fg', this.isDarkTheme ? '#adbac7' : this.themeForeground),
                background: this.getThemeToken('--app-theme-terminal-bg', this.isDarkTheme ? '#1c2128' : this.themeBackground),
            };
        },
        applyTerminalTheme() {
            if (!this.terminal) {
                return;
            }

            this.terminal.setOption('theme', this.getTerminalTheme());
        },
        initTerm() {
            let term = new Terminal({
                rendererType: "canvas",
                fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
                theme: this.getTerminalTheme(),
                //cursorStyle: 'underline',
                //scrollSensitivity: 15,
                //tabStopWidth: 4,
                // rendererType: 'canvas',
                cursorBlink: true,
                convertEol: true,
                scrollback: this.termOptions.scrollback,
                row: this.termOptions.rows,
            });
            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);

            let terminalContainer = this.$refs.terminal;
            term.open(terminalContainer);
            fitAddon.fit();

            window.addEventListener("resize", () => {
                fitAddon.fit();
            });

            const debounceFit = lodash.debounce(() => fitAddon.fit(), 500);
            const ro = new ResizeObserver(() => {
                debounceFit();
            });

            // 观察一个或多个元素
            ro.observe(terminalContainer);

            term.focus();
            term.prompt = () => {
                term.write(this.prefix);
            };

            this.terminal = term;
            this.fitAddon = fitAddon;
            this.applyTerminalTheme();
            return term;
        },
        fit() {
            this.fitAddon.fit();
        },
        writeDataIn(command) {
            this.terminal.writeln(command);
            this.terminal.prompt();
        },
        writeData(command) {
            this.terminal.write(command);
            this.terminal.prompt();
        },
    },
};
</script>

<style>
.app-log-terminal {
    height: 100%;
    width: 100%;
}

.app-log-terminal div {
    height: 100%;
    width: 100%;
}
</style>
