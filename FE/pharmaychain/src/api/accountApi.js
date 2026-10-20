// API service using native fetch to interact with Spring Boot Backend

const BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Handle API responses with proper error extraction
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let errorMessage = 'Đã có lỗi xảy ra';
    if (data && data.message) {
      errorMessage = data.message;
    } else if (data && data.data && typeof data.data === 'object') {
      errorMessage = Object.values(data.data).join(', ');
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export const accountApi = {
  // Lấy danh sách tài khoản (có phân trang, tìm kiếm, lọc)
  async getAccounts({ keyword = '', status = '', roleId = '', page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
    const params = new URLSearchParams();
    if (keyword && keyword.trim()) params.append('keyword', keyword.trim());
    if (status !== '' && status !== null && status !== undefined) params.append('status', status);
    if (roleId !== '' && roleId !== null && roleId !== undefined) params.append('roleId', roleId);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);

    const response = await fetch(`${BASE_URL}/accounts?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Lấy chi tiết tài khoản theo ID
  async getAccountDetail(id) {
    const response = await fetch(`${BASE_URL}/accounts/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Tạo tài khoản mới
  async createAccount(accountData) {
    const response = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    return handleResponse(response);
  },

  // Cập nhật thông tin tài khoản
  async updateAccount(id, accountData) {
    const response = await fetch(`${BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    return handleResponse(response);
  },

  // Cập nhật trạng thái tài khoản (1: Active, 0: Inactive)
  async updateAccountStatus(id, status) {
    const response = await fetch(`${BASE_URL}/accounts/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Lấy danh sách Roles
  async getRoles() {
    const response = await fetch(`${BASE_URL}/roles`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

export default accountApi;
