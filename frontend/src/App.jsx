import React, { useEffect, useMemo, useState } from 'react'
import { signup, login, getAccounts, getAccount, deposit, withdraw } from './api'

function ShimmerRows({ rows = 3 }) {
  return (
    <div className="shimmer-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer-line" />
      ))}
    </div>
  )
}

function AuthForm({ mode, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const res = mode === 'signup'
        ? await signup({ name, email, password })
        : await login({ email, password })
      localStorage.setItem('sb_token', res.token)
      onSuccess(res.user)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      {mode === 'signup' && (
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      )}
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">{mode === 'signup' ? 'Sign up' : 'Log in'}</button>
    </form>
  )
}

function Dashboard({ user, onLogout }) {
  const [accounts, setAccounts] = useState([])
  const [selected, setSelected] = useState(null)
  const [txs, setTxs] = useState([])
  const [amount, setAmount] = useState('')
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  async function loadAccounts() {
    try {
      setLoadingAccounts(true)
      const data = await getAccounts()
      setAccounts(data)
      if (data[0]) await selectAccount(data[0].id)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingAccounts(false)
    }
  }

  async function selectAccount(id) {
    try {
      setLoadingDetails(true)
      const res = await getAccount(id)
      setSelected(res.account)
      setTxs(res.transactions)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingDetails(false)
    }
  }

  async function doDeposit(e) {
    e.preventDefault()
    if (!selected) return
    try {
      const res = await deposit(selected.id, parseFloat(amount))
      setSelected(s => ({ ...s, balance: res.balance }))
      setTxs(t => [{ id: Date.now(), type: 'deposit', amount, created_at: new Date().toISOString() }, ...t])
      setAmount('')
    } catch (err) { alert(err.message) }
  }

  async function doWithdraw(e) {
    e.preventDefault()
    if (!selected) return
    try {
      const res = await withdraw(selected.id, parseFloat(amount))
      setSelected(s => ({ ...s, balance: res.balance }))
      setTxs(t => [{ id: Date.now(), type: 'withdraw', amount, created_at: new Date().toISOString() }, ...t])
      setAmount('')
    } catch (err) { alert(err.message) }
  }

  useEffect(() => { loadAccounts() }, [])

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0),
    [accounts]
  )

  return (
    <div className="dashboard">
      <div className="sidebar glass">
        <div className="sidebar-head">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h3>{user.name}</h3>
          </div>
          <button className="ghost" onClick={() => { localStorage.removeItem('sb_token'); onLogout(); }}>
            Logout
          </button>
        </div>

        <div className="stat-card">
          <p className="eyebrow">Total balance</p>
          <h2>${totalBalance.toFixed(2)}</h2>
          <p className="muted">Across {accounts.length || 0} accounts</p>
        </div>

        <div className="list-head">
          <h4>Accounts</h4>
          <span className="muted">Tap to switch</span>
        </div>
        <ul className="account-list">
          {loadingAccounts ? (
            <ShimmerRows rows={4} />
          ) : accounts.length === 0 ? (
            <p className="muted">No accounts yet</p>
          ) : (
            accounts.map(a => (
              <li
                key={a.id}
                className={selected && selected.id === a.id ? 'active' : ''}
                onClick={() => selectAccount(a.id)}
              >
                <div>
                  <strong>{a.name}</strong>
                  <div className="muted">Balance: ${parseFloat(a.balance).toFixed(2)}</div>
                </div>
                <span className="pill">#{a.id}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="main glass">
        {!selected && !loadingDetails && <p className="muted">Select an account</p>}
        {loadingDetails ? (
          <div className="detail-skeleton">
            <ShimmerRows rows={2} />
            <div className="shimmer-block" />
            <ShimmerRows rows={5} />
          </div>
        ) : selected ? (
          <>
            <div className="header-row">
              <div>
                <p className="eyebrow">Account</p>
                <h2>{selected.name}</h2>
                <p className="muted">ID #{selected.id}</p>
              </div>
              <div className="balance-card">
                <p className="eyebrow">Balance</p>
                <h1>${parseFloat(selected.balance).toFixed(2)}</h1>
              </div>
            </div>

            <form onSubmit={doDeposit} className="tx-form">
              <input
                placeholder="Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                type="number"
                step="0.01"
              />
              <button type="submit" className="primary">Deposit</button>
              <button type="button" className="outline" onClick={doWithdraw}>Withdraw</button>
            </form>

            <div className="transactions">
              <div className="list-head">
                <h4>Recent transactions</h4>
                <span className="muted">{txs.length} records</span>
              </div>
              <ul className="tx-list">
                {txs.map(tx => (
                  <li key={tx.id}>
                    <div className="tx-icon" data-type={tx.type}>
                      {tx.type === 'deposit' ? '⬆' : '⬇'}
                    </div>
                    <div className="tx-meta">
                      <strong className="tx-type">{tx.type}</strong>
                      <small className="muted">{new Date(tx.created_at).toLocaleString()}</small>
                    </div>
                    <span className="tx-amount" data-type={tx.type}>
                      {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('login') // login | signup | dashboard
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('sb_token')
    if (token) {
      // we have a token — attempt to fetch accounts to verify token, but leave it simple: switch to dashboard
      setView('dashboard')
      // optionally fetch user details via token in a real app
    }
  }, [])

  function onAuthSuccess(u) {
    setUser(u)
    setView('dashboard')
  }

  function onLogout() {
    setUser(null)
    setView('login')
  }

  return (
    <div className="app">
      <div className="hero-circle one" />
      <div className="hero-circle two" />
      <div className="hero-circle three" />
      <header><h1>Simple Bank</h1></header>

      {view !== 'dashboard' && (
        <div className="auth-switch">
          <button onClick={() => setView('login')} className={view==='login' ? 'active': ''}>Login</button>
          <button onClick={() => setView('signup')} className={view==='signup' ? 'active': ''}>Sign up</button>
        </div>
      )}

      <main>
        {view === 'login' && <AuthForm mode="login" onSuccess={onAuthSuccess} />}
        {view === 'signup' && <AuthForm mode="signup" onSuccess={onAuthSuccess} />}
        {view === 'dashboard' && <Dashboard user={user} onLogout={onLogout} />}
      </main>

      <footer><small>Demo banking app — do not use in production</small></footer>
    </div>
  )
}
