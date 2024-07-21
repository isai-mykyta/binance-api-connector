export enum RequestType {
  GET = "GET",
  POST = "POST",
  PATH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE"
}

export interface BinanceApiOptions {
  apiKey: string;
  apiSecret: string;
  apiUrl: string;
}

export interface HttpRequestOptions<P, D = null> {
  method: RequestType;
  path: string;
  params?: P;
  headers?: Record<string, unknown>;
  data?: D;
}

export interface WebSocketConnectOptions {
  onMessageCallback: (data: any) => void;
  errorCallback?: (error: any) => void;
  closeCallback?: () => void;
  connectionCallback?: () => void;
  apiUrl: string;
  id?: number;
}

export interface MarketDataWebSocketConnectOptions {
  onMessageCallback: (data: any) => void;
  errorCallback?: (error: any) => void;
  closeCallback?: () => void;
  connectionCallback?: () => void;
  apiUrl: string;
  id?: number;
  streams: string[];
}

export interface UserDataWebSocketConnectOptions {
  onMessageCallback: (data: any) => void;
  errorCallback?: (error: any) => void;
  closeCallback?: () => void;
  connectionCallback?: () => void;
  wsApiUrl: string;
  apiKey: string;
  apiUrl: string;
  id?: number;
}

export interface ListenKeyResponse {
  listenKey: string;
}
