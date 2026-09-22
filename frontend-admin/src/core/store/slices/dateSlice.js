import { createSlice } from '@reduxjs/toolkit';

const todayStr = new Date().toISOString().slice(0, 10);

const dateSlice = createSlice({
  name: 'date',
  initialState: {
    selectedPreset: 'mtd',
    selectedDate: todayStr,
  },
  reducers: {
    setDatePreset: (state, action) => {
      state.selectedPreset = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
});

export const { setDatePreset, setSelectedDate } = dateSlice.actions;
export default dateSlice.reducer;
