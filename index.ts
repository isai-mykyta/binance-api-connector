import { BinanceApiClient } from "./src/binanceApiClient";
import { BinanceMarketDataStreamClient } from "./src/binanceMarketDataStreamClient";
import { BinanceUserDataStreamClient } from "./src/binanceUserDataStreamClient";
import { BinanceApiOptions, MarketDataWebSocketConnectOptions, WebSocketConnectOptions } from "./src/types";

export class BinanceSpotApiClient extends BinanceApiClient {
  constructor (options: Omit<BinanceApiOptions, "apiUrl">) {
    super({ ...options, apiUrl: "https://api.binance.com", });
  }
}

export class BinanceUsdmFuturesApiClient extends BinanceApiClient {
  constructor (options: Omit<BinanceApiOptions, "apiUrl">) {
    super({ ...options, apiUrl: "https://fapi.binance.com", });
  }
}

export class BinanceCoinmFuturesApiClient extends BinanceApiClient {
  constructor (options: Omit<BinanceApiOptions, "apiUrl">) {
    super({ ...options, apiUrl: "https://dapi.binance.com", });
  }
}

export class BinanceSpotMarketDataStreamClient extends BinanceMarketDataStreamClient {
  constructor (options: Omit<MarketDataWebSocketConnectOptions, "apiUrl">) {
    super({ ...options, apiUrl: "wss://stream.binance.com:9443", });
  }
}

export class BinanceUdmMarketDataStreamClient extends BinanceMarketDataStreamClient {
  constructor (options: Omit<MarketDataWebSocketConnectOptions, "apiUrl">) {
    super({ ...options, apiUrl: "wss://fstream.binance.com", });
  }
}

export class BinanceCoinmMarketDataStreamClient extends BinanceMarketDataStreamClient {
  constructor (options: Omit<MarketDataWebSocketConnectOptions, "apiUrl">) {
    super({ ...options, apiUrl: "wss://dstream.binance.com", });
  }
}

export class BinanceSpotUserDataStreamClient extends BinanceUserDataStreamClient {
  constructor (options: Omit<WebSocketConnectOptions, "apiUrl" | "id"> & { apiKey: string }) {
    super({ 
      ...options, 
      apiUrl: "https://api.binance.com",
      wsApiUrl: "wss://stream.binance.com:9443",
    });
  }
}

export class BinanceUsdmUserDataStreamClient extends BinanceUserDataStreamClient {
  constructor (options: Omit<WebSocketConnectOptions, "apiUrl" | "id"> & { apiKey: string }) {
    super({ 
      ...options, 
      apiUrl: "https://fapi.binance.com",
      wsApiUrl: "wss://fstream.binance.com",
    });
  }
}

export class BinanceCoinmUserDataStreamClient extends BinanceUserDataStreamClient {
  constructor (options: Omit<WebSocketConnectOptions, "apiUrl" | "id"> & { apiKey: string }) {
    super({ 
      ...options, 
      apiUrl: "https://dapi.binance.com",
      wsApiUrl: "wss://dstream.binance.com",
    });
  }
}
