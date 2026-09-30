const API_BASE = '/api'

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    const responseText = await response.text()
    throw new Error(
      `API returned non-JSON (${response.status}): ${responseText.slice(0, 150)}`
    )
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

const jsonRequest = (endpoint, body, method = 'POST') =>
  apiRequest(endpoint, {
    method,
    body: JSON.stringify(body),
  })

export const api = {
  login: (email, password) => jsonRequest('/auth.php', { type: 'login', email, password }),
  register: (name, email, password) =>
    jsonRequest('/auth.php', { type: 'register', name, email, password }),
  logout: () => jsonRequest('/auth.php', { logout: true }),
  getCurrentUser: () => apiRequest('/auth.php'),
  getProducts: () => apiRequest('/browse.php'),
  getUserProducts: (userId) => apiRequest(`/products.php?user_id=${encodeURIComponent(userId)}`),
  getProduct: (productId) => apiRequest(`/products.php?id=${encodeURIComponent(productId)}`),
  createProduct: (product) => jsonRequest('/products.php', product),
  updateProduct: (product) => jsonRequest('/products.php', product, 'PUT'),
  deleteProduct: (productId) => jsonRequest('/products.php', { product_id: productId }, 'DELETE'),
}