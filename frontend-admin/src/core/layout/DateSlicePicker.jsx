import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setDatePreset,
  setCustomDateRange,
  toggleDatePopover,
  closeDatePopover,
} from '../store/slices/dateSlice.js';

export default function DateSlicePicker() {
  const dispatch = useDispatch();
  const { selectedPreset, dateRange, isPopoverOpen } = useSelector((state) => state.date);

  const [startInput, setStartInput] = useState(dateRange?.startDate || '2026-09-01');
  const [endInput, setEndInput] = useState(dateRange?.endDate || '2026-09-22');

  // Quick preset shortcuts in header bar
  const mainPresets = [
    { key: 'today', label: 'Today', title: 'Today: 22 Sep 2026' },
    { key: 'mtd', label: 'MTD', title: 'Month to Date: 01 Sep – 22 Sep 2026' },
    { key: 'this_month', label: 'This Month', title: 'This Month: 01 Sep – 30 Sep 2026' },
    { key: 'last_month', label: 'Last Month', title: 'Last Month: 01 Aug – 31 Aug 2026' },
    { key: 'ytd', label: 'YTD', title: 'Year to Date: 01 Jan – 22 Sep 2026' },
    { key: 'this_year', label: 'This Year', title: 'This Year: 01 Jan – 31 Dec 2026' },
  ];

  const handleApplyCustom = () => {
    let s = startInput;
    let e = endInput;
    if (s && e && s > e) {
      const temp = s;
      s = e;
      e = temp;
    }
    dispatch(setCustomDateRange({ startDate: s, endDate: e }));
  };

  const setQuickOffset = (days) => {
    const base = new Date('2026-09-22T00:00:00');
    const start = new Date(base);
    start.setDate(base.getDate() - (days - 1));
    const pad = (n) => String(n).padStart(2, '0');
    const startIso = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const endIso = '2026-09-22';
    setStartInput(startIso);
    setEndInput(endIso);
  };

  return (
    <div
      className="topbar-date-slice-container"
      id="topbar-date-slice-container"
      title="Global Platform Date Range (RTK Date Slice)"
      style={{ position: 'relative' }}
    >
      {/* Primary Date Range Dropdown Trigger */}
      <button
        type="button"
        className={`topbar-date-range-trigger ${isPopoverOpen ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          dispatch(toggleDatePopover());
        }}
        title="Click to view all Date Presets & Custom Range Picker"
      >
        <span className="topbar-date-icon">📅</span>
        <span className="topbar-date-range-text">
          {dateRange?.shortLabel || dateRange?.label || 'Today (22 Sep)'}
        </span>
        <svg
          className="topbar-date-chevron"
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{ transform: isPopoverOpen ? 'rotate(180deg)' : 'none' }}
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </button>

      {/* Quick 1-Click Business Presets Strip */}
      <div className="topbar-date-presets">
        {mainPresets.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`topbar-preset-btn ${selectedPreset === p.key ? 'active' : ''}`}
            onClick={() => dispatch(setDatePreset(p.key))}
            title={p.title}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          className={`topbar-preset-btn ${selectedPreset === 'custom' || isPopoverOpen ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleDatePopover());
          }}
          title="Custom Date Range & More Presets"
        >
          Custom ▾
        </button>
      </div>

      {/* Date Range Popover Panel */}
      {isPopoverOpen && (
        <div
          className="date-range-popover"
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0 }}
        >
          <div className="drp-header">
            <div className="drp-header-title">
              <span style={{ fontSize: '15px' }}>📅</span>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Date Range & Business Presets
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-primary)',
                    fontWeight: 500,
                  }}
                >
                  Active: {dateRange?.label || 'Today'}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="drp-close-btn"
              onClick={() => dispatch(closeDatePopover())}
              title="Close popover"
            >
              ✕
            </button>
          </div>

          <div className="drp-body">
            {/* Presets Column */}
            <div className="drp-presets-col">
              <div className="drp-group-title">DAYS</div>
              <div className="drp-preset-list">
                {[
                  { key: 'today', label: 'Today', sub: '22 Sep' },
                  { key: 'yesterday', label: 'Yesterday', sub: '21 Sep' },
                  { key: 'last_7_days', label: 'Last 7 Days', sub: '16–22 Sep' },
                  { key: 'this_week', label: 'This Week', sub: '21–27 Sep' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`drp-preset-item ${selectedPreset === item.key ? 'active' : ''}`}
                    onClick={() => dispatch(setDatePreset(item.key))}
                  >
                    <span>{item.label}</span>
                    <span className="drp-preset-sub">{item.sub}</span>
                  </button>
                ))}
              </div>

              <div className="drp-group-title" style={{ marginTop: '10px' }}>
                MONTHS
              </div>
              <div className="drp-preset-list">
                {[
                  { key: 'mtd', label: 'MTD (Month to Date)', sub: '01–22 Sep' },
                  { key: 'this_month', label: 'This Month', sub: 'Sep 2026' },
                  { key: 'last_month', label: 'Last Month', sub: 'Aug 2026' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`drp-preset-item ${selectedPreset === item.key ? 'active' : ''}`}
                    onClick={() => dispatch(setDatePreset(item.key))}
                  >
                    <span>{item.label}</span>
                    <span className="drp-preset-sub">{item.sub}</span>
                  </button>
                ))}
              </div>

              <div className="drp-group-title" style={{ marginTop: '10px' }}>
                QUARTERS & YEARS
              </div>
              <div className="drp-preset-list">
                {[
                  { key: 'qtd', label: 'QTD (Quarter to Date)', sub: 'Q3 · Jul–Sep' },
                  { key: 'ytd', label: 'YTD (Year to Date)', sub: '01 Jan–22 Sep' },
                  { key: 'this_year', label: 'This Year', sub: '2026' },
                  { key: 'last_year', label: 'Last Year', sub: '2025' },
                  { key: 'all', label: 'All Time', sub: 'All records' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`drp-preset-item ${selectedPreset === item.key ? 'active' : ''}`}
                    onClick={() => dispatch(setDatePreset(item.key))}
                  >
                    <span>{item.label}</span>
                    <span className="drp-preset-sub">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Column */}
            <div className="drp-custom-col">
              <div className="drp-group-title">CUSTOM DATE RANGE</div>
              <div className="drp-custom-form">
                <div className="drp-input-row">
                  <label className="drp-label">Start Date</label>
                  <input
                    type="date"
                    className="drp-input"
                    value={startInput}
                    onChange={(e) => setStartInput(e.target.value)}
                  />
                </div>
                <div className="drp-input-row">
                  <label className="drp-label">End Date</label>
                  <input
                    type="date"
                    className="drp-input"
                    value={endInput}
                    onChange={(e) => setEndInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="drp-quick-offsets">
                <span className="drp-offset-title">Quick Offsets</span>
                <div className="drp-offset-buttons">
                  <button type="button" className="drp-offset-btn" onClick={() => setQuickOffset(14)}>
                    Last 14 Days
                  </button>
                  <button type="button" className="drp-offset-btn" onClick={() => setQuickOffset(30)}>
                    Last 30 Days
                  </button>
                  <button type="button" className="drp-offset-btn" onClick={() => setQuickOffset(60)}>
                    Last 60 Days
                  </button>
                  <button type="button" className="drp-offset-btn" onClick={() => setQuickOffset(90)}>
                    Last 90 Days
                  </button>
                </div>
              </div>

              <div className="drp-preview-box">
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  Selected Span:
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginTop: '2px',
                  }}
                >
                  {startInput} – {endInput}
                </div>
              </div>

              <div className="drp-actions-row">
                <button
                  type="button"
                  className="fluent-btn fluent-btn-secondary"
                  style={{ height: '30px', fontSize: '11px' }}
                  onClick={() => dispatch(setDatePreset('today'))}
                >
                  Reset Today
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="fluent-btn fluent-btn-secondary"
                    style={{ height: '30px', fontSize: '11px' }}
                    onClick={() => dispatch(closeDatePopover())}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="fluent-btn fluent-btn-primary"
                    style={{ height: '30px', fontSize: '11px', fontWeight: 600 }}
                    onClick={handleApplyCustom}
                  >
                    Apply Range ✓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
