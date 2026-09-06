const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    credentials: "include", // IMPORTANT: send PHP session cookie
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  // If it's a 401 (not logged in), return the JSON instead of crashing.
  if (response.status === 401) {
    return data;
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function register(userData) {
  const payload = typeof userData === "object" && userData !== null
    ? userData
    : { name: userData, email: arguments[1], password: arguments[2] };

  return request("auth.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "register",
      ...payload,
    }),
  });
}

export async function login(userData) {
  const payload = typeof userData === "object" && userData !== null
    ? userData
    : { email: userData, password: arguments[1] };

  return request("auth.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "login",
      ...payload,
    }),
  });
}

export async function logout() {
  return request("auth.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ logout: true }),
  });
}

export async function getCurrentUser() {
  try {
    const data = await request("auth.php");

    console.log("Current user response:", data);

    return data;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export async function getProducts() {
  return request("products.php");
}

export async function getUserProducts(userId) {
  return request(`products.php?user_id=${encodeURIComponent(userId)}`);
}

export async function createProduct(productData) {
  return request("products.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(productData) {
  return request("products.php", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(productId) {
  return request("products.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function healthCheck() {
  return request("health.php");
}

export const api = {
  register,
  login,
  logout,
  getCurrentUser,
  getProducts,
  getUserProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  healthCheck,
};