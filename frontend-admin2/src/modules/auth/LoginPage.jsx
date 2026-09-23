import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext.jsx';
import { toast } from '../../core/components/Toast.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email.trim(), password);
      toast.success('Signed in successfully');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen-container">
      {/* Left Hero Panel with Branding & Core Capabilities (Approved Prototype Screen A-01) */}
      <div className="auth-hero-panel">
        <div className="auth-hero-branding">
          <span className="auth-hero-badge">CKR CONNECT ENTERPRISE</span>
          <div className="auth-hero-title">CKR Connect</div>
          <div className="auth-hero-subtitle">
            Unified sales intelligence, daily calling activity ledger, and multi-tier staff governance built for high-velocity operations.
          </div>
        </div>

        <div className="auth-hero-features">
          <div className="auth-feature-row">
            <div className="auth-feature-icon">⚡</div>
            <div className="auth-feature-text">
              <strong>Real-Time Pipeline Waterfall</strong>
              <span>Instant conversion tracking with RTK-backed date slice filtering.</span>
            </div>
          </div>
          <div className="auth-feature-row">
            <div className="auth-feature-icon">📞</div>
            <div className="auth-feature-text">
              <strong>Daily Calling Ledger</strong>
              <span>Chronological interaction audit across Voice, WhatsApp, Demos & Site Visits.</span>
            </div>
          </div>
          <div className="auth-feature-row">
            <div className="auth-feature-icon">👥</div>
            <div className="auth-feature-text">
              <strong>Full BDM Staff Governance</strong>
              <span>Complete staff CRUD with intelligent automated lead reassignment.</span>
            </div>
          </div>
          <div className="auth-feature-row">
            <div className="auth-feature-icon">🛡️</div>
            <div className="auth-feature-text">
              <strong>Attendance & Audit Compliance</strong>
              <span>Geofenced punch controls, daily work-hour calculation and audit trails.</span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <span>CKR Connect v0.1 · Operations & Sales Intelligence · Internal Portal</span>
        </div>
      </div>

      {/* Right Sign-In Panel (Approved Prototype Screen A-01) */}
      <div className="auth-form-panel">
        <div className="auth-card-box">
          <div>
            <span className="proto-brand-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>
              INTERNAL ACCESS
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
              Sign in
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Enter your enterprise credentials to access CKR Connect
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid rgba(164, 38, 44, 0.2)',
                borderRadius: 'var(--radius-xs)',
                padding: '10px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-field-group">
              <label className="form-field-label">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter work email"
                className="form-field-input"
              />
            </div>

            <div className="form-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-field-label">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Contact system administrator for password reset assistance');
                  }}
                  style={{ fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-field-input"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <input
                type="checkbox"
                id="auth-remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="auth-remember-me" style={{ cursor: 'pointer' }}>
                Keep me signed in on this workstation
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="fluent-btn fluent-btn-primary"
              style={{
                height: '40px',
                fontSize: '13px',
                fontWeight: 600,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in to CKR Connect'}</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
              </svg>
            </button>
          </form>

          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            <span>🛡️ Secured by CKR Cloud Infrastructure</span>
            <span>·</span>
            <span>256-bit TLS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
