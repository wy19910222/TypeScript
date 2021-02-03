/**
 * @auth wangyun
 * @date 2020/10/29-10:27
 */

export interface HttpRequestParams {
	url?: string;
	method?: string; // "GET" "POST" "DELETE"
	dataType?: XMLHttpRequestResponseType; // 期望的返回数据类型:"json" "text" "document" ...
	async?: boolean;
	body?: BodyInit;
	headers?: { [key: string]: string };
	timeout?: number;
}

export class HttpUtil {
	public static request(url: string, method: string, sendData: Object | string,
						  success: (receivedData: any) => void, error?: (errorMsg: string) => void,
						  headers?: { [key: string]: string }, silent?: boolean): void {
		let params = this.packParams(url, method, sendData, "", headers);
		silent || console.log("HttpUtil " + params.method + " " + params.url + ": ", params.body);

		let startTime = Date.now();
		this._request(params,
			(status, dataStr) => {
				try {
					let receivedData = dataStr && typeof dataStr === "string" ? JSON.parse(dataStr) : null;
					if (!silent) {
						let duration = Date.now() - startTime;
						console.log("HttpUtil response [cost:" + duration + "ms] " + url + ": ", receivedData, dataStr);
					}
					success && success(receivedData);
				} catch (e) {
					console.error(e);
				}
			},
			(status, errorMsg) => {
				try {
					let duration = Date.now() - startTime;
					console.error("HttpUtil error [cost:" + duration + "ms] " + url + ": " + errorMsg);
				} catch (e) {
					console.error(e);
				}
				try {
					error && error(errorMsg);
				} catch (e) {
					console.error(e);
				}
			}
		);
	}

	public static upload(url: string, uploadBuffer: ArrayBuffer | Blob, complete: (succeeded: boolean) => void): void {
		let startTime = Date.now();
		let params: HttpRequestParams = {url, method: "post", body: uploadBuffer};
		console.log("HttpUtil upload " + params.method + ": " + params.url);
		this._request(params,
			() => {
				let duration = Date.now() - startTime;
				console.log("HttpUtil upload completed [cost:" + duration + "ms]: " + params.url);
				try {
					complete && complete(true);
				}
				catch (e) {
					console.error(e);
				}
			},
			(status, errorMsg) => {
				let duration = Date.now() - startTime;
				console.error("HttpUtil upload error [cost:" + duration + "ms] " + params.url + ": " + errorMsg);
				try {
					complete && complete(false);
				}
				catch (e) {
					console.error(e);
				}
			}
		);
	}

	public static download(url: string, method: string, sendData: Object | string, complete: (downloadBuffer: ArrayBuffer) => void, headers?: { [key: string]: string }): void {
		let startTime = Date.now();
		let params = this.packParams(url, method, sendData, "arraybuffer", headers);
		console.log("HttpUtil download " + params.method + ": " + params.url);
		this._request(params,
			(status, data) => {
				let duration = Date.now() - startTime;
				console.log("HttpUtil download completed [cost:" + duration + "ms]: " + params.url);
				try {
					complete && complete(data);
				}
				catch (e) {
					console.error(e);
				}
			},
			(status, errorMsg) => {
				let duration = Date.now() - startTime;
				console.error("HttpUtil download error [cost:" + duration + "ms] " + params.url + ": " + errorMsg);
				try {
					complete && complete(null);
				}
				catch (e) {
					console.error(e);
				}
			}
		);
	}


	private static packParams(url: string, method: string, sendData: Object | string, dataType: XMLHttpRequestResponseType, headers?: { [key: string]: string }): HttpRequestParams {
		let params: HttpRequestParams = {url, method, body: null};
		params.dataType = dataType || "";
		params.headers = {"Content-Type": "application/x-www-form-urlencoded", ...(headers || {})};

		let sType = method.toUpperCase();
		let isUseUrlParam = sType === "GET" || sType === "DELETE";
		if (isUseUrlParam) {
			if (sendData) {	// 如果是"简单"请求,则把data参数组装在url上
				let paramsStr = sendData instanceof Object ? HttpUtil.toQueryString(sendData) : sendData;
				params.url += params.url.indexOf("?") !== -1 ? "&" + paramsStr : "?" + paramsStr;
			}
		} else {
			if (typeof sendData === "string" || sendData instanceof ArrayBuffer) {
				params.body = sendData;
			} else if (sendData) {
				if (params.headers["Content-Type"] === "application/json") {
					params.body = JSON.stringify(sendData)
				} else {
					params.body = HttpUtil.toQueryString(sendData);
				}
			}
		}
		return params;
	}

	private static _request(requestParams: HttpRequestParams, success: (status: number, data: any) => void, error: (status: number, errorMsg: string) => void): void {
		let params: HttpRequestParams = Object.assign({
			async: true, headers: {}, timeout: 5000
		}, requestParams || {});
		if (!params.url || !params.method) {
			console.error("HttpUtil request params is invalid!");
			return;
		}

		let httpRequest = new XMLHttpRequest();
		httpRequest.onload = () => {
			const status = httpRequest.status;
			if ((status >= 200 && status < 300) || status === 304) {
				let data: any;
				if (httpRequest.responseType === "text" || httpRequest.responseType === "") {
					data = httpRequest.responseText;
				} else if (httpRequest.responseType === "document") {
					data = httpRequest.responseXML;
				} else {
					data = httpRequest.response;
				}
				success && success(status, data);
			} else {
				error && error(status, "[" + httpRequest.status + "]" + httpRequest.statusText + ":" + httpRequest.responseURL);
			}
		};
		httpRequest.onerror = event => {
			error && error(httpRequest.status, "HttpUtil request failed Status:" + httpRequest.status + " text:" + httpRequest.statusText);
		};
		httpRequest.onabort = () => {
			error && error(httpRequest.status, "HttpUtil request was aborted by user");
		};
		httpRequest.ontimeout = () => {
			error && error(408, "HttpUtil request timeout");
		};

		httpRequest.open(params.method, params.url, params.async);

		httpRequest.responseType = params.dataType;
		for (let key in params.headers) {
			if (params.headers.hasOwnProperty(key)) {
				httpRequest.setRequestHeader(key, params.headers[key]);
			}
		}
		if (params.async && params.timeout) {
			httpRequest.timeout = params.timeout;
		}

		httpRequest.send(params.body);
	}

	public static toQueryString(data: any): string {
		let paramsArray: string[] = [];
		if (data != null && data instanceof Object) {
			for (let key in data) {
				if (data.hasOwnProperty(key)) {
					let value = data[key];
					if (value !== undefined) {
						let valueJsonStr = typeof value === "string" ? value : JSON.stringify(value);
						paramsArray.push(encodeURIComponent(key) + "=" + encodeURIComponent(valueJsonStr));
					}
				}
			}
		}
		return paramsArray.join("&");
	}
}