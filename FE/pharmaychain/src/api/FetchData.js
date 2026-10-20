export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getToken() {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
}

async function sendRequest(url, method = 'GET', payload = null) {
    const token = getToken();
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    if (payload !== null && payload !== undefined) {
        options.body = JSON.stringify(payload);
    }

    let res;
    try {
        res = await fetch(url, options);
    } catch (err) {
        throw new ApiError(
            'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.',
            err.message
        );
    }

    if (!res.ok) {
        let message = `Lỗi ${res.status}`;
        try {
            const text = await res.text();
            if (text) {
                try {
                    const json = JSON.parse(text);
                    message = json.message || json.error || text;
                } catch {
                    message = text;
                }
            }
        } catch {
            // ignore
        }
        throw new ApiError(message, res.status);
    }

    if (res.status === 204 || res.status === 205) {
        return null;
    }
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export const get = (url) => sendRequest(url, 'GET');
export const post = (url, data) => sendRequest(url, 'POST', data);
export const put = (url, data) => sendRequest(url, 'PUT', data);
export const patch = (url, data) => sendRequest(url, 'PATCH', data);
export const del = (url) => sendRequest(url, 'DELETE');
