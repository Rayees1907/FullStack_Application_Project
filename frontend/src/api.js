const API = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function authHeaders() {
  const token = localStorage.getItem('sb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res, fallback) {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export async function signup({ name, email, password }) {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Signup failed'));
  return res.json();
}

export async function login({ email, password }) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Login failed'));
  return res.json();
}

export async function getAccounts() {
  const res = await fetch(`${API}/accounts`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch accounts'));
  return res.json();
}

export async function getAccount(id) {
  const res = await fetch(`${API}/accounts/${id}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch account'));
  return res.json();
}

export async function deposit(account_id, amount) {
  const res = await fetch(`${API}/transactions/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ account_id, amount }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Deposit failed'));
  return res.json();
}

export async function withdraw(account_id, amount) {
  const res = await fetch(`${API}/transactions/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ account_id, amount }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Withdraw failed'));
  return res.json();
}
