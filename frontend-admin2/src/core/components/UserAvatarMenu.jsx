import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function UserAvatarMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const name = user?.name || user?.email?.split('@')[0] || 'User';
  const role = user?.role ? user.role.toUpperCase() : 'ADMIN';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="fluent-avatar"
        style={{ cursor: 'pointer' }}
        title={`${name} (${role}) · Click for options`}
        onClick={() => setOpen(!open)}
      >
        {initials}
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '38px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-level2)',
            width: '180px',
            zIndex: 1000,
            padding: '6px 0',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>{name}</div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                marginTop: '2px',
              }}
            >
              {user?.email || 'Authenticated User'} ({role})
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              fontSize: '12px',
              color: 'var(--color-error)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
