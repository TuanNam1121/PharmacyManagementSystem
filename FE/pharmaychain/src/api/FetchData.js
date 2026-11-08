import axios from 'axios';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// In-Memory Access Token (không lưu localStorage để phòng chống tấn công XSS)
let memoryAccessToken = null;

// Callbacks to synchronize state with React AuthContext
let onTokenRefreshedCallback = null;
let onAuthFailedCallback = null;

export const setAuthToken = (token) => {
  memoryAccessToken = token;
};

export const getAuthToken = () => {
  return memoryAccessToken;
};

export const setOnTokenRefreshed = (callback) => {
  onTokenRefreshedCallback = callback;
};

export const setOnAuthFailed = (callback) => {
  onAuthFailedCallback = callback;
};

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: '',
  withCredentials: true, // Tự động đính kèm HttpOnly Cookie chứa Refresh Token
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Đính kèm Access Token vào header Authorization
apiClient.interceptors.request.use(
  (config) => {
    if (memoryAccessToken) {
      config.headers['Authorization'] = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Biến trạng thái và hàng đợi hỗ trợ xử lý nhiều request 401 đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Response Interceptor: Bắt lỗi 401 và tự động gọi /refresh-token
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      throw new ApiError(
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.',
        0
      );
    }

    const status = error.response.status;
    const resData = error.response.data;
    const message = resData?.message || resData?.error || error.message || `Lỗi ${status}`;

    const requestUrl = originalRequest?.url || '';
    const isAuthExempt =
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/v1/auth/refresh-token') ||
      requestUrl.includes('/api/v1/auth/logout') ||
      requestUrl.includes('/api/v1/auth/forgot-password') ||
      requestUrl.includes('/api/v1/auth/reset-password');

    // Nếu lỗi 401 và không phải là request auth hay request đã retry
    if (status === 401 && !originalRequest?._retry && !isAuthExempt) {
      if (isRefreshing) {
        // Đưa request vào hàng đợi chờ token mới
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API /refresh-token (cookie HttpOnly tự động được gửi qua withCredentials: true)
        const refreshRes = await axios.post(
          'http://localhost:8080/api/v1/auth/refresh-token',
          {},
          { withCredentials: true }
        );

        const payload = refreshRes.data?.data || refreshRes.data;
        const newAccessToken = payload?.accessToken;

        if (!newAccessToken) {
          throw new Error('Không nhận được Access Token mới');
        }

        // Cập nhật Access Token trong bộ nhớ
        memoryAccessToken = newAccessToken;

        // Báo cho React AuthContext cập nhật state
        if (onTokenRefreshedCallback) {
          onTokenRefreshedCallback(newAccessToken, payload.user || null);
        }

        // Giải phóng các request đang chờ
        processQueue(null, newAccessToken);

        // Thực thi lại request ban đầu với Access Token mới
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        memoryAccessToken = null;

        // Xóa sạch trạng thái ứng dụng và điều hướng về trang Login
        if (onAuthFailedCallback) {
          onAuthFailedCallback();
        }

        throw new ApiError(
          'Phiên làm việc đã hết hạn hoặc bị hủy. Vui lòng đăng nhập lại.',
          401,
          resData?.data || null
        );
      } finally {
        isRefreshing = false;
      }
    }

    throw new ApiError(message, status, resData?.data || null);
  }
);

// Shorthand methods
export const get = (url, config = {}) => apiClient.get(url, config);
export const post = (url, data = null, config = {}) => apiClient.post(url, data, config);
export const put = (url, data = null, config = {}) => apiClient.put(url, data, config);
export const patch = (url, data = null, config = {}) => apiClient.patch(url, data, config);
export const del = (url, config = {}) => apiClient.delete(url, config);

export default apiClient;
