const API_BASE = '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const qs = query.toString();
    return request(`/browse.php${qs ? `?${qs}` : ''}`);
  },

  getProduct: (id) => request(`/products.php?id=${id}`),

  getUserProducts: (userId) => request(`/products.php?user_id=${userId}`),

  createProduct: (data) => request('/products.php', {
    method: 'POST',
    body: data,
  }),

  updateProduct: (data) => request('/products.php', {
    method: 'PUT',
    body: data,
  }),

  deleteProduct: (productId) => request('/products.php', {
    method: 'DELETE',
    body: { product_id: productId },
  }),

  login: (email, password) => request('/auth.php?type=login', {
    method: 'POST',
    body: { email, password },
  }),

  register: (name, email, password) => request('/auth.php?type=register', {
    method: 'POST',
    body: { name, email, password },
  }),

  getCurrentUser: () => request('/auth.php'),

  getUserProfile: () => request('/user.php'),

  logout: () => request('/auth.php', {
    method: 'POST',
    body: { logout: true },
  }),
};
