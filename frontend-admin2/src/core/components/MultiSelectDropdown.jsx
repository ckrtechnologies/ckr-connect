import React, { useState, useRef, useEffect } from 'react';

export default function MultiSelectDropdown({ options, value, onChange, placeholder = "Select options..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const filteredOptions = search.trim()
    ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="multi-select-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-field-input" 
        style={{ minHeight: '36px', display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px 8px', cursor: 'pointer', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map(opt => (
            <span key={opt.value} style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {opt.label}
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); handleToggle(opt.value); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >&times;</button>
            </span>
          ))
        ) : (
          <span style={{ color: '#888', fontSize: '13px' }}>{placeholder}</span>
        )}
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '4px', zIndex: 1000, maxHeight: '260px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {/* Search Input */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '13px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                outline: 'none',
                background: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Options List */}
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {filteredOptions.length === 0 && (
              <div style={{ padding: '10px 12px', color: '#888', fontSize: '13px', textAlign: 'center' }}>
                {search ? 'No matching options' : 'No options available'}
              </div>
            )}
            {filteredOptions.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.05))', margin: 0, background: value.includes(opt.value) ? 'var(--color-surface-alt)' : 'transparent', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={value.includes(opt.value)}
                  onChange={() => handleToggle(opt.value)}
                  style={{ marginRight: '8px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
