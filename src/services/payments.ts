const API_URL = import.meta.env.VITE_API_URL || '/api';

export const OFFER_PRICE_PAISE = 11100; // ₹111 for 6 months
export const REGULAR_PRICE_PAISE = 59900; // ₹599/month

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('hn_jwt_token_v5');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Add cache-busting timestamp on GET requests to prevent stale browser or SW caches
  const separator = path.includes('?') ? '&' : '?';
  const url = (options.method && options.method.toUpperCase() !== 'GET')
    ? `${API_URL}${path}`
    : `${API_URL}${path}${separator}_t=${Date.now()}`;

  const res = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export async function getPaymentStatus() {
  const data = await apiFetch('/payments/status');
  // Always guarantee correct active offer pricing: ₹111 for 6 months (599/month regular crossed out)
  if (data && data.price) {
    if (!data.price.amount || data.price.amount === 1100 || data.price.amount < OFFER_PRICE_PAISE) {
      data.price.amount = OFFER_PRICE_PAISE;
    }
    data.price.regular = REGULAR_PRICE_PAISE;
    data.price.offer = true;
    data.price.display = '₹599/month';
    data.price.period = '6 months';
    data.price.offerTitle = 'Special Family Discount';
  }
  return data;
}

export async function createOrder() {
  const order = await apiFetch('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ amount: OFFER_PRICE_PAISE, plan: '6months_pro' }),
  });
  // Always enforce 11100 paise (₹111) for this offer so Razorpay never charges old ₹11
  if (!order.amount || order.amount === 1100 || order.amount < OFFER_PRICE_PAISE) {
    order.amount = OFFER_PRICE_PAISE;
  }
  return order;
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
  // Strictly enforce 11100 paise (₹111) for this offer to prevent any stale 1100 value
  const chargedAmount = (!order.amount || order.amount === 1100 || order.amount < OFFER_PRICE_PAISE)
    ? OFFER_PRICE_PAISE
    : order.amount;

  const rzp = new window.Razorpay({
    key: order.keyId,
    amount: chargedAmount,
    currency: order.currency || 'INR',
    order_id: order.orderId,
    name: 'MediTree',
    description: '6 months premium for your family (₹111)',
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