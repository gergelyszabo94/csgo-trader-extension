interface requestOptions {
    headers?: object;
    params?: object;
    body?: string;
    form?: object;
    json?: object;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
}

export const get = async (url: string, options?: requestOptions) => {
    return await request(url, 'GET', options);
};

export const post = async (url: string, options?: requestOptions) => {
    return await request(url, 'POST', options);
};

export const put = async (url: string, options?: requestOptions) => {
    return await request(url, 'PUT', options);
};

// only types being used; can be added to.
type method = 'GET' | 'POST' | 'PUT';
const request = async (url: string, method: method, options?: requestOptions): Promise<Response> => {
    const headers = new Headers();
    let body: string;

    if (options.body) {
        body = options.body;
    } else if (options.form) {
        body = urlEncode(options.form);
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
    } else if (options.json) {
        body = JSON.stringify(options.json);
        headers.append('Content-Type', 'application/json');
    }

    if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
            headers.append(key, value);
        }
    }

    const params = urlEncode(options.params);
    if (params) {
        url += '?' + params;
    }
    const req = new Request(url, {
        method,
        body,
        headers,
        mode: options.mode,
        credentials: options.credentials,
        cache: options.cache,
    });
    return await fetch(req);
};

// URL Encodes object.
// Used when input data is x-www-form-urlencoded,
// and for parameters.
const urlEncode = (data: object): string => {
    if (!data) return '';
    const encoded = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        encoded.append(key, value);
    }
    return encoded.toString();
};
