import * as crypto from "crypto";
import axios from "axios";

import { BinanceApiOptions, HttpRequestOptions } from "./types";

export abstract class BinanceApiClient {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiUrl: string;

  constructor (options: BinanceApiOptions) {
    this.apiKey = options.apiKey;
    this.apiSecret = options.apiSecret;
    this.apiUrl = options.apiUrl;
  }

  private stringifyData<V>(value: V): string | V {
    return Array.isArray(value) ? `["${value.join("\",\"")}"]` : value;
  }

  private buildQueryString<P>(params: P): string {
    if (!params) {
      return "";
    }
    
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(this.stringifyData(value as string))}`)
      .join("&");
  }

  private createSignature(queryString: string): string {
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(queryString)
      .digest("hex");
  }

  private async signedRequest<P, D>(
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    path: string,
    params?: P,
    data?: D,
    headers?: Record<string, unknown>
  ) {
    const timestamp = Date.now();
    const queryString = this.buildQueryString({ ...params, timestamp, });
    const signature = this.createSignature(queryString);
    const requestBody = data ? JSON.stringify(data) : undefined;

    const response = await this.request({
      path,
      method,
      params: {
        ...params,
        signature,
        timestamp,
      },
      headers: {
        "X-MBX-APIKEY": this.apiKey,
        ...headers,
      },
      data: requestBody,
    });

    return response;
  }

  private async request<P, D>(options: HttpRequestOptions<P, D>) {
    const stringifiedParams = Object.entries(options.params || {})
      .reduce<Record<string, unknown>>((acc, [key, value]) => {
        acc[key] = this.stringifyData(value);
        return acc;
      }, {});

    const config: Record<string, unknown> = {
      url: options.path,
      method: options.method,
      baseURL: this.apiUrl,
      params: stringifiedParams,
      data: options.data,
    };

    if (options.headers) {
      config.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
    }

    const response = await axios.request(config);
    return response.data;
  }

  public async publicRequest<P, D, R>(options: HttpRequestOptions<P, D>): Promise<R> {
    return await this.request({
      ...options,
      params: options.params,
      data: options.data,
    });
  }

  public async keyedRequest<P, D, R>(options: HttpRequestOptions<P, D>): Promise<R> {
    return await this.request({ 
      ...options,
      params: options.params,
      data: options.data,
      headers: {
        ...options.headers,
        "X-MBX-APIKEY": this.apiKey,
      },
    });
  }

  public async privateRequest<P, D, R>(options: HttpRequestOptions<P, D>): Promise<R> {
    return await this.signedRequest<P, D>(
      options.method, 
      options.path, 
      options.params,
      options.data,
      options.headers
    );
  }
}
