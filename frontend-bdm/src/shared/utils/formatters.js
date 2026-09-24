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

/**
 * Format Date to standard Indian format (e.g. 24 Sep 2026)
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
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
  if (!dateInput) return '--:--';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
