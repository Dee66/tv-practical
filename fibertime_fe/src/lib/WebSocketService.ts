import { io, Socket } from "socket.io-client";

class WebSocketService {
    private static instance: WebSocketService;
    private socket: Socket | null = null;

    private constructor() { }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    async connect(url: string = "http://localhost:3000", options: Record<string, any> = {
        path: "/socket.io/",
        transports: ["websocket"],
    }): Promise<void> {
        if (this.socket) {
            return;
        }

        this.socket = io(url, options);

        return new Promise((resolve, reject) => {
            this.socket?.on("connect", () => {
                resolve();
            });
            this.socket?.on("connect_error", (err) => {
                reject(err);
            });
            this.socket?.on("disconnect", () => {
                this.socket = null;
            });
        });
    }

    on(event: string, callback: (...args: any[]) => void): void {
        this.socket?.on(event, callback);
    }

    emit(event: string, data: any): void {
        this.socket?.emit(event, data);
    }

    off(event: string): void {
        this.socket?.off(event);
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export const webSocketService = WebSocketService.getInstance();