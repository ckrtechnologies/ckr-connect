/**
 * Indian Context Formatting Helpers
 * Currency ₹ with Indian digit grouping (e.g. ₹1,29,999 or ₹4.5L), Dates, Times
 */

/**
 * Format amount in INR currency with symbol
 * @param {number|string} amount
 * @param {boolean} [compact=false] If true, formats as ₹4.5L
 * @returns {string}
 */
export const formatCurrency = (amount, compact = false) => {
  const num = Number(amount) || 0;
  if (compact) {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Format ISO date string to Indian readable date (e.g., 22 Sep 2026)
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
};

/**
 * Format ISO timestamp to Indian 12-hour time (e.g., 09:28 AM)
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

/**
 * Sanitize and clean phone number for cellular dialer
 * @param {string} phone
 * @returns {string}
 */
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
};
