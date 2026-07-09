<template>
    <app-terminal ref="terminal" mode="stream" :canReconnect="true" :status-text="terminalStatusText" :status-type="terminalStatusType"
        :streamInputDisabled="isWaitingResponse" :subtitle="endpointText" :title="terminalTitle" @reconnect="connect" @sendCommand="handleInput"></app-terminal>
</template>

<script>
import { appTelnet }          from "@/renderer/core/AppRenderer.js";
import AppTerminal              from "./terminal.vue";

export default {
    name: "TelnetTerminal",
    components: {
        AppTerminal,
        'app-terminal': AppTerminal,
    },
    props: {
        ip: String,
        port: [String, Number],
    },
    data() {
        return {
            connectState: 'idle',
            hasConnectError: false,
            isManualClose: false,
            isWaitingResponse: false,
            reconnectDelay: 1000,
            reconnectTimer: null,
            sessionId: null,
            terminalTail: '',
        }
    },
    computed: {
        endpointText() {
            if (!this.ip || !this.port) {
                return this.text('telnetTerminal.endpointEmpty', '未配置终端地址');
            }

            return `${this.ip}:${this.port}`;
        },
        terminalStatusText() {
            const statusMap = {
                connected: this.text('telnetTerminal.connected', '已连接'),
                connecting: this.text('telnetTerminal.connectingShort', '连接中'),
                error: this.text('telnetTerminal.connectionTimeout', '连接超时，请检查网络 {ip} {port}', {
                    ip: this.ip,
                    port: this.port
                }),
                idle: this.text('telnetTerminal.idle', '就绪'),
                reconnecting: this.text('telnetTerminal.reconnecting', '重连中'),
            };

            return statusMap[this.connectState] || statusMap.idle;
        },
        terminalStatusType() {
            const typeMap = {
                connected: 'success',
                connecting: 'warning',
                error: 'danger',
                idle: 'info',
                reconnecting: 'warning',
            };

            return typeMap[this.connectState] || 'info';
        },
        terminalTitle() {
            return this.text('telnetTerminal.title', 'Telnet 终端');
        },
    },
    watch: {
        ip() {
            this.connect();
        },
        port() {
            this.connect();
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.connect();
        });
    },
    beforeDestroy() {
        this.clearReconnectTimer();
        this.closeSession(true);
    },
    methods: {
        clearReconnectTimer() {
            if (!this.reconnectTimer) {
                return;
            }

            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        },
        closeSession(isManualClose = false) {
            this.isManualClose = isManualClose;
            if (!this.sessionId) {
                return;
            }

            appTelnet.close(this.sessionId);
            this.sessionId = null;
        },
        handleInput(command) {
            if (!this.sessionId) {
                return;
            }

            if (typeof command === 'string' && command.endsWith('\n')) {
                this.terminalTail = '';
                this.isWaitingResponse = true;
            }

            appTelnet.write(this.sessionId, command);
        },
        connect() {
            if (!this.ip || !this.port) {
                this.connectState = 'idle';
                return;
            }

            this.clearReconnectTimer();
            this.hasConnectError = false;
            this.closeSession(true);
            this.isManualClose = false;
            this.isWaitingResponse = false;
            this.terminalTail = '';
            this.connectState = 'connecting';

            try {
                this.$refs.terminal.writeDataIn(this.text('telnetTerminal.connecting', '正在连接 {ip} {port}', {
                    ip: this.ip,
                    port: this.port
                }));

                this.sessionId = appTelnet.connect({
                    ip: this.ip,
                    port: this.port,
                    onConnect: () => {
                        this.connectState = 'connected';
                    },
                    onError: () => {
                        if (this.hasConnectError) {
                            return;
                        }

                        this.hasConnectError = true;
                        this.sessionId = null;
                        this.isWaitingResponse = false;
                        this.connectState = 'error';
                        this.$refs.terminal.writeDataIn(this.text('telnetTerminal.connectionTimeout', '连接超时，请检查网络 {ip} {port}', {
                            ip: this.ip,
                            port: this.port
                        }));
                        this.scheduleReconnect();
                    },
                    onClose: () => {
                        this.sessionId = null;
                        this.isWaitingResponse = false;
                        if (this.isManualClose) {
                            this.connectState = 'idle';
                            return;
                        }

                        if (!this.hasConnectError) {
                            this.connectState = 'reconnecting';
                            this.$refs.terminal.writeDataIn(this.text('telnetTerminal.connectionClosed', '连接断开，正在重新连接...'));
                        }
                        this.scheduleReconnect();
                    },
                    onData: content => {
                        this.connectState = 'connected';
                        this.updateWaitingState(content);
                        this.$refs.terminal.writeData(content);
                    }
                });
            } catch (error) {
                this.connectState = 'error';
                this.isWaitingResponse = false;
                this.$refs.terminal.writeDataIn(this.text('telnetTerminal.connectionTimeout', '连接超时，请检查网络 {ip} {port}', {
                    ip: this.ip,
                    port: this.port
                }));
                this.scheduleReconnect();
            }
        },
        scheduleReconnect() {
            if (this.isManualClose || this.reconnectTimer || !this.ip || !this.port) {
                return;
            }

            this.connectState = 'reconnecting';
            this.reconnectTimer = setTimeout(() => {
                this.reconnectTimer = null;
                this.connect();
            }, this.reconnectDelay);
        },
        updateWaitingState(content) {
            if (!this.isWaitingResponse || typeof content !== 'string') {
                return;
            }

            this.terminalTail = `${this.terminalTail}${content}`.slice(-200);
            if (/(?:^|[\r\n]).*[>#\$]\s*$/.test(this.terminalTail)) {
                this.isWaitingResponse = false;
                this.terminalTail = '';
            }
        },
        text(key, fallback, params = {}) {
            if (!this.$t) {
                return this.formatText(fallback, params);
            }

            const result = this.$t(key, params);
            if (result === key) {
                return this.formatText(fallback, params);
            }

            return result;
        },
        formatText(template, params = {}) {
            return Object.keys(params).reduce((result, key) => {
                return result.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
            }, template);
        },
    }
}
</script>

<style scoped>
</style>
