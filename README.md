
# Binance Api Client

This TypeScript library provides comprehensive tools for interacting with Binance's Spot and Coin-M/USD-M Futures APIs. It supports both RESTful API requests and WebSocket connections for real-time data streaming.

## Features

- REST API Client: Facilitates authenticated requests to Binance's Spot and Coin-M/USD-M Futures markets.
- WebSocket Market Data Client: Handles real-time market data streaming with automatic management of connections and subscriptions.
- WebSocket User Data Client: Handles real-time user data streaming with automatic management of connections and subscriptions and additionaly manages listen keys for user data streams, handling creation, renewal, and expiration.

## Installation

```bash
  npm i @mykyta-isai/binance-api-connector
```

## Setup

To use the library, import and initialize the desired API client with your Binance API credentials:

```javascript
import { BinanceSpotApiClient, BinanceUsdmFuturesApiClient, BinanceCoinmFuturesApiClient } from '@mykyta-isai/binance-api-connector';

const spotClient = new BinanceSpotApiClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret'
});

const usdmFuturesClient = new BinanceUsdmFuturesApiClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret'
});

const coinmFuturesClient = new BinanceCoinmFuturesApiClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret'
});
```

## Making API Calls

The library supports three types of API requests: public, keyed, and private. Here's how you can use each:

- Public Requests: These do not require API keys and are used to access public market data.

```javascript
async function getTickerPrice() {
  const response = await spotClient.publicRequest({
    method: 'GET',
    path: '/api/v3/ticker/price',
    params: { symbol: 'BTCUSDT' }
  });
  console.log('Current Bitcoin Price:', response);
}

getTickerPrice();
```
- Keyed Requests: These require an API key but not a secret, suitable for endpoints that need identity but not signing.

```javascript
async function getAccountStatus() {
  const response = await spotClient.keyedRequest({
    method: 'GET',
    path: '/api/v3/account'
  });
  console.log('Account Status:', response);
}

getAccountStatus();
```
- Private Requests: These require both API key and secret for signed requests, necessary for trading and account management.

```javascript
async function getUserData() {
  const response = await spotClient.privateRequest({
    method: 'GET',
    path: '/api/v3/account'
  });
  console.log('User Account Data:', response);
}

getUserData();
```

These examples demonstrate the flexibility of the library in handling different types of requests depending on the access level and information security required by the Binance API endpoints.

## Managing WebSocket Connections

For real-time data streaming you can use BinanceUdmMarketDataStreamClient, BinanceCoinmMarketDataStreamClient or BinanceSpotMarketDataStreamClient:

```javascript
import { BinanceSpotMarketDataStreamClient } from '@mykyta-isai/binance-api-connector';

const marketStream = new BinanceSpotMarketDataStreamClient({
  onMessageCallback: (message) => console.log('New Message:', message),
  errorCallback: (error) => console.error('WebSocket Error:', error),
  closeCallback: () => console.log('WebSocket Closed'),
  connectionCallback: () => console.log('WebSocket Connected'),
  streams: ['btcusdt@aggTrade', 'btcusdt@depth']
});

// Subscribe to an additional stream
marketStream.subscribeStreams(['ethusdt@aggTrade']);

// Unsubscribe to an additional stream
marketStream.unsubscribeStreams(['ethusdt@aggTrade']);

// List current subscriptions
marketStream.listSubscriptions();
```

For real-time data streaming, use the BinanceSpotUserDataStreamClient, BinanceUsdmUserDataStreamClient or BinanceCoinmUserDataStreamClient for user-specific streams. This client manages the listen key and handles reconnections and renewals automatically.

Here's how to subscribe to user data streams and handle messages:

```javascript
import { BinanceSpotUserDataStreamClient, WebSocketConnectOptions } from '@mykyta-isai/binance-api-connector';

const options: WebSocketConnectOptions = {
  apiKey: 'your-api-key',
  onMessageCallback: (message) => console.log('New Message:', message),
  errorCallback: (error) => console.error('WebSocket Error:', error),
  closeCallback: () => console.log('WebSocket Closed'),
  connectionCallback: () => console.log('WebSocket Connected')
};

const userDataStream = new BinanceSpotUserDataStreamClient(options);

// Keep the stream alive by managing the listen key automatically
// The library takes care of renewing the listen key before it expires

// When you are done with the stream
function disconnectDataStream() {
  userDataStream.disconnect();
  console.log('Disconnected from user data stream.');
}

// Optionally, disconnect the stream based on some application logic or user action
setTimeout(disconnectDataStream, 3600000); // Disconnect after 1 hour for example
```
