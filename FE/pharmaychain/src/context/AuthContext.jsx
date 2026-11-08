import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import authApi from '../api/authApi';
import { setAuthToken, setOnTokenRefreshed, setOnAuthFailed } from '../api/FetchData';

export const AuthContext = createContext(null);

const USER_KEY = 'pms_user';

export function AuthProvider({ children }) {
  // Access Token được lưu trữ trực tiếp trong Context (In-Memory)
  const [token, setToken] = useState(null);

  // Khởi tạo user từ sessionStorage để render nhanh trong phiên
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Trạng thái kiểm tra phiên ban đầu (silent refresh on app load)
  const [isLoading, setIsLoading] = useState(true);

  // Đăng ký callbacks với Axios Interceptors để đồng bộ token khi refresh tự động
  useEffect(() => {
    setOnTokenRefreshed((newToken, newUser) => {
      setToken(newToken);
      setAuthToken(newToken);
      if (newUser) {
        setUser(newUser);
        sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
      }
    });

    setOnAuthFailed(() => {
      setToken(null);
      setAuthToken(null);
      setUser(null);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem('pms_selected_store_id');
    });
  }, []);

  // Khi tải ứng dụng lần đầu: kiểm tra HttpOnly Cookie qua /refresh-token
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const data = await authApi.refreshToken();
        if (isMounted && data?.accessToken) {
          setToken(data.accessToken);
          setAuthToken(data.accessToken);
          if (data.user) {
            setUser(data.user);
            sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }
        }
      } catch {
        // Chưa đăng nhập hoặc cookie hết hạn -> chuyển về unauthenticated
        if (isMounted) {
          setToken(null);
          setAuthToken(null);
          setUser(null);
          sessionStorage.removeItem(USER_KEY);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ username, password }) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ username, password });
      const accessToken = data.accessToken;
      const userData = data.user;

      // Lưu Access Token vào Context (In-Memory) và Axios Interceptor
      setToken(accessToken);
      setAuthToken(accessToken);

      // Lưu User Profile vào memory & sessionStorage
      setUser(userData);
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));

      // Xóa các key legacy cũ nếu có
      localStorage.removeItem('pms_token');
      sessionStorage.removeItem('pms_token');

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Đăng nhập thất bại' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setToken(null);
      setAuthToken(null);
      setUser(null);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem('pms_token');
      sessionStorage.removeItem('pms_token');
      localStorage.removeItem('pms_user');
      localStorage.removeItem('pms_selected_store_id');
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
