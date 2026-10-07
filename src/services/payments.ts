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

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  order: { orderId: string; amount: number; currency: string; keyId: string },
  user: { name: string; email: string },
  onSuccess: (resp: any) => void
) {
  await loadRazorpayScript();
  const rzp = new window.Razorpay({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: 'MediTree',
    description: '6 months premium for your family',
    prefill: { name: user.name, email: user.email },
    theme: { color: '#0F5C5C' },
    config: {
      display: {
        blocks: {
          upi: {
            name: 'Pay with UPI',
            instruments: [{ method: 'upi' }],
          },
        },
        sequence: ['block.upi'],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
    handler: onSuccess,
  });
  rzp.open();
}