const API_URL = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('hn_jwt_token_v5');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export async function getPaymentStatus() {
  return apiFetch('/payments/status');
}

export async function createOrder() {
  return apiFetch('/payments/create-order', { method: 'POST' });
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return apiFetch('/payments/verify', { method: 'POST', body: JSON.stringify(data) });
}