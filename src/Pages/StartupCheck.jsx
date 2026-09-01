import { useEffect, useState } from 'react';

const API_BASE = '/api';

export async function register(userData) {
  const response = await fetch(`${API_BASE}/auth.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'register',
      ...userData,
    }),
  });

  return response.json();
}

export async function login(userData) {
  const response = await fetch(`${API_BASE}/auth.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'login',
      ...userData,
    }),
  });

  return response.json();
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/health.php`);
  return response.json();
}

export const api = {
  register,
  login,
  healthCheck,
};

export default function StartupCheckPage() {
  const [status, setStatus] = useState('Checking API...');

  useEffect(() => {
    healthCheck()
      .then((data) => {
        setStatus(data?.success ? 'API connected' : 'API check failed');
      })
      .catch(() => {
        setStatus('API unavailable');
      });
  }, []);

  return (
    <div className="page">
      <h1>Startup Check</h1>
      <p>{status}</p>
    </div>
  );
}