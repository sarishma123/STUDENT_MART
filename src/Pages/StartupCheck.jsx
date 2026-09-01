const API_BASE = "/api";

export async function register(userData) {
  const response = await fetch(`${API_BASE}/auth.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "register",
      ...userData,
    }),
  });

  return response.json();
}

export async function login(userData) {
  const response = await fetch(`${API_BASE}/auth.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "login",
      ...userData,
    }),
  });

  return response.json();
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/health.php`);

  return response.json();
}

// 👇 This is what StartupCheck imports.
export const api = {
  register,
  login,
  healthCheck,
};