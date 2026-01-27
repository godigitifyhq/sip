import { io, Socket } from 'socket.io-client';

type MessageHandler = (data: any) => void;
type EventHandler = { [key: string]: MessageHandler[] };

class WebSocketService {
    private socket: Socket | null = null;
    private handlers: EventHandler = {};
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(token: string) {
        if (this.socket?.connected) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

        this.socket = io(wsUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server forcibly disconnected, reconnect manually
                this.socket?.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.reconnectAttempts++;
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.disconnect();
            }
        });

        // Register all existing handlers
        Object.keys(this.handlers).forEach((event) => {
            this.handlers[event].forEach((handler) => {
                this.socket?.on(event, handler);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.handlers = {};
        }
    }

    on(event: string, handler: MessageHandler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
        this.socket?.on(event, handler);
    }

    off(event: string, handler?: MessageHandler) {
        if (handler) {
            this.handlers[event] = this.handlers[event]?.filter((h) => h !== handler) || [];
            this.socket?.off(event, handler);
        } else {
            delete this.handlers[event];
            this.socket?.off(event);
        }
    }

    emit(event: string, data: any) {
        if (!this.socket?.connected) {
            console.warn('Socket not connected, cannot emit event:', event);
            return;
        }
        this.socket.emit(event, data);
    }

    // Specific event methods
    register(userId: string) {
        this.emit('register', { userId });
    }

    sendMessage(data: { receiverId: string; content: string; applicationId?: string }) {
        this.emit('message', data);
    }

    onMessage(handler: MessageHandler) {
        this.on('message', handler);
    }

    onNotification(handler: MessageHandler) {
        this.on('notification', handler);
    }

    onApplicationUpdate(handler: MessageHandler) {
        this.on('application:update', handler);
    }

    onMilestoneUpdate(handler: MessageHandler) {
        this.on('milestone:update', handler);
    }
}

export const wsService = new WebSocketService();
