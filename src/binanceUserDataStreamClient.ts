import WebSocket from "ws";

import { BinanceApiOptions, ListenKeyResponse, UserDataWebSocketConnectOptions, WebSocketConnectOptions } from "../types";
import { BinanceApiClient } from "./binanceApiClient";

export abstract class BinanceUserDataStreamClient {
  private readonly apiKey: string;
  private readonly intervals: Map<string,  NodeJS.Timeout> = new Map();
  private readonly apiUrl: string;
  private readonly wsApiUrl: string;
  private readonly expirationTime = 40 * 60 * 1000; // 40 minutes in milliseconds

  private connection!: WebSocket;
  private apiClient: BinanceApiClient;
  private nextIntervalId = 0;
  private listenKey!: string;
  private creationTimestamp!: number;

  constructor (options: UserDataWebSocketConnectOptions) {
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl;
    this.wsApiUrl = options.wsApiUrl;

    class ApiClient extends BinanceApiClient {
      constructor (options: BinanceApiOptions) {
        super(options);
      }
    }
    
    this.apiClient = new ApiClient({
      apiKey: this.apiKey,
      apiUrl: this.apiUrl,
      apiSecret: "",
    });

    this.connect({
      ...options,
      apiUrl: this.wsApiUrl,
    });
  }

  private async connect(options: WebSocketConnectOptions): Promise<void> {
    const data = await this.createListenKey();

    if (data && data.listenKey) {
      this.listenKey = data.listenKey;
      this.creationTimestamp = Date.now();
    }

    if (this.listenKey && !this.isExpired()) {
      const interval = setInterval(async () => {
        await this.pingListenKey();
      }, this.expirationTime);

      this.intervals.set(`${this.nextIntervalId++}`, interval);

      const ws = new WebSocket(`${this.wsApiUrl}/ws/${this.listenKey}`);

      ws.on("ping", payload => ws.pong(payload));
      ws.on("message", data => options.onMessageCallback(JSON.parse(data.toString())));
      ws.on("error", error => options.errorCallback?.(error));
      ws.on("close", () => options.closeCallback?.());

      options.connectionCallback?.();
      this.connection = ws;
    }
  }

  private getUserDataPath(): string {
    switch (this.apiUrl) {
    case "https://api.binance.com":
      return "/api/v3/userDataStream";
    case "https://fapi.binance.com":
      return "/fapi/v1/listenKey";
    case "https://dapi.binance.com":
      return "/dapi/v1/listenKey";
    default:
      return "";
    }
  }

  private async createListenKey(): Promise<ListenKeyResponse> {
    return await this.apiClient.keyedRequest({
      method: "POST",
      path: this.getUserDataPath(),
    });
  }

  private async updateListenKey(): Promise<ListenKeyResponse> {
    return await this.apiClient.keyedRequest({
      method: "PUT",
      path: this.getUserDataPath(),
      params: { listenKey: this.listenKey, },
    });
  }

  private async pingListenKey(): Promise<void> {
    const data = await this.updateListenKey();
    if (data) this.creationTimestamp = Date.now();
  }

  private getRemainingTime(): number {
    const timeElapsed = Date.now() - this.creationTimestamp;
    return this.expirationTime - timeElapsed;
  }

  private isExpired(): boolean {
    return this.getRemainingTime() <= 0;
  }

  private clearIntervals(): void {
    this.intervals.forEach((interval: NodeJS.Timeout) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  public disconnect(): void {
    this.connection.close();
    this.clearIntervals();
  }
}
