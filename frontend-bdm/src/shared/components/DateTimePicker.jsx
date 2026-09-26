import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';
import { shadows } from '../theme/shadows.js';
import { FluentButton } from './FluentButton.jsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const TIME_PRESETS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
];

const HOURS = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08'];
const MINUTES = ['00', '15', '30', '45'];

/**
 * Format Date to YYYY-MM-DD
 */
export const formatDateToYmd = (d) => {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format YYYY-MM-DD to friendly human display
 */
export const formatYmdToDisplay = (ymdStr) => {
  if (!ymdStr) return 'Select Date';
  const parts = ymdStr.split('-');
  if (parts.length !== 3) return ymdStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, monthIdx, day);
  if (isNaN(dateObj.getTime())) return ymdStr;

  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
  const monthName = MONTH_NAMES[monthIdx]?.slice(0, 3);
  return `${dayName}, ${day} ${monthName} ${year}`;
};

/**
 * Helper to combine date and time safely into ISO format
 */
export const combineDateAndTimeIso = (dateStr, timeStr) => {
  if (!dateStr) return undefined;
  let hours = 11;
  let minutes = 30;

  if (timeStr) {
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const match = clean.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day, hours, minutes, 0);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return dateStr;
};

/**
 * Interactive Date and Time Picker for BDM
 * Prevents typos, gives 1-tap presets and dedicated visual pickers.
 */
