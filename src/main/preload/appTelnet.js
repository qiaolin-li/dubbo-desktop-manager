import net                     from 'net';
import telnetStream            from 'telnet-stream';

class AppTelnet {

    constructor() {
        this.sessionMap = new Map();
        this.sessionId = 0;
    }

    connect(options = {}) {
        const { ip, port, onConnect, onError, onClose, onData } = options;

        if (!ip || !port) {
            throw new Error('telnet connect requires ip and port');
        }

        const sessionId = `telnet-${++this.sessionId}`;
        const socket = net.createConnection(port, ip);
        const telnetSocket = new telnetStream.TelnetSocket(socket);
        const session = {
            id: sessionId,
            ip,
            port,
            socket,
            telnetSocket,
            onConnect,
            onError,
            onClose,
            onData,
        };

        this.sessionMap.set(sessionId, session);

        socket.on('connect', () => {
            session.onConnect && session.onConnect();
            telnetSocket.write('\n');
        });

        socket.on('error', error => {
            session.onError && session.onError({
                message: error?.message || String(error),
            });
        });

        socket.on('close', () => {
            session.onClose && session.onClose();
            this.sessionMap.delete(sessionId);
        });

        telnetSocket.on('data', buffer => {
            session.onData && session.onData(buffer.toString('utf8'));
        });

        return sessionId;
    }

    write(sessionId, content) {
        const session = this.sessionMap.get(sessionId);
        if (!session) {
            return false;
        }

        session.telnetSocket.write(content);
        return true;
    }

    close(sessionId) {
        const session = this.sessionMap.get(sessionId);
        if (!session) {
            return false;
        }

        this.sessionMap.delete(sessionId);
        session.telnetSocket.end();
        session.socket.destroy();
        return true;
    }
}

export default new AppTelnet();
