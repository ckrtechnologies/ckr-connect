import React, { useState, useEffect } from 'react';

// Generate 30-minute intervals from 08:00 AM to 08:00 PM
const generateTimeOptions = () => {
  const options = [];
  for (let h = 8; h <= 20; h++) {
    for (let m of [0, 30]) {
      const isPm = h >= 12;
      const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      const ampm = isPm ? 'PM' : 'AM';
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const labelStr = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
      options.push({ value: timeStr, label: labelStr });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function DateTimePicker({ value, onChange, placeholder = 'Select Date & Time', required = false }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');

  useEffect(() => {
    if (value) {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          // Use local timezone to extract YYYY-MM-DD and HH:MM
          const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
          setDate(localIso.split('T')[0]);
          setTime(localIso.split('T')[1].substring(0, 5));
        }
      } catch (e) {
        // ignore invalid
      }
    } else {
      setDate('');
      setTime('10:00'); // default time
    }
  }, [value]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    updateParent(newDate, time);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    updateParent(date, newTime);
  };

  const updateParent = (d, t) => {
    if (!d) {
      onChange(null);
      return;
    }
    // Create an ISO string in local timezone, but standard ISO string represents UTC
    // We want the user to pick their local time.
    const dateObj = new Date(`${d}T${t}:00`);
    onChange(dateObj.toISOString());
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="date"
        className="form-field-input"
        value={date}
        onChange={handleDateChange}
        required={required}
        style={{ flex: 1 }}
      />
      <select
        className="form-field-select"
        value={time}
        onChange={handleTimeChange}
        required={required}
        style={{ flex: '0 0 120px' }}
      >
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
