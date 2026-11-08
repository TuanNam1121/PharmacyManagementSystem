import { get, put } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/profile';

function unwrap(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const profileApi = {
  getProfile: async () => {
    const res = await get(BASE_URL);
    return unwrap(res);
  },

  updateProfile: async (payload) => {
    console.log(payload);
    const res = await put(BASE_URL, payload);
    console.log(res);
    return unwrap(res);
  },
};

export default profileApi;

