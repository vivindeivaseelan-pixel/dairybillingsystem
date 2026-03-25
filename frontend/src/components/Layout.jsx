import { useState } from "react";

export function LoginScreen({ onLogin, error, loading }) {
  const [form, setForm] = useState({ username: "admin", password: "admin123" });

  return (
    <div className="login-shell">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-11">
            <div className="login-card overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-7 login-visual p-5">
                  <div className="glass-tag">GK Dairy Company</div>
                  <h1 className="display-4 fw-bold mt-4">Premium dairy billing, user cart operations, and full admin control in one green farm-themed workspace.</h1>
                  <p className="lead text-white-50 mt-3">Built for dairy farms, retail counters, route sales, cash collection, support handling, and daily admin automation.</p>
                  <div className="feature-grid mt-4">
                    <div className="feature-chip">Cart Billing</div>
                    <div className="feature-chip">Farm Operations</div>
                    <div className="feature-chip">Editable Invoice</div>
                    <div className="feature-chip">Admin Automation</div>
                  </div>
                </div>
                <div className="col-lg-5 bg-white p-5">
                  <h2 className="h3 fw-bold">Sign In</h2>
                  <p className="text-secondary">Open the GK Dairy professional dairy operations system.</p>
                  <form onSubmit={(event) => { event.preventDefault(); onLogin(form); }}>
                    <div className="mb-3"><label className="form-label">Username</label><input className="form-control form-control-lg premium-input" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></div>
                    <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control form-control-lg premium-input" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div>
                    {error ? <div className="alert alert-danger py-2">{error}</div> : null}
                    <button className="btn btn-success btn-lg w-100 premium-button" disabled={loading}>{loading ? "Signing in..." : "Open GK Dairy"}</button>
                  </form>
                  <div className="small text-secondary mt-3">Demo accounts: `admin/admin123` and `user/user123`</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user, view, setView, onLogout, isAdmin }) {
  const items = isAdmin
    ? [
        ["dashboard", "Dashboard"],
        ["billing", "User Billing Cart"],
        ["customers", "Users"],
        ["suppliers", "Suppliers"],
        ["products", "Products"],
        ["operations", "Operations"],
        ["payments", "Payment Checkout"],
        ["analytics", "Analytics"],
        ["support", "Support"],
        ["settings", "Admin Studio"]
      ]
    : [
        ["dashboard", "Dashboard"],
        ["billing", "Billing Cart"],
        ["payments", "Payment Checkout"],
        ["support", "Support"]
      ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-mark">GK Dairy</div>
        <div className="sidebar-subtitle">{isAdmin ? "Professional admin and farm operations" : "Professional user billing workspace"}</div>
      </div>
      <div className="profile-card glow-panel">
        <div className="profile-avatar">{user.name.slice(0, 1)}</div>
        <div>
          <div className="fw-semibold text-white">{user.name}</div>
          <div className="small text-white-50 text-capitalize">{user.role}</div>
        </div>
      </div>
      <div className="nav flex-column gap-2 mt-2">
        {items.map(([key, label]) => (
          <button key={key} className={`btn text-start nav-pill ${view === key ? "active" : ""}`} onClick={() => setView(key)}>
            {label}
          </button>
        ))}
      </div>
      <button className="btn btn-warning mt-auto premium-button" onClick={onLogout}>Logout</button>
    </aside>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
      <div>
        <h3 className="section-title">{title}</h3>
        {subtitle ? <div className="text-secondary small mt-1">{subtitle}</div> : null}
      </div>
      {action}
    </div>
  );
}