export const DateTimePicker = ({
  label = 'Next Follow-up Schedule *',
  dateValue: propDateValue = '',
  timeValue: propTimeValue = '11:30 AM',
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate = new Date(),
  required = false,
  containerStyle,
}) => {
  const dateValue = propDateValue || date || '';
  const timeValue = propTimeValue || time || '11:30 AM';

  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  // Parse current active calendar month/year view
  const initialDate = useMemo(() => {
    if (dateValue) {
      const [y, m, d] = dateValue.split('-').map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  }, [dateValue]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Parse time parts for time picker modal
  const initialTimeParts = useMemo(() => {
    let hour = '11';
    let minute = '30';
    let period = 'AM';
    if (timeValue) {
      const isPM = timeValue.toUpperCase().includes('PM');
      period = isPM ? 'PM' : 'AM';
      const match = timeValue.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        hour = String(match[1]).padStart(2, '0');
        minute = match[2];
      }
    }
    return { hour, minute, period };
  }, [timeValue]);

  const [selectedHour, setSelectedHour] = useState(initialTimeParts.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTimeParts.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(initialTimeParts.period);

  // Quick date presets
  const getPresetDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return formatDateToYmd(d);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar grid days for current month view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    // Empty lead slots before the 1st day of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }

    const todayStr = formatDateToYmd(new Date());

    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const ymd = `${viewYear}-${mStr}-${dStr}`;
      const isPast = ymd < todayStr;
      const isSelected = ymd === dateValue;
      const isToday = ymd === todayStr;

      days.push({
        day: d,
        ymd,
        isPast,
        isSelected,
        isToday,
        key: `day-${d}`,
      });
    }

    return days;
  }, [viewYear, viewMonth, dateValue]);

  const handleApplyTime = () => {
    const formatted = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    onTimeChange && onTimeChange(formatted);
    setTimeModalVisible(false);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>

      {/* Date & Time Selectors Row */}
      <View style={styles.triggerCard}>
        {/* Date Trigger */}
        <TouchableOpacity
          style={styles.pickerBox}
          onPress={() => {
            if (dateValue) {
              const [y, m] = dateValue.split('-').map(Number);
              if (y && m) {
                setViewYear(y);
                setViewMonth(m - 1);
              }
            }
            setCalendarModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.pickerHeaderRow}>
            <Text style={styles.pickerIcon}>📅</Text>
            <Text style={styles.pickerSubLabel}>DATE</Text>
          </View>
          <Text style={styles.pickerMainValue} numberOfLines={1}>
            {formatYmdToDisplay(dateValue)}
          </Text>
          <Text style={styles.pickerHint}>Tap to change date ›</Text>
        </TouchableOpacity>

        <View style={styles.dividerVertical} />

        {/* Time Trigger */}
        <TouchableOpacity
          style={styles.pickerBox}
          onPress={() => {
            setSelectedHour(initialTimeParts.hour);
            setSelectedMinute(initialTimeParts.minute);
            setSelectedPeriod(initialTimeParts.period);
            setTimeModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.pickerHeaderRow}>
            <Text style={styles.pickerIcon}>⏰</Text>
            <Text style={styles.pickerSubLabel}>TIME</Text>
          </View>
          <Text style={styles.pickerMainValue} numberOfLines={1}>
            {timeValue || '11:30 AM'}
          </Text>
          <Text style={styles.pickerHint}>Tap to change time ›</Text>
        </TouchableOpacity>
      </View>

      {/* 1-Tap Quick Date Presets */}
      <View style={styles.presetSection}>
        <Text style={styles.presetSectionTitle}>QUICK DATE PRESETS:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsScroll}
        >
          {[
            { label: 'Today', days: 0 },
            { label: 'Tomorrow', days: 1 },
            { label: 'In 2 Days', days: 2 },
            { label: 'In 3 Days', days: 3 },
            { label: 'Next Week', days: 7 },
          ].map((item) => {
            const pDate = getPresetDate(item.days);
            const isActive = dateValue === pDate;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.presetChip, isActive && styles.presetChipActive]}
                onPress={() => onDateChange && onDateChange(pDate)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    isActive && styles.presetChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 1-Tap Quick Time Slots */}
      <View style={styles.presetSection}>
        <Text style={styles.presetSectionTitle}>QUICK TIME SLOTS:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsScroll}
        >
          {TIME_PRESETS.map((slot) => {
            const isActive = timeValue === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.presetChip, isActive && styles.presetChipActive]}
                onPress={() => onTimeChange && onTimeChange(slot)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    isActive && styles.presetChipTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ----------------- CALENDAR PICKER MODAL ----------------- */}
      <Modal
        visible={calendarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Calendar Header with Month/Year Navigation */}
            <View style={styles.calHeader}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={styles.calNavBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.calNavBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonthYearTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.calNavBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.calNavBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((wd, i) => (
                <Text key={i} style={styles.weekdayText}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item) => {
                if (!item.day) {
                  return <View key={item.key} style={styles.dayCellEmpty} />;
                }
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.dayCell,
                      item.isToday && styles.dayCellToday,
                      item.isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => {
                      onDateChange && onDateChange(item.ymd);
                      setCalendarModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        item.isPast && styles.dayTextPast,
                        item.isToday && styles.dayTextToday,
                        item.isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Bottom Actions */}
            <View style={styles.modalFooter}>
              <FluentButton
                title="Today"
                onPress={() => {
                  onDateChange && onDateChange(formatDateToYmd(new Date()));
                  setCalendarModalVisible(false);
                }}
                variant="secondary"
                size="small"
                style={{ flex: 1 }}
              />
              <View style={{ width: spacing.sm }} />
              <FluentButton
                title="Close"
                onPress={() => setCalendarModalVisible(false)}
                variant="primary"
                size="small"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------------- TIME PICKER MODAL ----------------- */}
      <Modal
        visible={timeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeHeaderTitle}>⏰ Select Follow-up Time</Text>
              <Text style={styles.timeHeaderPreview}>
                {selectedHour}:{selectedMinute} {selectedPeriod}
              </Text>
            </View>

            {/* AM / PM Toggle */}
            <View style={styles.periodToggleRow}>
              <TouchableOpacity
                style={[
                  styles.periodToggleBtn,
                  selectedPeriod === 'AM' && styles.periodToggleBtnActive,
                ]}
                onPress={() => setSelectedPeriod('AM')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.periodToggleText,
                    selectedPeriod === 'AM' && styles.periodToggleTextActive,
                  ]}
                >
                  AM (Morning)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodToggleBtn,
                  selectedPeriod === 'PM' && styles.periodToggleBtnActive,
                ]}
                onPress={() => setSelectedPeriod('PM')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.periodToggleText,
                    selectedPeriod === 'PM' && styles.periodToggleTextActive,
                  ]}
                >
                  PM (Afternoon / Evening)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hour Selector */}
            <Text style={styles.selectorSectionTitle}>HOUR:</Text>
            <View style={styles.gridPillsWrap}>
              {HOURS.map((h) => {
                const isHActive = selectedHour === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.hourPill, isHActive && styles.hourPillActive]}
                    onPress={() => setSelectedHour(h)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.hourPillText,
                        isHActive && styles.hourPillTextActive,
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Minute Selector */}
            <Text style={styles.selectorSectionTitle}>MINUTE:</Text>
            <View style={styles.minutePillsRow}>
              {MINUTES.map((m) => {
                const isMActive = selectedMinute === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.minutePill, isMActive && styles.minutePillActive]}
                    onPress={() => setSelectedMinute(m)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.minutePillText,
                        isMActive && styles.minutePillTextActive,
                      ]}
                    >
                      :{m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Bottom Actions */}
            <View style={styles.modalFooter}>
              <FluentButton
                title="Cancel"
                onPress={() => setTimeModalVisible(false)}
                variant="secondary"
                size="medium"
                style={{ flex: 1 }}
              />
              <View style={{ width: spacing.sm }} />
              <FluentButton
                title="Set Time"
                onPress={handleApplyTime}
                variant="primary"
                size="medium"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  requiredMark: {
    color: colors.error,
  },
  triggerCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.level1,
  },
  pickerBox: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pickerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  pickerSubLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  pickerMainValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  pickerHint: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10,
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.border,
  },
  presetSection: {
    marginTop: spacing.xs + 2,
  },
  presetSectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  presetsScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presetChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  presetChipTextActive: {
    color: colors.primary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.level3,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calNavBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  calNavBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  calMonthYearTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 38,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.xs,
    marginVertical: 1,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dayTextPast: {
    color: colors.textDisabled,
    fontWeight: '400',
  },
  dayTextToday: {
    color: colors.primary,
  },
  dayTextSelected: {
    color: colors.textOnPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Time picker modal styles
  timeHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeHeaderTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  timeHeaderPreview: {
    ...typography.title,
    color: colors.primary,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  periodToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: spacing.md,
  },
  periodToggleBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  periodToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  periodToggleText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  periodToggleTextActive: {
    color: colors.textOnPrimary,
  },
  selectorSectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  gridPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  hourPill: {
    width: '23%',
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  hourPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hourPillText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  hourPillTextActive: {
    color: colors.textOnPrimary,
  },
  minutePillsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  minutePill: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  minutePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  minutePillText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  minutePillTextActive: {
    color: colors.textOnPrimary,
  },
});
