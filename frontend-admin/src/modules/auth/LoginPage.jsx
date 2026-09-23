import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext.jsx';
import { toast } from '../../core/components/Toast.jsx';
import { ArrowRight, AlertCircle, Zap, Phone, Users, ShieldCheck, Key } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('chandan@ckrtechnologies.in');
  const [password, setPassword] = useState('password@1');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillAdmin = () => {
    setEmail('chandan@ckrtechnologies.in');
    setPassword('password@1');
    setError(null);
  };

  return (
    <div className="auth-fullscreen-container">
      {/* Left Hero Panel with Branding & Core Capabilities (Prototype Screen A-01) */}
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

      {/* Right Sign-In Panel (Prototype Screen A-01) */}
      <div className="auth-form-panel">
        <div className="auth-card-box">
          <div>
            <span
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.6px',
                display: 'inline-block',
                marginBottom: '10px',
              }}
            >
              INTERNAL ACCESS
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
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
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="fluent-label">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ckrtechnologies.in"
                className="fluent-input"
                style={{ height: '36px' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="fluent-label" style={{ margin: 0 }}>Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Password reset instructions sent to administrator email');
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
                className="fluent-input"
                style={{ height: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <input
                type="checkbox"
                id="auth-remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
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
                marginTop: '4px',
              }}
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in to CKR Connect'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="auth-demo-pill">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Admin Credentials:</span>
              <button
                type="button"
                onClick={autofillAdmin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Auto-fill
              </button>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '11px' }}>
              chandan@ckrtechnologies.in / password@1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
