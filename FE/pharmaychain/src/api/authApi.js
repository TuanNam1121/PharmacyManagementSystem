import { post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/auth';

function unwrap(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const authApi = {
  login: async ({ username, password }) => {
    console.log(username, password);
    const res = await post(`${BASE_URL}/login`, {
      username: username?.trim(),
      password,
    });
    console.log(res);
    return unwrap(res);
  },

  refreshToken: async () => {
    const res = await post(`${BASE_URL}/refresh-token`, {});
    return unwrap(res);
  },

  logout: async () => {
    try {
      const res = await post(`${BASE_URL}/logout`, {});
      return unwrap(res);
    } catch (err) {
      console.warn('Logout request failed or server unreachable:', err);
      return null;
    }
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const res = await post(`${BASE_URL}/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return unwrap(res);
  },

  forgotPassword: async ({ email }) => {
    const res = await post(`${BASE_URL}/forgot-password`, {
      email: email?.trim(),
    });
    return unwrap(res);
  },

  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    const res = await post(`${BASE_URL}/reset-password`, {
      token: token?.trim(),
      newPassword,
      confirmPassword,
    });
    return unwrap(res);
  },
};

export default authApi;
