import { createSlice } from '@reduxjs/toolkit';

// Authentic date calculations matching prototype/app.js lines 110-245
export function computeDatePreset(presetKey, baseDateStr = '2026-09-22') {
  const [yStr, mStr, dStr] = baseDateStr.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1; // 0-based
  const d = parseInt(dStr, 10);
  const base = new Date(y, m, d);

  const pad = (n) => String(n).padStart(2, '0');
  const toIso = (dateObj) =>
    `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;

  let startDate = baseDateStr;
  let endDate = baseDateStr;
  let label = `Today (${baseDateStr})`;
  let shortLabel = `Today (${pad(d)} Sep)`;

  switch (presetKey) {
    case 'today': {
      startDate = baseDateStr;
      endDate = baseDateStr;
      label = `Today (${pad(d)} Sep 2026)`;
      shortLabel = `Today (${pad(d)} Sep)`;
      break;
    }
    case 'yesterday': {
      const yDate = new Date(base);
      yDate.setDate(base.getDate() - 1);
      startDate = toIso(yDate);
      endDate = startDate;
      label = `Yesterday (${pad(yDate.getDate())} Sep 2026)`;
      shortLabel = `Yesterday (${pad(yDate.getDate())} Sep)`;
      break;
    }
    case 'last_7_days': {
      const start = new Date(base);
      start.setDate(base.getDate() - 6);
      startDate = toIso(start);
      endDate = baseDateStr;
      label = `Last 7 Days (${startDate} – ${endDate})`;
      shortLabel = `Last 7 Days`;
      break;
    }
    case 'this_week': {
      const dayOfWeek = base.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const mon = new Date(base);
      mon.setDate(base.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      startDate = toIso(mon);
      endDate = toIso(sun);
      label = `This Week (${startDate} – ${endDate})`;
      shortLabel = `This Week`;
      break;
    }
    case 'mtd': {
      startDate = `${y}-${pad(m + 1)}-01`;
      endDate = baseDateStr;
      label = `MTD (${startDate} – ${endDate})`;
      shortLabel = `MTD (${pad(d)} Days)`;
      break;
    }
    case 'this_month': {
      const lastDay = new Date(y, m + 1, 0).getDate();
      startDate = `${y}-${pad(m + 1)}-01`;
      endDate = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
      label = `This Month (${startDate} – ${endDate})`;
      shortLabel = `This Month`;
      break;
    }
    case 'last_month': {
      const prevMonthDate = new Date(y, m - 1, 1);
      const py = prevMonthDate.getFullYear();
      const pm = prevMonthDate.getMonth();
      const lastDay = new Date(py, pm + 1, 0).getDate();
      startDate = `${py}-${pad(pm + 1)}-01`;
      endDate = `${py}-${pad(pm + 1)}-${pad(lastDay)}`;
      label = `Last Month (${startDate} – ${endDate})`;
      shortLabel = `Last Month`;
      break;
    }
    case 'qtd': {
      const qStartMonth = Math.floor(m / 3) * 3;
      startDate = `${y}-${pad(qStartMonth + 1)}-01`;
      endDate = baseDateStr;
      const qNum = Math.floor(m / 3) + 1;
      label = `QTD (Q${qNum}: ${startDate} – ${endDate})`;
      shortLabel = `QTD (Q${qNum})`;
      break;
    }
    case 'ytd': {
      startDate = `${y}-01-01`;
      endDate = baseDateStr;
      label = `YTD (01 Jan ${y} – ${endDate})`;
      shortLabel = `YTD (${y})`;
      break;
    }
    case 'this_year': {
      startDate = `${y}-01-01`;
      endDate = `${y}-12-31`;
      label = `This Year (01 Jan ${y} – 31 Dec ${y})`;
      shortLabel = `This Year (${y})`;
      break;
    }
    case 'last_year': {
      const ly = y - 1;
      startDate = `${ly}-01-01`;
      endDate = `${ly}-12-31`;
      label = `Last Year (01 Jan ${ly} – 31 Dec ${ly})`;
      shortLabel = `Last Year (${ly})`;
      break;
    }
    case 'all': {
      startDate = '';
      endDate = '';
      label = `All Time (All Records)`;
      shortLabel = `All Time`;
      break;
    }
    default: {
      startDate = baseDateStr;
      endDate = baseDateStr;
      label = `Today (${baseDateStr})`;
      shortLabel = `Today`;
    }
  }

  return {
    preset: presetKey,
    startDate,
    endDate,
    label,
    shortLabel,
  };
}

const initialRange = computeDatePreset('today', '2026-09-22');

const dateSlice = createSlice({
  name: 'date',
  initialState: {
    selectedPreset: 'today',
    selectedDate: '2026-09-22',
    dateRange: initialRange,
    isPopoverOpen: false,
  },
  reducers: {
    setDatePreset: (state, action) => {
      const presetKey = action.payload;
      state.selectedPreset = presetKey;
      state.dateRange = computeDatePreset(presetKey, state.selectedDate);
      state.isPopoverOpen = false;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
      state.dateRange = computeDatePreset(state.selectedPreset, action.payload);
    },
    setCustomDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.selectedPreset = 'custom';
      state.dateRange = {
        preset: 'custom',
        startDate,
        endDate,
        label: `Custom (${startDate} – ${endDate})`,
        shortLabel: `${startDate} – ${endDate}`,
      };
      state.isPopoverOpen = false;
    },
    toggleDatePopover: (state) => {
      state.isPopoverOpen = !state.isPopoverOpen;
    },
    closeDatePopover: (state) => {
      state.isPopoverOpen = false;
    },
  },
});

export const {
  setDatePreset,
  setSelectedDate,
  setCustomDateRange,
  toggleDatePopover,
  closeDatePopover,
} = dateSlice.actions;

export default dateSlice.reducer;
