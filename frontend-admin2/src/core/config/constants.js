// Stage probabilities matching prototype/app.js lines 50-60
export const STAGE_PROBABILITIES = {
  new: 10,
  contacted: 25,
  follow_up: 40,
  proposal: 60,
  won: 100,
  lost: 0,
  invalid: 0,
};

export const STAGE_CONFIG = [
  { key: 'new', label: 'New', color: '#0078D4', prob: '10%' },
  { key: 'contacted', label: 'Contacted', color: '#2B88D8', prob: '25%' },
  { key: 'follow_up', label: 'Follow Up', color: '#FFB900', prob: '40%' },
  { key: 'proposal', label: 'Proposal', color: '#8764B8', prob: '60%' },
  { key: 'won', label: 'Won', color: '#107C41', prob: '100%' },
  { key: 'lost', label: 'Lost', color: '#D83B01', prob: '0%' },
  { key: 'invalid', label: 'Invalid', color: '#A19F9D', prob: '0%' },
];

export const ATTENDANCE_STATUS_LABELS = {
  present: { label: 'Present', short: 'P', class: 'status-p' },
  absent: { label: 'Absent', short: 'A', class: 'status-a' },
  half_day: { label: 'Half Day', short: 'HD', class: 'status-hd' },
  leave: { label: 'Leave', short: 'L', class: 'status-l' },
  holiday: { label: 'Holiday', short: 'H', class: 'status-h' },
  weekend: { label: 'Weekend', short: 'W', class: 'status-w' },
};
