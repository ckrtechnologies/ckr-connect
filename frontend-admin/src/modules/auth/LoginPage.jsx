import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext.jsx';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('chandan@ckrtechnologies.in');
  const [password, setPassword] = useState('password@1');
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

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#181818',
        fontFamily: 'var(--font-family)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-level4)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            padding: '24px 28px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: 'var(--color-primary)',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
            }}
          >
            C
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '0.3px' }}>
              CKR CONNECT
            </h2>
            <p style={{ fontSize: '12px', opacity: 0.85 }}>Operations & Sales Intelligence</p>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Sign in to Admin Sales Hub
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Enter your enterprise administrator credentials
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
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="fluent-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="var(--color-text-secondary)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ckrtechnologies.in"
                  className="fluent-input"
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div>
              <label className="fluent-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--color-text-secondary)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="fluent-input"
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="fluent-btn fluent-btn-primary"
              style={{
                height: '38px',
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <ShieldCheck size={14} color="var(--color-primary)" />
            <span>Secured via CKR Connect Enterprise RBAC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
