/**
 * Format Indian Currency (₹)
 * Example: 450000 -> ₹4,50,000
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Format Lakhs shorthand (₹ Lakhs)
 * Example: 450000 -> ₹4.5L
 */
export const formatLakhs = (amount, decimals = 1) => {
  const num = Number(amount) || 0;
  const inLakhs = num / 100000;
  return `₹${inLakhs.toFixed(decimals)}L`;
};

const parseDateSafe = (input) => {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  let str = String(input).trim();
  if (str.includes(' ') && !str.includes('T')) {
    str = str.replace(' ', 'T');
  }
  // Postgres timestamptz like "2026-09-26T10:00:00+00" needs "+00:00" for valid ISO
  str = str.replace(/(:\d{2}[+-]\d{2})$/, (m) => m + ':00');
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format Date to standard Indian format (e.g. 24 Sep 2026)
 */
export const formatDate = (dateInput) => {
  const d = parseDateSafe(dateInput);
  if (!d) return dateInput ? String(dateInput) : 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format Time (e.g. 09:30 AM)
 */
export const formatTime = (dateInput) => {
  const d = parseDateSafe(dateInput);
  if (!d) return '--:--';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format Date & Time combined (e.g. 24 Sep 2026, 11:30 AM)
 */
export const formatDateTime = (dateInput) => {
  const d = parseDateSafe(dateInput);
  if (!d) return dateInput ? String(dateInput) : 'N/A';
  // If time is midnight 00:00, show only date
  const hours = d.getHours();
  const minutes = d.getMinutes();
  if (hours === 0 && minutes === 0) {
    return formatDate(d);
  }
  return `${formatDate(d)}, ${formatTime(d)}`;
};
