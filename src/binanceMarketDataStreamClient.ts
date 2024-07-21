import WebSocket from "ws";

import { MarketDataWebSocketConnectOptions, WebSocketConnectOptions } from "../types";

export abstract class BinanceMarketDataStreamClient {
  private readonly apiUrl: string;
  private connection!: WebSocket;

  constructor (options: MarketDataWebSocketConnectOptions) {
    this.apiUrl = `${options.apiUrl}/stream?streams=${options.streams.map(stream => stream.toLocaleLowerCase()).join("/")}`;
    this.connect(options);
  }

  private connect(options: WebSocketConnectOptions): void {
    const ws = new WebSocket(this.apiUrl);

    ws.on("ping", payload => ws.pong(payload));
    ws.on("message", data => options.onMessageCallback(JSON.parse(data.toString())));
    ws.on("error", error => options.errorCallback?.(error));
    ws.on("close", () => options.closeCallback?.());

    options.connectionCallback?.();
    this.connection = ws;
  }

  private generateRandomStreamId(): number {
    return Math.floor(Math.random() * 1_000_000) + 1;
  }

  public subscribeStreams(streams: string[], id?: number): void {
    this.connection.send(JSON.stringify({
      id: id || this.generateRandomStreamId(), 
      method: "SUBSCRIBE", 
      params: [...streams], 
    }));
  }

  public unsubscribeStreams(streams: string[], id?: number): void {
    this.connection.send(JSON.stringify({
      id: id || this.generateRandomStreamId(), 
      method: "UNSUBSCRIBE", 
      params: [...streams], 
    }));
  }

  public listSubscriptions(id?: number): void {
    this.connection.send(JSON.stringify({
      id: id || this.generateRandomStreamId(), 
      method: "LIST_SUBSCRIPTIONS",
    }));
  }

  public disconnect(): void {
    this.connection.close();
  }
}
