<template>
    <div class="app-terminal" :class="[`is-${mode}`, `is-${resolvedStatusType}`]">
        <div v-if="searchVisible" class="app-terminal__search">
            <input ref="searchInput" v-model="searchKeyword" class="app-terminal__search-input" :placeholder="t('terminalPanel.searchPlaceholder')" @keydown.enter.prevent="findNext">
        </div>
        <div ref="terminal" class="app-terminal__body"></div>
    </div>
</template>

<script>
import { Terminal }                 from "xterm";
import { FitAddon }                 from "xterm-addon-fit";
import { SearchAddon }              from "xterm-addon-search";
import "xterm/css/xterm.css";
import Mousetrap                    from 'mousetrap';

import { appClipboard }             from '@/renderer/core/AppRenderer.js';
import { useThemeStore }            from '@/renderer/store/modules/theme.js';

export default {
    name: "AppTerminal",
    props: {
        canReconnect: {
            type: Boolean,
            default: false,
        },
        mode: {
            type: String,
            default: 'line',
        },
        showFooter: {
            type: Boolean,
            default: true,
        },
        showToolbar: {
            type: Boolean,
            default: true,
        },
        statusText: {
            type: String,
            default: '',
        },
        statusType: {
            type: String,
            default: 'info',
        },
        streamLocalEcho: {
            type: Boolean,
            default: false,
        },
        streamInputDisabled: {
            type: Boolean,
            default: false,
        },
        subtitle: {
            type: String,
            default: '',
        },
        themeBackground: {
            type: String,
            default: '#1f2329',
        },
        themeForeground: {
            type: String,
            default: '#e6edf3',
        },
        title: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            cursorOffset: 0,
            fitAddon: null,
            fontSize: 13,
            histCommandList: [],
            histIndex: 0,
            historyDraft: '',
            inputValue: '',
            prefix: '',
            resizeHandler: null,
            resizeObserver: null,
            searchAddon: null,
            searchKeyword: '',
            searchVisible: false,
            streamPrompt: '',
            terminal: null,
            terminalContainer: null,
            terminalKeydownHandler: null,
            themeStore: useThemeStore(),
        }
    },
    computed: {
        isDarkTheme() {
            return this.themeStore.isDarkTheme;
        },
        resolvedStatusText() {
            return this.statusText || this.t('terminalPanel.ready');
        },
        resolvedStatusType() {
            return ['success', 'warning', 'danger', 'info'].includes(this.statusType) ? this.statusType : 'info';
        },
    },
    mounted() {
        this.initTerm();
    },
    beforeDestroy() {
        this.unbindTerminalEvents();
    },
    watch: {
        streamInputDisabled(value) {
            if (this.mode !== 'stream' || !this.terminal) {
                return;
            }

            this.terminal.write(value ? '\x1b[?25l' : '\x1b[?25h');
        },
        isDarkTheme() {
            this.applyTerminalTheme();
        }
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
                background: this.getThemeToken('--app-theme-terminal-bg', this.isDarkTheme ? '#1c2128' : this.themeBackground),
                cursor: this.getThemeToken('--app-theme-terminal-cursor', this.isDarkTheme ? '#539bf5' : '#7aa2f7'),
                foreground: this.getThemeToken('--app-theme-terminal-fg', this.isDarkTheme ? '#adbac7' : this.themeForeground),
                selection: this.getThemeToken('--app-theme-terminal-selection', this.isDarkTheme ? 'rgba(83, 155, 245, 0.24)' : 'rgba(122, 162, 247, 0.26)'),
            };
        },
        applyTerminalTheme() {
            if (!this.terminal) {
                return;
            }

            this.terminal.setOption('theme', this.getTerminalTheme());
        },
        bindTerminalEvents() {
            if (!this.terminalContainer) {
                return;
            }

            this.terminalKeydownHandler = event => {
                this.handleTerminalKeydown(event);
            };
            this.terminalContainer.addEventListener('keydown', this.terminalKeydownHandler, true);

            this.terminalContainer.onmouseup = event => {
                if (event.button === 2) {
                    this.pasteContentToTerminal();
                    event.stopPropagation();
                }
            };

            Mousetrap(this.terminalContainer).bind(['command+v', 'ctrl+v'], () => this.pasteContentToTerminal());
            Mousetrap(this.terminalContainer).bind(['command+f', 'ctrl+f'], () => this.toggleSearch());
            Mousetrap(this.terminalContainer).bind(['command+l', 'ctrl+l'], () => this.clearTerminal());

            // eslint-disable-next-line no-unused-vars
            Mousetrap.prototype.stopCallback = (event, element, combo) => {
                if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                    return false;
                }

                return element.tagName === 'INPUT' || element.tagName === 'SELECT' || (element.contentEditable && element.contentEditable === 'true');
            };
        },
        clearTerminal() {
            if (!this.terminal) {
                return;
            }

            this.terminal.clear();
            if (this.mode === 'line' || this.inputValue || this.streamPrompt) {
                this.renderEditableLine();
            }
            this.focus();
        },
        closeSearch() {
            this.searchVisible = false;
            this.focus();
        },
        copySelection() {
            if (!this.terminal) {
                return;
            }

            const selection = this.terminal.getSelection();
            if (!selection) {
                return;
            }

            appClipboard.writeText(selection);
            this.focus();
        },
        decreaseFontSize() {
            this.fontSize = Math.max(11, this.fontSize - 1);
            this.updateFontSize();
        },
        ensureInputLineVisible() {
            if (!this.terminal) {
                return;
            }

            this.terminal.scrollToBottom();
            this.focus();
        },
        executeCommand() {
            const command = this.inputValue;
            if (this.mode === 'stream') {
                if (command && this.histCommandList[this.histCommandList.length - 1] !== command) {
                    this.histCommandList.push(command);
                }

                this.histIndex = this.histCommandList.length;
                this.historyDraft = '';
                this.inputValue = '';
                this.cursorOffset = 0;
                this.terminal.write('\r\n');
                this.$emit('sendCommand', `${command}\n`);
                this.streamPrompt = '';
                this.ensureInputLineVisible();
                return;
            }

            this.terminal.write('\r\n');

            if (command && this.histCommandList[this.histCommandList.length - 1] !== command) {
                this.histCommandList.push(command);
            }

            this.histIndex = this.histCommandList.length;
            this.historyDraft = '';
            this.inputValue = '';
            this.cursorOffset = 0;

            this.$emit('sendCommand', command.trim() ? command.trim() : '\n');
            this.renderEditableLine();
            this.ensureInputLineVisible();
        },
        findNext() {
            if (!this.searchAddon || !this.searchKeyword) {
                return;
            }

            this.searchAddon.findNext(this.searchKeyword, {
                caseSensitive: false,
                incremental: true,
                regex: false,
            });
            this.focus();
        },
        findPrevious() {
            if (!this.searchAddon || !this.searchKeyword) {
                return;
            }

            this.searchAddon.findPrevious(this.searchKeyword, {
                caseSensitive: false,
                incremental: true,
                regex: false,
            });
            this.focus();
        },
        fit() {
            if (this.fitAddon) {
                this.fitAddon.fit();
            }
        },
        focus() {
            if (this.terminalContainer) {
                this.terminalContainer.focus();
            }

            if (this.terminal) {
                this.terminal.focus();
            }
        },
        getPromptText() {
            return this.mode === 'stream' ? '' : this.prefix;
        },
        handleArrowDown() {
            if (this.mode === 'stream') {
                this.handleStreamHistory('next');
                return;
            }

            if (!this.histCommandList.length) {
                return;
            }

            if (this.histIndex < this.histCommandList.length - 1) {
                this.histIndex++;
                this.inputValue = this.histCommandList[this.histIndex] || '';
            } else {
                this.histIndex = this.histCommandList.length;
                this.inputValue = this.historyDraft;
            }

            this.cursorOffset = this.inputValue.length;
            this.renderEditableLine();
        },
        handleArrowUp() {
            if (this.mode === 'stream') {
                this.handleStreamHistory('prev');
                return;
            }

            if (!this.histCommandList.length) {
                return;
            }

            if (this.histIndex === this.histCommandList.length) {
                this.historyDraft = this.inputValue;
            }

            if (this.histIndex > 0) {
                this.histIndex--;
            } else {
                this.histIndex = 0;
            }

            this.inputValue = this.histCommandList[this.histIndex] || '';
            this.cursorOffset = this.inputValue.length;
            this.renderEditableLine();
        },
        handleBackspace() {
            if (this.mode === 'stream') {
                if (!this.inputValue.length) {
                    return;
                }

                this.inputValue = this.inputValue.slice(0, -1);
                this.cursorOffset = this.inputValue.length;
                this.terminal.write('\b \b');
                this.ensureInputLineVisible();
                return;
            }

            if (this.cursorOffset === 0) {
                return;
            }

            this.inputValue = `${this.inputValue.slice(0, this.cursorOffset - 1)}${this.inputValue.slice(this.cursorOffset)}`;
            this.cursorOffset--;
            this.renderEditableLine();
            this.ensureInputLineVisible();
        },
        handleCopyShortcut() {
            if (this.terminal && this.terminal.hasSelection()) {
                this.copySelection();
                return true;
            }

            if (this.mode === 'stream') {
                this.terminal.write('^C\r\n');
                this.$emit('sendCommand', '\x03');
                this.inputValue = '';
                this.cursorOffset = 0;
                return true;
            }

            return false;
        },
        handleDelete() {
            if (this.mode === 'stream') {
                return;
            }

            if (this.cursorOffset >= this.inputValue.length) {
                return;
            }

            this.inputValue = `${this.inputValue.slice(0, this.cursorOffset)}${this.inputValue.slice(this.cursorOffset + 1)}`;
            this.renderEditableLine();
        },
        handleHome() {
            if (this.mode === 'stream') {
                return;
            }

            this.cursorOffset = 0;
            this.renderEditableLine();
        },
        handleInsertText(text) {
            if (!text) {
                return;
            }

            if (this.mode === 'stream') {
                this.inputValue += text;
                this.cursorOffset = this.inputValue.length;
                this.terminal.write(text);
                this.ensureInputLineVisible();
                return;
            }

            this.inputValue = `${this.inputValue.slice(0, this.cursorOffset)}${text}${this.inputValue.slice(this.cursorOffset)}`;
            this.cursorOffset += text.length;
            this.renderEditableLine();
            this.ensureInputLineVisible();
        },
        handleLineBreakOutput(command) {
            if (typeof command !== 'string') {
                return;
            }

            this.terminal.write(command);
            if (this.inputValue) {
                this.renderEditableLine();
            }
        },
        handleRight() {
            if (this.mode === 'stream') {
                return;
            }

            if (this.cursorOffset >= this.inputValue.length) {
                return;
            }

            this.cursorOffset++;
            this.renderEditableLine();
        },
        handleTerminalKeydown(event) {
            if (event.ctrlKey || event.metaKey) {
                if (event.key.toLowerCase() === 'c' && this.handleCopyShortcut()) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }

                if (event.key.toLowerCase() === 'v') {
                    event.preventDefault();
                    event.stopPropagation();
                    this.pasteContentToTerminal();
                    return;
                }

                if (event.key.toLowerCase() === 'f') {
                    event.preventDefault();
                    event.stopPropagation();
                    this.toggleSearch();
                    return;
                }

                if (event.key.toLowerCase() === 'l') {
                    event.preventDefault();
                    event.stopPropagation();
                    this.clearTerminal();
                    return;
                }

                return;
            }

            if (event.altKey) {
                return;
            }

            if (this.mode === 'stream' && this.streamInputDisabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    event.stopPropagation();
                    if (this.mode !== 'stream') {
                        this.handleLeft();
                    }
                    return;
                case 'ArrowRight':
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleRight();
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleArrowUp();
                    return;
                case 'ArrowDown':
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleArrowDown();
                    return;
                case 'Home':
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleHome();
                    return;
                case 'End':
                    event.preventDefault();
                    event.stopPropagation();
                    if (this.mode !== 'stream') {
                        this.handleEnd();
                    }
                    return;
                case 'Backspace':
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleBackspace();
                    return;
                case 'Delete':
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleDelete();
                    return;
                case 'Enter':
                    event.preventDefault();
                    event.stopPropagation();
                    this.executeCommand();
                    return;
                case 'Tab':
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleInsertText('    ');
                    return;
                default:
                    break;
            }

            if (event.key.length === 1) {
                event.preventDefault();
                event.stopPropagation();
                this.handleInsertText(event.key);
            }
        },
        handleEnd() {
            if (this.mode === 'stream') {
                return;
            }

            this.cursorOffset = this.inputValue.length;
            this.renderEditableLine();
        },
        handleLeft() {
            if (this.mode === 'stream') {
                return;
            }

            if (this.cursorOffset === 0) {
                return;
            }

            this.cursorOffset--;
            this.renderEditableLine();
        },
        increaseFontSize() {
            this.fontSize = Math.min(18, this.fontSize + 1);
            this.updateFontSize();
        },
        initResizeObserver() {
            if (!this.terminalContainer) {
                return;
            }

            this.resizeHandler = () => {
                this.fit();
            };
            window.addEventListener('resize', this.resizeHandler);

            this.resizeObserver = new ResizeObserver(() => {
                this.fit();
            });
            this.resizeObserver.observe(this.terminalContainer);
        },
        initTerm() {
            this.terminal = new Terminal({
                convertEol: true,
                cursorBlink: true,
                disableStdin: true,
                fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
                fontSize: this.fontSize,
                rendererType: 'canvas',
                rows: 100,
                scrollback: 800,
                theme: this.getTerminalTheme(),
            });
            this.fitAddon = new FitAddon();
            this.searchAddon = new SearchAddon();
            this.terminal.loadAddon(this.fitAddon);
            this.terminal.loadAddon(this.searchAddon);

            this.terminalContainer = this.$refs.terminal;
            this.terminalContainer.tabIndex = 0;
            this.terminal.open(this.terminalContainer);
            this.fit();
            this.bindTerminalEvents();
            this.initResizeObserver();
            this.applyTerminalTheme();
            this.focus();
            if (this.mode === 'stream' && this.streamInputDisabled) {
                this.terminal.write('\x1b[?25l');
            }

            if (this.mode === 'line') {
                this.renderEditableLine();
            }
        },
        pasteContentToTerminal() {
            const content = appClipboard.readText();
            if (!content) {
                return false;
            }

            const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            if (this.mode === 'stream') {
                this.inputValue += normalizedContent;
                this.cursorOffset = this.inputValue.length;
                this.terminal.write(normalizedContent);
                this.focus();
                return false;
            }

            this.handleInsertText(normalizedContent);
            this.focus();
            return false;
        },
        replaceStreamInput(nextValue) {
            const currentLength = this.inputValue.length;
            for (let i = 0; i < currentLength; i++) {
                this.terminal.write('\b \b');
            }

            this.inputValue = nextValue || '';
            this.cursorOffset = this.inputValue.length;
            if (this.inputValue) {
                this.terminal.write(this.inputValue);
            }
            this.ensureInputLineVisible();
        },
        handleStreamHistory(direction) {
            if (!this.histCommandList.length) {
                return;
            }

            if (this.histIndex === this.histCommandList.length) {
                this.historyDraft = this.inputValue;
            }

            if (direction === 'prev') {
                if (this.histIndex > 0) {
                    this.histIndex--;
                } else {
                    this.histIndex = 0;
                }
                this.replaceStreamInput(this.histCommandList[this.histIndex] || '');
                return;
            }

            if (this.histIndex < this.histCommandList.length - 1) {
                this.histIndex++;
                this.replaceStreamInput(this.histCommandList[this.histIndex] || '');
                return;
            }

            this.histIndex = this.histCommandList.length;
            this.replaceStreamInput(this.historyDraft || '');
        },
        renderEditableLine() {
            if (!this.terminal) {
                return;
            }

            const prompt = this.getPromptText();
            this.terminal.write('\r\x1b[2K');
            this.terminal.write(`${prompt}${this.inputValue}`);

            const moveLeft = this.inputValue.length - this.cursorOffset;
            if (moveLeft > 0) {
                this.terminal.write(this.repeatControl(moveLeft, '\x1b[D'));
            }
        },
        repeatControl(length, content) {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += content;
            }
            return result;
        },
        resetFontSize() {
            this.fontSize = 13;
            this.updateFontSize();
        },
        scrollToBottom() {
            if (this.terminal) {
                this.terminal.scrollToBottom();
            }
            this.focus();
        },
        t(key) {
            const result = this.$t ? this.$t(key) : key;
            return result === key ? this.getFallbackText(key) : result;
        },
        toggleSearch() {
            this.searchVisible = !this.searchVisible;
            if (this.searchVisible) {
                this.$nextTick(() => {
                    if (this.$refs.searchInput) {
                        this.$refs.searchInput.focus();
                    }
                });
                return false;
            }

            this.focus();
            return false;
        },
        unbindTerminalEvents() {
            if (this.terminalKeydownHandler && this.terminalContainer) {
                this.terminalContainer.removeEventListener('keydown', this.terminalKeydownHandler, true);
            }

            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
            }

            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }

            if (this.terminal) {
                if (this.mode === 'stream') {
                    this.terminal.write('\x1b[?25h');
                }
                this.terminal.dispose();
            }
        },
        updateFontSize() {
            if (!this.terminal) {
                return;
            }

            this.terminal.options.fontSize = this.fontSize;
            this.fit();
            this.renderEditableLine();
        },
        updateStreamPrompt(command) {
            return command;
        },
        writeData(command) {
            if (!this.terminal) {
                return;
            }

            if (this.mode === 'stream') {
                this.terminal.write(command);
                return;
            }

            this.terminal.write(command);
            this.renderEditableLine();
        },
        writeDataIn(command) {
            if (!this.terminal) {
                return;
            }

            if (this.mode === 'stream') {
                this.terminal.writeln(command);
                return;
            }

            this.terminal.writeln(command);
            this.renderEditableLine();
        },
        getFallbackText(key) {
            const fallbackMap = {
                'terminalPanel.clear': '清屏',
                'terminalPanel.copySelection': '复制选中',
                'terminalPanel.decreaseFont': '缩小字体',
                'terminalPanel.defaultTitle': '终端',
                'terminalPanel.fontSize': '字体',
                'terminalPanel.increaseFont': '放大字体',
                'terminalPanel.lineHint': 'Enter 执行  ↑↓ 历史  Ctrl+F 搜索  Ctrl+L 清屏',
                'terminalPanel.lineMode': '本地命令行',
                'terminalPanel.paste': '粘贴',
                'terminalPanel.ready': '就绪',
                'terminalPanel.reconnect': '重新连接',
                'terminalPanel.resetFont': '重置字体',
                'terminalPanel.scrollBottom': '滚动到底部',
                'terminalPanel.search': '搜索',
                'terminalPanel.searchNext': '下一个',
                'terminalPanel.searchPlaceholder': '搜索当前终端内容',
                'terminalPanel.searchPrev': '上一个',
                'terminalPanel.streamHint': 'Enter 发送  ↑↓ 历史  Ctrl+F 搜索  Ctrl+L 清屏',
                'terminalPanel.streamMode': '交互终端',
            };

            return fallbackMap[key] || key;
        },
    }
}
</script>

<style scoped>
.app-terminal {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--app-theme-workbench-bg);
    overflow: hidden;
}

.app-terminal__search {
    padding: 6px 8px 0;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    background: var(--app-theme-workbench-panel-bg);
}

.app-terminal__search-input {
    width: 100%;
    height: 28px;
    padding: 0 10px;
    border: 1px solid var(--app-theme-border);
    border-radius: 6px;
    background: var(--app-theme-control-bg);
    color: var(--app-theme-text-primary);
    outline: none;
}

.app-terminal__search-input:focus {
    border-color: var(--app-theme-control-focus);
}

.app-terminal__body {
    width: 100%;
    height: 100%;
    background: var(--app-theme-workbench-bg);
    overflow: hidden;
    min-height: 0;
    padding: 8px 6px 8px 5px;
    box-sizing: border-box;
}

.app-terminal__body :deep(.xterm),
.app-terminal__body :deep(.xterm-viewport),
.app-terminal__body :deep(.xterm-screen),
.app-terminal__body :deep(.xterm-helper-textarea) {
    width: 100%;
    height: 100%;
}

.app-terminal__body :deep(.xterm-viewport) {
    border-radius: 0;
}
</style>
