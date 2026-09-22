// CKR Internal CRM — Prototype Application Logic & Screen Renderers
// Built per PROTOTYPE.md, DESIGN.md, SCREEN-MAP.md, and PRD.md

class CkrCrmApp {
  constructor() {
    this.state = {
      platform: 'admin', // 'admin' or 'bdm'
      currentScreen: 'A-03', // default starting screen (Admin Lead List)
      panelSide: 'right', // 'right' (authentic Dynamics) vs 'left' (house drawer)
      unhappyState: 'normal', // 'normal', 'skeleton', 'empty', 'error'
      sitemapCollapsed: false,
      selectedLeadIds: new Set(),
      leads: JSON.parse(JSON.stringify(MOCK_DATA.leads)),
      accounts: JSON.parse(JSON.stringify(MOCK_DATA.accounts)),
      users: JSON.parse(JSON.stringify(MOCK_DATA.users)),
      tags: JSON.parse(JSON.stringify(MOCK_DATA.tags)),
      interactions: JSON.parse(JSON.stringify(MOCK_DATA.lead_interactions)),
      attendance: JSON.parse(JSON.stringify(MOCK_DATA.attendance)),
      holidays: JSON.parse(JSON.stringify(MOCK_DATA.holidays)),
      notifications: JSON.parse(JSON.stringify(MOCK_DATA.notifications)),
      activeLeadId: 'lead-101',
      activeAccountId: 'acc-01',
      formTab: 'summary',
      bdmDashboardTab: 'today', // 'today', 'funnel', 'performance'
      bdmSearchQuery: '',
      bdmFilterUrgency: 'all', // 'all', 'overdue', 'today', 'won'
      bdmFilterStage: 'all', // 'all', 'NEW', 'CONTACTED', 'FOLLOW_UP', 'PROPOSAL'
      quickCreateOpen: false,
      quickCreateType: 'lead', // 'lead' or 'staff'
      oneTimePasswordModal: null, // { employee_id, password }
      onboardingSlide: 0,
      searchQuery: '',
      attendanceFilterMonth: '2026-09',
      toastMessage: null,
      bdmPunchedIn: true,
      lastPunchTime: '09:28 AM',
      wonModalLeadId: null,
      dropoffModalData: null,
      selectedDate: '2026-09-22',
      globalDate: '2026-09-22',
      datePreset: 'today',
      dateRange: {
        preset: 'today',
        startDate: '2026-09-22',
        endDate: '2026-09-22',
        label: 'Today (22 Sep 2026)',
        shortLabel: 'Today (22 Sep)'
      },
      datePickerPopoverOpen: false,
      customStartDateInput: '2026-09-01',
      customEndDateInput: '2026-09-22',
      activeLeadFilter: null,
      interactionChannelFilter: 'all',
      interactionBdmFilter: 'all',
      interactionSearchQuery: '',
      leadBdmFilter: '',
      leadStatusFilter: '',
      staffModalOpen: false,
      staffModalMode: 'create', // 'create' or 'edit'
      staffEditingId: null,
      staffDeactivateModalOpen: false,
      staffDeactivateTargetId: null,
      staffFilterStatus: 'all',
      staffSearchQuery: '',
      userMenuOpen: false
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================
  // DATE RANGE & BUSINESS PRESET UTILITIES
  // ==========================================================
  formatDateReadable(isoStr) {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${parts[2]} ${months[monthIdx] || parts[1]} ${parts[0]}`;
  }

  formatRangeSpan(start, end) {
    if (!start && !end) return 'All available records across all dates';
    if (start && end && start === end) return `1 Day (${this.formatDateReadable(start)})`;
    if (start && end) {
      const d1 = new Date(start + 'T00:00:00');
      const d2 = new Date(end + 'T00:00:00');
      const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      return `${diffDays} Days (${this.formatDateReadable(start)} – ${this.formatDateReadable(end)})`;
    }
    if (start) return `From ${this.formatDateReadable(start)}`;
    if (end) return `Up to ${this.formatDateReadable(end)}`;
    return 'All Records';
  }

  computeDatePreset(presetKey, baseDateStr = '2026-09-22') {
    const base = new Date(baseDateStr + 'T00:00:00');
    const y = base.getFullYear();
    const m = base.getMonth(); // 0-indexed (8 is Sep)
    const d = base.getDate(); // 22

    const pad = (n) => String(n).padStart(2, '0');
    const toIso = (dateObj) => `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;

    let startDate = baseDateStr;
    let endDate = baseDateStr;
    let label = `Today (${this.formatDateReadable(baseDateStr)})`;
    let shortLabel = `Today (${pad(d)} Sep)`;

    switch (presetKey) {
      case 'today': {
        startDate = baseDateStr;
        endDate = baseDateStr;
        label = `Today (${this.formatDateReadable(baseDateStr)})`;
        shortLabel = `Today (${pad(d)} Sep)`;
        break;
      }
      case 'yesterday': {
        const yDate = new Date(base);
        yDate.setDate(base.getDate() - 1);
        startDate = toIso(yDate);
        endDate = startDate;
        label = `Yesterday (${this.formatDateReadable(startDate)})`;
        shortLabel = `Yesterday (${pad(yDate.getDate())} Sep)`;
        break;
      }
      case 'last_7_days': {
        const start = new Date(base);
        start.setDate(base.getDate() - 6);
        startDate = toIso(start);
        endDate = baseDateStr;
        label = `Last 7 Days (${this.formatDateReadable(startDate)} – ${this.formatDateReadable(endDate)})`;
        shortLabel = `Last 7 Days`;
        break;
      }
      case 'this_week': {
        const dayOfWeek = base.getDay(); // 0 is Sun, 1 is Mon...
        const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const mon = new Date(base);
        mon.setDate(base.getDate() + diffToMon);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        startDate = toIso(mon);
        endDate = toIso(sun);
        label = `This Week (${this.formatDateReadable(startDate)} – ${this.formatDateReadable(endDate)})`;
        shortLabel = `This Week`;
        break;
      }
      case 'mtd': {
        startDate = `${y}-${pad(m + 1)}-01`;
        endDate = baseDateStr;
        label = `MTD (${this.formatDateReadable(startDate)} – ${this.formatDateReadable(endDate)})`;
        shortLabel = `MTD (${pad(d)} Days)`;
        break;
      }
      case 'this_month': {
        const lastDay = new Date(y, m + 1, 0).getDate();
        startDate = `${y}-${pad(m + 1)}-01`;
        endDate = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
        label = `This Month (${this.formatDateReadable(startDate)} – ${this.formatDateReadable(endDate)})`;
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
        label = `Last Month (${this.formatDateReadable(startDate)} – ${this.formatDateReadable(endDate)})`;
        shortLabel = `Last Month`;
        break;
      }
      case 'qtd': {
        const qStartMonth = Math.floor(m / 3) * 3;
        startDate = `${y}-${pad(qStartMonth + 1)}-01`;
        endDate = baseDateStr;
        const qNum = Math.floor(m / 3) + 1;
        label = `QTD (Q${qNum}: ${this.formatDateReadable(startDate)} – ${this.formatDateReadable(endDate)})`;
        shortLabel = `QTD (Q${qNum})`;
        break;
      }
      case 'ytd': {
        startDate = `${y}-01-01`;
        endDate = baseDateStr;
        label = `YTD (01 Jan ${y} – ${this.formatDateReadable(endDate)})`;
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
        label = `Today (${this.formatDateReadable(baseDateStr)})`;
        shortLabel = `Today`;
      }
    }

    return {
      preset: presetKey,
      startDate,
      endDate,
      label,
      shortLabel
    };
  }

  getDateRange() {
    if (!this.state.dateRange) {
      this.state.dateRange = this.computeDatePreset(this.state.datePreset || 'today', this.state.globalDate || '2026-09-22');
    }
    return this.state.dateRange;
  }

  selectDatePreset(presetKey) {
    const range = this.computeDatePreset(presetKey, this.state.globalDate || '2026-09-22');
    this.state.datePreset = presetKey;
    this.state.dateRange = range;
    this.state.selectedDate = range.endDate || range.startDate || '2026-09-22';
    this.state.datePickerPopoverOpen = false;
    this.state.customStartDateInput = range.startDate;
    this.state.customEndDateInput = range.endDate;

    // Synchronize top debug bar
    const protoPicker = document.getElementById('proto-date-picker');
    if (protoPicker && range.endDate) protoPicker.value = range.endDate;
    const protoRangeSelect = document.getElementById('proto-range-select');
    if (protoRangeSelect) protoRangeSelect.value = presetKey;

    this.showToast(`Date Range: Set to ${range.label}`);
    this.render();
  }

  applyCustomDateRange(startDate, endDate) {
    if (!startDate && !endDate) {
      this.selectDatePreset('all');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
    }

    const label = `Custom (${this.formatDateReadable(startDate)} – ${this.formatDateReadable(endDate)})`;
    const shortLabel = `${startDate} – ${endDate}`;

    this.state.datePreset = 'custom';
    this.state.dateRange = {
      preset: 'custom',
      startDate,
      endDate,
      label,
      shortLabel
    };
    this.state.selectedDate = endDate || startDate || '2026-09-22';
    this.state.datePickerPopoverOpen = false;
    this.state.customStartDateInput = startDate;
    this.state.customEndDateInput = endDate;

    const protoPicker = document.getElementById('proto-date-picker');
    if (protoPicker && endDate) protoPicker.value = endDate;

    this.showToast(`Date Range: Applied ${label}`);
    this.render();
  }

  applyCustomRangeFromInputs() {
    const startEl = document.getElementById('drp-input-start');
    const endEl = document.getElementById('drp-input-end');
    const start = startEl ? startEl.value : this.state.customStartDateInput;
    const end = endEl ? endEl.value : this.state.customEndDateInput;
    this.applyCustomDateRange(start, end);
  }

  handleCustomDateChange() {
    const startEl = document.getElementById('drp-input-start');
    const endEl = document.getElementById('drp-input-end');
    if (startEl) this.state.customStartDateInput = startEl.value;
    if (endEl) this.state.customEndDateInput = endEl.value;
    const previewEl = document.getElementById('drp-preview-text');
    if (previewEl) {
      previewEl.innerText = this.formatRangeSpan(this.state.customStartDateInput, this.state.customEndDateInput);
    }
  }

  setQuickOffset(days) {
    const base = new Date((this.state.globalDate || '2026-09-22') + 'T00:00:00');
    const start = new Date(base);
    start.setDate(base.getDate() - (days - 1));
    const pad = (n) => String(n).padStart(2, '0');
    const startIso = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const endIso = this.state.globalDate || '2026-09-22';

    this.state.customStartDateInput = startIso;
    this.state.customEndDateInput = endIso;

    const startEl = document.getElementById('drp-input-start');
    const endEl = document.getElementById('drp-input-end');
    if (startEl) startEl.value = startIso;
    if (endEl) endEl.value = endIso;

    const previewEl = document.getElementById('drp-preview-text');
    if (previewEl) {
      previewEl.innerText = this.formatRangeSpan(startIso, endIso);
    }
  }

  toggleDatePickerPopover() {
    this.state.datePickerPopoverOpen = !this.state.datePickerPopoverOpen;
    if (this.state.datePickerPopoverOpen) {
      this.state.userMenuOpen = false;
      const range = this.getDateRange();
      this.state.customStartDateInput = range.startDate;
      this.state.customEndDateInput = range.endDate;
    }
    this.render();
  }

  closeDatePickerPopover() {
    this.state.datePickerPopoverOpen = false;
    this.render();
  }


  bindEvents() {
    // Platform Switcher
    document.querySelectorAll('.proto-platform-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const platform = btn.dataset.platform;
        this.setPlatform(platform);
      });
    });

    // Screen Selector Dropdown
    const screenSelect = document.getElementById('proto-screen-select');
    if (screenSelect) {
      screenSelect.addEventListener('change', (e) => {
        this.navigateTo(e.target.value);
      });
    }

    // Panel Side Toggle
    document.querySelectorAll('[data-panel-side]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const side = btn.dataset.panelSide;
        this.setPanelSide(side);
      });
    });

    // Unhappy State Selector
    const stateSelect = document.getElementById('proto-state-select');
    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        this.state.unhappyState = e.target.value;
        this.render();
      });
    }

    // Sign-off Button
    const signoffBtn = document.getElementById('proto-signoff-btn');
    if (signoffBtn) {
      signoffBtn.addEventListener('click', () => {
        this.navigateTo('SIGNOFF');
      });
    }

    // Global click listener for popovers (date range, user menu)
    document.addEventListener('click', (e) => {
      if (this.state.datePickerPopoverOpen) {
        const container = document.getElementById('topbar-date-slice-container');
        if (container && !container.contains(e.target)) {
          this.state.datePickerPopoverOpen = false;
          this.render();
        }
      }
      if (this.state.userMenuOpen) {
        const userMenu = e.target.closest('.fluent-avatar-wrapper');
        if (!userMenu) {
          this.state.userMenuOpen = false;
          this.render();
        }
      }
    });

    // Global Esc key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.state.datePickerPopoverOpen) {
          this.state.datePickerPopoverOpen = false;
          this.render();
        }
      }
    });
  }

  setPlatform(platform) {
    this.state.platform = platform;
    if (platform === 'admin' && this.state.currentScreen.startsWith('B-')) {
      this.state.currentScreen = 'A-03';
    } else if (platform === 'bdm' && this.state.currentScreen.startsWith('A-')) {
      this.state.currentScreen = 'B-02';
    }
    this.render();
  }

  setPanelSide(side) {
    this.state.panelSide = side;
    document.querySelectorAll('[data-panel-side]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panelSide === side);
    });
    const panelOverlay = document.getElementById('quick-create-overlay');
    if (panelOverlay) {
      panelOverlay.classList.remove('dock-left', 'dock-right');
      panelOverlay.classList.add(`dock-${side}`);
    }
  }

  navigateTo(screenId, params = {}) {
    this.state.currentScreen = screenId;
    if (screenId.startsWith('A-')) {
      this.state.platform = 'admin';
    } else if (screenId.startsWith('B-')) {
      this.state.platform = 'bdm';
    }

    if (params.leadId) {
      this.state.activeLeadId = params.leadId;
    }
    if (params.accountId) {
      this.state.activeAccountId = params.accountId;
    }
    if (params.bdmId) {
      if (screenId === 'A-03') {
        this.state.leadBdmFilter = params.bdmId;
      } else if (screenId === 'A-19') {
        this.state.interactionBdmFilter = params.bdmId;
      }
    }

    const screenSelect = document.getElementById('proto-screen-select');
    if (screenSelect && screenSelect.value !== screenId) {
      screenSelect.value = screenId;
    }
    const screenBadge = document.getElementById('proto-screen-badge');
    if (screenBadge) {
      screenBadge.textContent = `${screenId}`;
    }

    this.state.quickCreateOpen = false;
    this.render();
  }

  showToast(message) {
    this.state.toastMessage = message;
    const toast = document.getElementById('proto-toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }
  }

  render() {
    this.updateTopBar();
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.toggle('is-auth-screen', this.state.currentScreen === 'A-01');
    }
    const canvas = document.getElementById('proto-viewport-canvas');
    if (!canvas) return;

    if (this.state.currentScreen === 'SIGNOFF') {
      canvas.innerHTML = this.renderSignoffScreen();
      return;
    }

    if (this.state.platform === 'admin') {
      canvas.innerHTML = this.renderAdminShell();
    } else {
      canvas.innerHTML = this.renderBdmShell();
    }

    this.postRenderAttachEvents();
  }

  updateTopBar() {
    const screenBadge = document.getElementById('proto-screen-badge');
    const screenSelect = document.getElementById('proto-screen-select');
    const platformBtns = document.querySelectorAll('.proto-platform-btn');

    if (screenBadge) {
      screenBadge.textContent = `${this.state.currentScreen} · ${this.getScreenTitle(this.state.currentScreen)}`;
    }
    if (screenSelect) {
      screenSelect.value = this.state.currentScreen;
    }

    platformBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.platform === this.state.platform);
    });
  }

  getScreenTitle(sId) {
    const titles = {
      'A-01': 'Admin Login',
      'A-02': 'Executive Dashboard',
      'A-03': 'Lead Management (Grid)',
      'A-04': 'Lead Detail & Timeline',
      'A-05': 'Quick Create Lead',
      'A-06': 'Bulk CSV Upload',
      'A-07': 'Assign / Reassign Leads',
      'A-08': 'Staff Management',
      'A-09': 'Quick Create / Edit Staff',
      'A-10': 'Product & Service Masters',
      'A-11': 'Attendance Matrix',
      'A-12': 'Attendance Punch Audit',
      'A-13': 'Holiday Calendar',
      'A-14': 'Notifications Center',
      'A-15': 'Export & Custom Reports',
      'A-16': 'Daily Interaction Log',
      'A-17': 'Accounts Directory',
      'A-18': 'Account Detail & Lifetime Value',
      'B-01': 'BDM Login',
      'B-02': 'My Pipeline & Performance',
      'B-03': 'Attendance Punch',
      'B-04': 'Attendance History',
      'B-05': 'My Assigned Leads',
      'B-06': 'Lead Detail & Actions',
      'B-07': 'Log Follow-up Interaction',
      'B-08': 'Upload BRD Document',
      'B-09': 'My Notifications',
      'B-10': 'Welcome Walkthrough',
      'SIGNOFF': 'Prototype Review & Sign-Off'
    };
    return titles[sId] || sId;
  }

  // ==========================================================
  // ADMIN PLATFORM SHELL & SCREENS
  // ==========================================================
  renderAdminShell() {
    // Before Login (A-01): Hide sidebar and command bar entirely for clean executive login
    if (this.state.currentScreen === 'A-01') {
      return this.renderA01Login();
    }

    return `
      <div class="admin-viewport">
        <!-- Dynamics 365 Command Bar with Page Title, Breadcrumbs & Date Slice -->
        ${this.renderCommandBar()}

        <!-- Main Workspace -->
        <div class="admin-workspace">
          <!-- Site Map Navigation -->
          ${this.renderSiteMap()}

          <!-- Screen Content Area -->
          <div class="admin-content-area" id="admin-content-area">
            ${this.renderUnhappyStateWrapper(() => this.renderAdminScreen(this.state.currentScreen))}
          </div>
        </div>

        <!-- Staff CRUD Modal (Create & Edit) -->
        ${this.renderStaffCrudModal()}

        <!-- Staff Deactivate / Lead Reassignment Modal -->
        ${this.renderStaffDeleteModal()}

        <!-- Quick Create Panel (Overlay) -->
        ${this.renderQuickCreateOverlay()}

        <!-- Staff Password Modal (US-32 / US-33) -->
        ${this.renderOneTimePasswordModal()}

        <!-- Won & Dropoff Modals -->
        ${this.renderWonModal()}
        ${this.renderDropoffModal()}
      </div>
    `;
  }

  renderCommandBar() {
    const isLeadList = this.state.currentScreen === 'A-03';
    const isLeadDetail = this.state.currentScreen === 'A-04';
    const isStaffList = this.state.currentScreen === 'A-08';
    const hasSelection = this.state.selectedLeadIds.size > 0;
    const selectedCount = this.state.selectedLeadIds.size;

    return `
      <header class="dynamics-command-bar">
        <div class="command-bar-left">
          <!-- Title and Clickable Breadcrumb Section (Page Title in Top Bar) -->
          <div class="command-bar-title-section">
            <div class="command-bar-breadcrumb">
              ${this.renderBreadcrumbs()}
            </div>
            <div class="command-bar-page-title">
              ${this.getScreenTitle(this.state.currentScreen)}
            </div>
          </div>

          <!-- Contextual Action Buttons -->
          <div class="command-bar-actions">
            ${isLeadList ? `
              <button class="fluent-btn-command primary-cmd" id="cmd-new-lead" onclick="app.openLeadCreate()">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                New Lead
              </button>
              <button class="fluent-btn-command" id="cmd-bulk-upload" onclick="app.navigateTo('A-06')">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V10.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>
                Bulk upload
              </button>
              ${hasSelection ? `
                <button class="fluent-btn-command primary-cmd" id="cmd-assign-selected" onclick="app.navigateTo('A-07')">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/></svg>
                  Assign (${selectedCount})
                </button>
                <button class="fluent-btn-command danger-cmd" id="cmd-delete-selected" onclick="app.deleteSelectedLeads()">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                  Delete
                </button>
              ` : ''}
              <button class="fluent-btn-command" id="cmd-export-leads" onclick="app.exportLeadsCsv()">Export</button>
            ` : ''}

            ${isLeadDetail ? `
              <button class="fluent-btn-command" onclick="app.navigateTo('A-03')">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
                Back to Leads
              </button>
              <button class="fluent-btn-command primary-cmd" onclick="app.showToast('Lead changes saved successfully')">
                Save & Close
              </button>
              <button class="fluent-btn-command" onclick="app.navigateTo('A-07', { leadId: app.state.activeLeadId })">
                Assign
              </button>
            ` : ''}

            ${isStaffList ? `
              <button class="fluent-btn-command primary-cmd" id="cmd-new-staff" onclick="app.openStaffModal(null)">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                Add Staff
              </button>
            ` : ''}
          </div>
        </div>

        <div class="command-bar-right">
          <!-- RTK Date Slice with Presets in Top Bar -->
          ${this.renderTopBarDateSlice()}

          <!-- Search Box -->
          <div class="fluent-search-box">
            <svg class="fluent-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
            <input type="text" placeholder="Filter or search..." value="${this.state.searchQuery}" oninput="app.handleSearch(this.value)" />
          </div>

          <!-- Notification Bell -->
          <button class="icon-btn-utility" onclick="app.navigateTo('A-14')" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/></svg>
          </button>

          <!-- User Avatar with Sign-Out Menu -->
          <div style="position: relative;">
            <div class="fluent-avatar" style="cursor: pointer;" title="Chandan Mallik (CTO) · Click for options" onclick="app.toggleUserMenu()">CM</div>
            ${this.state.userMenuOpen ? `
              <div style="position: absolute; right: 0; top: 38px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); box-shadow: var(--shadow-level2); width: 170px; z-index: 1000; padding: 6px 0;">
                <div style="padding: 6px 12px; font-size: 11px; font-weight: 600; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border);">
                  Chandan Mallik (CTO)
                </div>
                <button onclick="app.logoutAdmin()" style="width: 100%; text-align: left; padding: 8px 12px; background: none; border: none; font-size: 12px; color: var(--color-error); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <span>🚪</span> Sign Out
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </header>
    `;
  }

  renderBreadcrumbs() {
    const s = this.state.currentScreen;
    const base = `<a class="breadcrumb-link" onclick="app.navigateTo('A-02')">CKR Connect</a>`;

    switch (s) {
      case 'A-02':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Dashboard</span>`;
      case 'A-03':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Leads</span>`;
      case 'A-04':
        const activeLead = this.state.leads.find(l => l.id === this.state.activeLeadId);
        const leadName = activeLead ? activeLead.name : 'Lead Details';
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-03')">Leads</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">${this.escapeHtml(leadName)}</span>`;
      case 'A-05':
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-03')">Leads</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Quick Create</span>`;
      case 'A-06':
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-03')">Leads</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Bulk Upload</span>`;
      case 'A-07':
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-03')">Leads</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Lead Assignment</span>`;
      case 'A-08':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Staff (BDMs)</span>`;
      case 'A-09':
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-08')">Staff</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Staff Profile</span>`;
      case 'A-10':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Masters (Tags)</span>`;
      case 'A-11':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Attendance Matrix</span>`;
      case 'A-12':
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-11')">Attendance</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Audit Edit</span>`;
      case 'A-13':
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-11')">Attendance</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Holidays</span>`;
      case 'A-14':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Notifications</span>`;
      case 'A-15':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Export & Analytics</span>`;
      case 'A-16':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Daily Reports</span>`;
      case 'A-19':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Daily Interactions Ledger</span>`;
      case 'A-17':
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Accounts & Renewals (Phase 2)</span>`;
      case 'A-18':
        return `${base} <span class="breadcrumb-sep">›</span> <a class="breadcrumb-link" onclick="app.navigateTo('A-17')">Accounts</a> <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">Account Detail</span>`;
      default:
        return `${base} <span class="breadcrumb-sep">›</span> <span class="breadcrumb-current">${this.getScreenTitle(s)}</span>`;
    }
  }

  renderTopBarDateSlice() {
    const range = this.getDateRange();
    const preset = this.state.datePreset || range.preset || 'today';

    return `
      <div class="topbar-date-slice-container" id="topbar-date-slice-container" title="Global Platform Date Range (RTK Date Slice)">
        <!-- Primary Date Range Dropdown Trigger -->
        <button type="button" class="topbar-date-range-trigger ${this.state.datePickerPopoverOpen ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleDatePickerPopover()" title="Click to view all Date Presets & Custom Range Picker">
          <span class="topbar-date-icon">📅</span>
          <span class="topbar-date-range-text">${this.escapeHtml(range.shortLabel || range.label)}</span>
          <svg class="topbar-date-chevron" width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
        </button>

        <!-- Quick 1-Click Business Presets Strip -->
        <div class="topbar-date-presets">
          <button type="button" class="topbar-preset-btn ${preset === 'today' ? 'active' : ''}" onclick="app.selectDatePreset('today')" title="Today: 22 Sep 2026">Today</button>
          <button type="button" class="topbar-preset-btn ${preset === 'mtd' ? 'active' : ''}" onclick="app.selectDatePreset('mtd')" title="Month to Date: 01 Sep – 22 Sep 2026">MTD</button>
          <button type="button" class="topbar-preset-btn ${preset === 'this_month' ? 'active' : ''}" onclick="app.selectDatePreset('this_month')" title="This Month: 01 Sep – 30 Sep 2026">This Month</button>
          <button type="button" class="topbar-preset-btn ${preset === 'last_month' ? 'active' : ''}" onclick="app.selectDatePreset('last_month')" title="Last Month: 01 Aug – 31 Aug 2026">Last Month</button>
          <button type="button" class="topbar-preset-btn ${preset === 'ytd' ? 'active' : ''}" onclick="app.selectDatePreset('ytd')" title="Year to Date: 01 Jan – 22 Sep 2026">YTD</button>
          <button type="button" class="topbar-preset-btn ${preset === 'this_year' ? 'active' : ''}" onclick="app.selectDatePreset('this_year')" title="This Year: 01 Jan – 31 Dec 2026">This Year</button>
          <button type="button" class="topbar-preset-btn ${preset === 'custom' || this.state.datePickerPopoverOpen ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleDatePickerPopover()" title="Custom Date Range & More Presets">Custom ▾</button>
        </div>

        <!-- Date Range Popover Panel -->
        ${this.state.datePickerPopoverOpen ? this.renderDatePickerPopover() : ''}
      </div>
    `;
  }

  renderDatePickerPopover() {
    const range = this.getDateRange();
    const preset = this.state.datePreset || range.preset || 'today';
    const startVal = this.state.customStartDateInput || range.startDate || '2026-09-01';
    const endVal = this.state.customEndDateInput || range.endDate || '2026-09-22';

    return `
      <div class="date-range-popover" onclick="event.stopPropagation()">
        <div class="drp-header">
          <div class="drp-header-title">
            <span style="font-size: 15px;">📅</span>
            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--color-text-primary);">Date Range & Business Presets</div>
              <div style="font-size: 11px; color: var(--color-primary); font-weight: 500;">
                Active: ${this.escapeHtml(range.label)}
              </div>
            </div>
          </div>
          <button type="button" class="drp-close-btn" onclick="app.closeDatePickerPopover()" title="Close popover">✕</button>
        </div>

        <div class="drp-body">
          <!-- Presets Column -->
          <div class="drp-presets-col">
            <!-- Day Presets -->
            <div class="drp-group-title">DAYS</div>
            <div class="drp-preset-list">
              <button type="button" class="drp-preset-item ${preset === 'today' ? 'active' : ''}" onclick="app.selectDatePreset('today')">
                <span>Today</span>
                <span class="drp-preset-sub">22 Sep</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'yesterday' ? 'active' : ''}" onclick="app.selectDatePreset('yesterday')">
                <span>Yesterday</span>
                <span class="drp-preset-sub">21 Sep</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'last_7_days' ? 'active' : ''}" onclick="app.selectDatePreset('last_7_days')">
                <span>Last 7 Days</span>
                <span class="drp-preset-sub">16–22 Sep</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'this_week' ? 'active' : ''}" onclick="app.selectDatePreset('this_week')">
                <span>This Week</span>
                <span class="drp-preset-sub">21–27 Sep</span>
              </button>
            </div>

            <!-- Month Presets -->
            <div class="drp-group-title" style="margin-top: 10px;">MONTHS</div>
            <div class="drp-preset-list">
              <button type="button" class="drp-preset-item ${preset === 'mtd' ? 'active' : ''}" onclick="app.selectDatePreset('mtd')">
                <span>MTD (Month to Date)</span>
                <span class="drp-preset-sub">01–22 Sep</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'this_month' ? 'active' : ''}" onclick="app.selectDatePreset('this_month')">
                <span>This Month</span>
                <span class="drp-preset-sub">Sep 2026</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'last_month' ? 'active' : ''}" onclick="app.selectDatePreset('last_month')">
                <span>Last Month</span>
                <span class="drp-preset-sub">Aug 2026</span>
              </button>
            </div>

            <!-- Quarter & Year Presets -->
            <div class="drp-group-title" style="margin-top: 10px;">QUARTERS & YEARS</div>
            <div class="drp-preset-list">
              <button type="button" class="drp-preset-item ${preset === 'qtd' ? 'active' : ''}" onclick="app.selectDatePreset('qtd')">
                <span>QTD (Quarter to Date)</span>
                <span class="drp-preset-sub">Q3 · Jul–Sep</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'ytd' ? 'active' : ''}" onclick="app.selectDatePreset('ytd')">
                <span>YTD (Year to Date)</span>
                <span class="drp-preset-sub">01 Jan–22 Sep</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'this_year' ? 'active' : ''}" onclick="app.selectDatePreset('this_year')">
                <span>This Year</span>
                <span class="drp-preset-sub">2026</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'last_year' ? 'active' : ''}" onclick="app.selectDatePreset('last_year')">
                <span>Last Year</span>
                <span class="drp-preset-sub">2025</span>
              </button>
              <button type="button" class="drp-preset-item ${preset === 'all' ? 'active' : ''}" onclick="app.selectDatePreset('all')">
                <span>All Time</span>
                <span class="drp-preset-sub">All records</span>
              </button>
            </div>
          </div>

          <!-- Custom Range Column -->
          <div class="drp-custom-col">
            <div class="drp-group-title">CUSTOM DATE RANGE</div>
            <div class="drp-custom-form">
              <div class="drp-input-row">
                <label class="drp-label">Start Date</label>
                <input type="date" id="drp-input-start" class="drp-input" value="${startVal}" onchange="app.handleCustomDateChange()" />
              </div>
              <div class="drp-input-row">
                <label class="drp-label">End Date</label>
                <input type="date" id="drp-input-end" class="drp-input" value="${endVal}" onchange="app.handleCustomDateChange()" />
              </div>
            </div>

            <div class="drp-quick-offsets">
              <span class="drp-offset-title">Quick Offsets</span>
              <div class="drp-offset-buttons">
                <button type="button" class="drp-offset-btn" onclick="app.setQuickOffset(14)">Last 14 Days</button>
                <button type="button" class="drp-offset-btn" onclick="app.setQuickOffset(30)">Last 30 Days</button>
                <button type="button" class="drp-offset-btn" onclick="app.setQuickOffset(60)">Last 60 Days</button>
                <button type="button" class="drp-offset-btn" onclick="app.setQuickOffset(90)">Last 90 Days</button>
              </div>
            </div>

            <div class="drp-preview-box">
              <div style="font-size: 11px; color: var(--color-text-secondary);">Selected Span:</div>
              <div id="drp-preview-text" style="font-size: 12px; font-weight: 600; color: var(--color-text-primary); margin-top: 2px;">
                ${this.formatRangeSpan(startVal, endVal)}
              </div>
            </div>

            <div class="drp-actions-row">
              <button type="button" class="fluent-btn fluent-btn-secondary" style="height: 30px; font-size: 11px;" onclick="app.selectDatePreset('today')">Reset Today</button>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="fluent-btn fluent-btn-secondary" style="height: 30px; font-size: 11px;" onclick="app.closeDatePickerPopover()">Cancel</button>
                <button type="button" class="fluent-btn fluent-btn-primary" style="height: 30px; font-size: 11px; font-weight: 600;" onclick="app.applyCustomRangeFromInputs()">Apply Range ✓</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSiteMap() {
    const s = this.state.currentScreen;
    return `
      <nav class="dynamics-sitemap ${this.state.sitemapCollapsed ? 'collapsed' : ''}" id="dynamics-sitemap">
        <div class="sitemap-toggle-row">
          <span class="sitemap-title">Dynamics Sales Hub</span>
          <button class="sitemap-toggle-btn" onclick="app.toggleSiteMap()">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
          </button>
        </div>

        <ul class="sitemap-menu-list">
          <li class="sitemap-section-label">Core Operations</li>
          <li class="sitemap-item ${s === 'A-02' ? 'active' : ''}" onclick="app.navigateTo('A-02')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/></svg>
            <span class="sitemap-item-text">Dashboard</span>
          </li>
          <li class="sitemap-item ${['A-03', 'A-04', 'A-05', 'A-06', 'A-07'].includes(s) ? 'active' : ''}" onclick="app.navigateTo('A-03')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg>
            <span class="sitemap-item-text">Leads</span>
          </li>
          <li class="sitemap-item ${['A-08', 'A-09'].includes(s) ? 'active' : ''}" onclick="app.navigateTo('A-08')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/></svg>
            <span class="sitemap-item-text">Staff (BDMs)</span>
          </li>
          <li class="sitemap-item ${['A-11', 'A-12', 'A-13'].includes(s) ? 'active' : ''}" onclick="app.navigateTo('A-11')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>
            <span class="sitemap-item-text">Attendance</span>
          </li>
          <li class="sitemap-item ${s === 'A-10' ? 'active' : ''}" onclick="app.navigateTo('A-10')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1H2zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
            <span class="sitemap-item-text">Masters (Tags)</span>
          </li>

          <li class="sitemap-section-label">Reports</li>
          <li class="sitemap-item ${s === 'A-19' ? 'active' : ''}" onclick="app.navigateTo('A-19')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
            <span class="sitemap-item-text">Daily Interactions</span>
          </li>
          <li class="sitemap-item ${s === 'A-16' ? 'active' : ''}" onclick="app.navigateTo('A-16')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M3 12h8v1H3v-1zm0-2h8v1H3v-1zm0-2h8v1H3v-1z"/></svg>
            <span class="sitemap-item-text">Daily Reports</span>
          </li>
          <li class="sitemap-item ${s === 'A-15' ? 'active' : ''}" onclick="app.navigateTo('A-15')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
            <span class="sitemap-item-text">Export & Analytics</span>
          </li>

          <li class="sitemap-section-label">Reserved (Phase 2)</li>
          <li class="sitemap-item ${['A-17', 'A-18'].includes(s) ? 'active' : ''}" onclick="app.navigateTo('A-17')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022zM6 8.694 1 10.36V15h5V8.694zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.709l-7 3.5V15z"/></svg>
            <span class="sitemap-item-text">Accounts & Renewals</span>
            <span class="sitemap-coming-soon" style="background: #E0E7FF; color: #3730A3;">Phase 2</span>
          </li>
          <li class="sitemap-item disabled">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.253-.3-1.873-.83-1.873-1.764 0-.965.75-1.743 1.873-1.85v3.614zm1.043 1.414c1.26.36 1.815.86 1.815 1.875 0 1.05-.83 1.808-1.815 1.95V8.359z"/></svg>
            <span class="sitemap-item-text">Finance & P&L</span>
            <span class="sitemap-coming-soon">Soon</span>
          </li>
          <li class="sitemap-item disabled">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z"/></svg>
            <span class="sitemap-item-text">Marketing</span>
            <span class="sitemap-coming-soon">Soon</span>
          </li>
          <li class="sitemap-item disabled">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/></svg>
            <span class="sitemap-item-text">Projects</span>
            <span class="sitemap-coming-soon">Soon</span>
          </li>
        </ul>
      </nav>
    `;
  }

  toggleSiteMap() {
    this.state.sitemapCollapsed = !this.state.sitemapCollapsed;
    const sitemap = document.getElementById('dynamics-sitemap');
    if (sitemap) {
      sitemap.classList.toggle('collapsed', this.state.sitemapCollapsed);
    }
  }

  renderAdminScreen(sId) {
    switch (sId) {
      case 'A-01': return this.renderA01Login();
      case 'A-02': return this.renderA02Dashboard();
      case 'A-03': return this.renderA03LeadList();
      case 'A-04': return this.renderA04LeadDetail();
      case 'A-05': return this.renderA05QuickCreateLead();
      case 'A-06': return this.renderA06BulkUpload();
      case 'A-07': return this.renderA07AssignLead();
      case 'A-08': return this.renderA08StaffList();
      case 'A-09': return this.renderA09StaffCreateEdit();
      case 'A-10': return this.renderA10Masters();
      case 'A-11': return this.renderA11AttendanceMatrix();
      case 'A-12': return this.renderA12AttendanceEdit();
      case 'A-13': return this.renderA13Holidays();
      case 'A-14': return this.renderA14Notifications();
      case 'A-15': return this.renderA15Reports();
      case 'A-16': return this.renderA16DailyReport();
      case 'A-17': return this.renderA17AccountList();
      case 'A-18': return this.renderA18AccountDetail();
      case 'A-19': return this.renderA19DailyInteractionHistory();
      default: return this.renderA03LeadList();
    }
  }

  // --- SCREEN A-01: Admin Login (Executive Split Portal) ---
  renderA01Login() {
    return `
      <div class="auth-fullscreen-container">
        <!-- Left Hero Panel with Branding & Core Capabilities -->
        <div class="auth-hero-panel">
          <div class="auth-hero-branding">
            <span class="auth-hero-badge">CKR CONNECT ENTERPRISE</span>
            <div class="auth-hero-title">CKR Connect</div>
            <div class="auth-hero-subtitle">
              Unified sales intelligence, daily calling activity ledger, and multi-tier staff governance built for high-velocity operations.
            </div>
          </div>

          <div class="auth-hero-features">
            <div class="auth-feature-row">
              <div class="auth-feature-icon">⚡</div>
              <div class="auth-feature-text">
                <strong>Real-Time Pipeline Waterfall</strong>
                <span>Instant conversion tracking with RTK-backed date slice filtering.</span>
              </div>
            </div>
            <div class="auth-feature-row">
              <div class="auth-feature-icon">📞</div>
              <div class="auth-feature-text">
                <strong>Daily Calling Ledger</strong>
                <span>Chronological interaction audit across Voice, WhatsApp, Demos & Site Visits.</span>
              </div>
            </div>
            <div class="auth-feature-row">
              <div class="auth-feature-icon">👥</div>
              <div class="auth-feature-text">
                <strong>Full BDM Staff Governance</strong>
                <span>Complete staff CRUD with intelligent automated lead reassignment.</span>
              </div>
            </div>
            <div class="auth-feature-row">
              <div class="auth-feature-icon">🛡️</div>
              <div class="auth-feature-text">
                <strong>Attendance & Audit Compliance</strong>
                <span>Geofenced punch controls, daily work-hour calculation and audit trails.</span>
              </div>
            </div>
          </div>

          <div class="auth-hero-footer">
            <span>CKR Connect v0.1 · Operations & Sales Intelligence · Internal Portal</span>
          </div>
        </div>

        <!-- Right Sign-In Panel -->
        <div class="auth-form-panel">
          <div class="auth-card-box">
            <div>
              <span class="proto-brand-tag" style="margin-bottom: 8px; display: inline-block;">INTERNAL ACCESS</span>
              <h2 style="font-size: 24px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 4px 0;">Sign in</h2>
              <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">Enter your enterprise credentials to access CKR Connect</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div class="form-field-group">
                <label class="form-field-label">Email address</label>
                <input type="email" id="auth-email-input" class="form-field-input" value="chandan@ckrtechnologies.in" placeholder="name@ckrtechnologies.in" />
              </div>
              <div class="form-field-group">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label class="form-field-label">Password</label>
                  <a href="javascript:void(0)" onclick="app.showToast('Password reset link sent to admin email')" style="font-size: 11px; color: var(--color-primary); text-decoration: none;">Forgot password?</a>
                </div>
                <input type="password" id="auth-password-input" class="form-field-input" value="••••••••••••" placeholder="Enter password" />
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-secondary);">
                <input type="checkbox" id="auth-remember-me" checked style="accent-color: var(--color-primary);" />
                <label for="auth-remember-me">Keep me signed in on this workstation</label>
              </div>
            </div>

            <button class="fluent-btn fluent-btn-primary" style="height: 40px; font-size: 13px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="app.loginAdmin()">
              <span>Sign in to CKR Connect</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
            </button>

            <!-- Quick Demo Persona Switchers -->
            <div class="auth-demo-pill">
              <div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                ⚡ 1-Click Prototype Persona Logins
              </div>
              <div style="display: flex; gap: 8px; flex-direction: column;">
                <button class="fluent-btn fluent-btn-secondary" style="height: 30px; font-size: 11px; width: 100%; justify-content: flex-start;" onclick="app.loginAdmin()">
                  👑 <strong>Chandan Mallik</strong> · Executive Admin (Desktop Sales Hub)
                </button>
                <button class="fluent-btn fluent-btn-secondary" style="height: 30px; font-size: 11px; width: 100%; justify-content: flex-start;" onclick="app.loginBdm('u-02')">
                  📱 <strong>Aarav Sharma</strong> · Active BDM (Mobile App 390×844)
                </button>
              </div>
            </div>

            <div style="font-size: 11px; color: var(--color-text-secondary); text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>🛡️ Secured by CKR Cloud Infrastructure</span>
              <span>·</span>
              <span>256-bit TLS</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-02: Admin Dashboard (US-20, US-23, US-28) ---
  renderA02Dashboard() {
    const range = this.getDateRange();
    const { startDate, endDate, label: rangeLabel, shortLabel } = range;
    const selectedDate = this.state.selectedDate || endDate || '2026-09-22';
    const activeChannel = this.state.interactionChannelFilter || 'all';

    // Pipeline math
    const totalForecast = this.state.leads
      .filter(l => !['won', 'lost', 'invalid'].includes(l.status))
      .reduce((sum, l) => {
        const prob = l.probability_override || STAGE_PROBABILITIES[l.status] || 0;
        return sum + ((l.expected_value || 0) * prob / 100);
      }, 0);

    const totalWon = this.state.leads
      .filter(l => l.status === 'won')
      .reduce((sum, l) => sum + (l.won_amount || 0), 0);

    const activeLeads = this.state.leads.filter(l => !['won', 'lost', 'invalid'].includes(l.status));
    
    // Follow-ups due in date range
    const dueTodayCount = this.state.leads.filter(l => {
      if (!l.next_followup_date) return false;
      if (startDate && l.next_followup_date < startDate) return false;
      if (endDate && l.next_followup_date > endDate) return false;
      return true;
    }).length;

    const overdueRef = startDate || '2026-09-22';
    const overdueCount = this.state.leads.filter(l => l.next_followup_date && l.next_followup_date < overdueRef && !['won', 'lost', 'invalid'].includes(l.status)).length;

    // Day attendance calculations
    const dayAttendance = this.state.attendance.filter(a => {
      if (!startDate && !endDate) return true;
      if (startDate && a.date < startDate) return false;
      if (endDate && a.date > endDate) return false;
      return true;
    });
    const presentCount = dayAttendance.filter(a => a.status === 'present').length || 3;
    const totalStaffCount = this.state.users.filter(u => u.role === 'bdm').length || 4;
    const leaveCount = dayAttendance.filter(a => a.status === 'leave').length || 1;

    // Pipeline Stage counts
    const stageCounts = {
      new: this.state.leads.filter(l => l.status === 'new').length,
      contacted: this.state.leads.filter(l => l.status === 'contacted').length,
      follow_up: this.state.leads.filter(l => l.status === 'follow_up').length,
      proposal: this.state.leads.filter(l => l.status === 'proposal' || l.status === 'negotiation').length,
      won: this.state.leads.filter(l => l.status === 'won').length,
      lost: this.state.leads.filter(l => l.status === 'lost').length,
      invalid: this.state.leads.filter(l => l.status === 'invalid').length
    };

    // Daily Interaction History for the selected date range
    const allDayInteractions = this.state.interactions.filter(i => {
      const dt = (i.created_at || '').slice(0, 10);
      if (!startDate && !endDate) return true;
      if (startDate && dt < startDate) return false;
      if (endDate && dt > endDate) return false;
      return true;
    });

    const dayInteractions = allDayInteractions.filter(i => activeChannel === 'all' || i.type === activeChannel);
    const callCount = allDayInteractions.filter(i => i.type === 'call').length;
    const waCount = allDayInteractions.filter(i => i.type === 'whatsapp').length;
    const demoCount = allDayInteractions.filter(i => i.type === 'meeting').length;
    const visitCount = allDayInteractions.filter(i => i.type === 'site_visit').length;

    const positiveCount = dayInteractions.filter(i => i.call_result_type === 'positive').length;
    const neutralCount = dayInteractions.filter(i => i.call_result_type === 'neutral' || !i.call_result_type).length;

    // BDM Leaderboard live metrics
    const bdmStats = this.state.users.filter(u => u.role === 'bdm').map(u => {
      const uLeads = this.state.leads.filter(l => l.assigned_to === u.id);
      const wonVal = uLeads.filter(l => l.status === 'won').reduce((s, l) => s + (l.won_amount || 0), 0);
      const pipeVal = uLeads.filter(l => !['won', 'lost', 'invalid'].includes(l.status)).reduce((s, l) => s + (l.expected_value || 0), 0);
      return { user: u, wonVal, pipeVal, count: uLeads.length };
    });

    return `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <!-- 4 Key Stat Tiles (Clickable / RTK Prop Passing to Filtered Views) -->
        <div class="dashboard-grid">
          <!-- Tile 1: Weighted Forecast -->
          <div class="fluent-tile-card interactive-tile" onclick="app.navigateTo('A-03')" title="Click to view all Pipeline Leads">
            <div class="tile-header">
              <span>WEIGHTED PIPELINE FORECAST</span>
              <svg width="16" height="16" fill="var(--color-primary)" viewBox="0 0 16 16"><path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-4zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/></svg>
            </div>
            <div class="tile-big-stat">₹${Math.round(totalForecast).toLocaleString('en-IN')}</div>
            <div class="tile-footer">Calculated from ${activeLeads.length} active leads</div>
            <div class="interactive-tile-hint">View Pipeline Breakdown ›</div>
          </div>

          <!-- Tile 2: Won Revenue -->
          <div class="fluent-tile-card interactive-tile" onclick="app.openFilteredLeads({ type: 'status', value: 'won', label: 'Won Deals' })" title="Click to view Closed-Won deals">
            <div class="tile-header">
              <span>CLOSED-WON REVENUE (FY)</span>
              <svg width="16" height="16" fill="var(--color-success)" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>
            </div>
            <div class="tile-big-stat" style="color: var(--color-success);">₹${totalWon.toLocaleString('en-IN')}</div>
            <div class="tile-footer">Total bookings collected</div>
            <div class="interactive-tile-hint" style="color: var(--color-success);">View Won Deals ›</div>
          </div>

          <!-- Tile 3: Active Leads & Follow-ups Due -->
          <div class="fluent-tile-card interactive-tile" onclick="app.navigateTo('A-03')" title="Click to open Lead Management">
            <div class="tile-header">
              <span>ACTIVE LEADS</span>
              <svg width="16" height="16" fill="var(--color-text-secondary)" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>
            </div>
            <div class="tile-big-stat">${activeLeads.length}</div>
            <div class="tile-footer" style="gap: 6px; flex-wrap: wrap; margin-top: 2px;">
              <span onclick="event.stopPropagation(); app.openFilteredLeads({ type: 'due_date', value: '${selectedDate}', label: 'Follow-ups Due in ' + '${shortLabel}' })" style="background: #FFF4CE; color: #795B00; padding: 1px 6px; border-radius: 4px; font-weight: 600; cursor: pointer;">
                ⏰ ${dueTodayCount} due in range (${shortLabel})
              </span>
              <span onclick="event.stopPropagation(); app.openFilteredLeads({ type: 'overdue', value: '${selectedDate}', label: 'Overdue Follow-ups' })" style="background: #FDE7E9; color: #A80000; padding: 1px 6px; border-radius: 4px; font-weight: 600; cursor: pointer;">
                🚨 ${overdueCount} overdue
              </span>
            </div>
            <div class="interactive-tile-hint">Browse All Active Leads ›</div>
          </div>

          <!-- Tile 4: Attendance in Range -->
          <div class="fluent-tile-card interactive-tile" onclick="app.navigateTo('A-11')" title="Click to open Attendance Matrix">
            <div class="tile-header">
              <span>ATTENDANCE (${shortLabel.toUpperCase()})</span>
              <svg width="16" height="16" fill="var(--color-info)" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
            </div>
            <div class="tile-big-stat">${presentCount} / ${totalStaffCount} Present</div>
            <div class="tile-footer">${leaveCount} on leave</div>
            <div class="interactive-tile-hint" style="color: var(--color-info);">Open Attendance Matrix (A-11) ›</div>
          </div>
        </div>

        <!-- Waterfall Chart & Leaderboard Row -->
        <div class="dashboard-charts-row">
          <!-- Waterfall Chart (DESIGN.md §3.8 - Clickable Stage Bars) -->
          <div class="fluent-tile-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="tile-header" style="font-size: 13px; font-weight: 600; text-transform: none; color: var(--color-text-primary);">
                Pipeline Waterfall by Stage
              </span>
              <span style="font-size: 11px; color: var(--color-primary); font-weight: 600;">Click any stage to filter leads</span>
            </div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">
              Distribution of prospective institutions across active qualification gates
            </div>
            
            <div class="waterfall-bars-container">
              ${[
                { key: 'new', label: 'New', count: stageCounts.new, color: '#0078D4', prob: '10%' },
                { key: 'contacted', label: 'Contacted', count: stageCounts.contacted, color: '#2B88D8', prob: '25%' },
                { key: 'follow_up', label: 'Follow Up', count: stageCounts.follow_up, color: '#FFB900', prob: '40%' },
                { key: 'proposal', label: 'Proposal', count: stageCounts.proposal, color: '#8764B8', prob: '60%' },
                { key: 'won', label: 'Won', count: stageCounts.won, color: '#107C41', prob: '100%' },
                { key: 'lost', label: 'Lost', count: stageCounts.lost, color: '#D83B01', prob: '0%' },
                { key: 'invalid', label: 'Invalid', count: stageCounts.invalid, color: '#A19F9D', prob: '0%' }
              ].map(st => {
                const maxCount = Math.max(1, ...Object.values(stageCounts));
                const pct = Math.round((st.count / maxCount) * 100);
                return `
                  <div class="waterfall-bar-group" onclick="app.openFilteredLeads({ type: 'status', value: '${st.key}', label: '${st.label} Stage Leads' })" title="Filter leads by stage: ${st.label} (${st.count} leads)">
                    <div class="waterfall-bar-label-top">${st.count}</div>
                    <div class="waterfall-bar-track">
                      <div class="waterfall-bar-fill" style="height: ${Math.max(6, pct)}%; background: ${st.color};"></div>
                    </div>
                    <div class="waterfall-bar-label-bottom">${st.label}</div>
                    <div style="font-size: 9px; color: var(--color-text-secondary);">${st.prob}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- BDM Performance Leaderboard (Clickable rows) -->
          <div class="fluent-tile-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="tile-header" style="font-size: 13px; font-weight: 600; text-transform: none; color: var(--color-text-primary);">
                BDM Performance Leaderboard
              </span>
              <a onclick="app.navigateTo('A-08')" style="font-size: 11px; color: var(--color-primary); cursor: pointer; font-weight: 600;">View All Staff ›</a>
            </div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">
              Closed revenue, active pipeline, and assigned client volume per executive
            </div>

            <div class="leaderboard-table-container">
              <table class="leaderboard-table">
                <thead>
                  <tr>
                    <th>Executive</th>
                    <th style="text-align: right;">Won (₹)</th>
                    <th style="text-align: right;">Pipeline</th>
                    <th style="text-align: center;">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  ${bdmStats.map((stat, idx) => `
                    <tr class="leaderboard-row" onclick="app.openFilteredLeads({ type: 'bdm', value: '${stat.user.id}', label: '${stat.user.name}\\'s Assigned Leads' })" title="Filter leads assigned to ${stat.user.name}">
                      <td>
                        <div class="leaderboard-user-cell">
                          <span class="leaderboard-rank-badge ${idx === 0 ? 'gold' : ''}">${idx + 1}</span>
                          <div>
                            <div class="leaderboard-user-name">${this.escapeHtml(stat.user.name)}</div>
                            <div class="leaderboard-user-role">${stat.user.designation || 'BDM'}</div>
                          </div>
                        </div>
                      </td>
                      <td style="text-align: right; font-weight: 700; color: var(--color-success);">
                        ₹${stat.wonVal.toLocaleString('en-IN')}
                      </td>
                      <td style="text-align: right; font-size: 12px; color: var(--color-text-primary);">
                        ₹${stat.pipeVal.toLocaleString('en-IN')}
                      </td>
                      <td style="text-align: center;">
                        <span class="leaderboard-count-pill">${stat.count}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Real-Time Daily Interaction History & Calling Ledger Section -->
        <div class="fluent-tile-card" style="padding: 16px;">
          <!-- Section Header with Channel Filter Buttons -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-size: 16px; font-weight: 700; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
                <span>🌊</span>
                <span>Daily Interaction History & Calling Ledger</span>
                <span style="font-size: 11px; font-weight: 700; background: #E8F4FC; color: #004578; padding: 2px 8px; border-radius: 10px; border: 1px solid #C7E0F4;">
                  ${allDayInteractions.length} Activities (${shortLabel})
                </span>
              </div>
              <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px;">
                Real-time chronological activity feed of phone calls, WhatsApp messages, video demos, and client visits
              </div>
            </div>

            <!-- Channel Filter Chips -->
            <div class="ledger-filter-chips">
              <button class="ledger-pill-btn ${activeChannel === 'all' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('all')">
                All Channels (${allDayInteractions.length})
              </button>
              <button class="ledger-pill-btn ${activeChannel === 'call' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('call')">
                📞 Calls (${callCount})
              </button>
              <button class="ledger-pill-btn ${activeChannel === 'whatsapp' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('whatsapp')">
                💬 WhatsApp (${waCount})
              </button>
              <button class="ledger-pill-btn ${activeChannel === 'meeting' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('meeting')">
                🎥 Demos (${demoCount})
              </button>
              <button class="ledger-pill-btn ${activeChannel === 'site_visit' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('site_visit')">
                🏢 Site Visits (${visitCount})
              </button>
            </div>
          </div>

          <!-- Summary Metric Strip -->
          <div class="ledger-summary-strip">
            <div><span style="color: var(--color-text-secondary);">Date Range:</span> <strong>${rangeLabel}</strong></div>
            <div><span style="color: var(--color-text-secondary);">Total Interactions:</span> <strong style="color: var(--color-primary);">${dayInteractions.length}</strong></div>
            <div><span style="color: var(--color-text-secondary);">🟢 Positive Outcomes:</span> <strong style="color: var(--color-success);">${positiveCount}</strong></div>
            <div><span style="color: var(--color-text-secondary);">🟡 In Progress / Ringing:</span> <strong style="color: #795B00;">${neutralCount}</strong></div>
            <div><span style="color: var(--color-text-secondary);">👥 Demos & Site Visits:</span> <strong style="color: #004578;">${demoCount + visitCount}</strong></div>
          </div>

          <!-- Daily Interactions Table -->
          ${dayInteractions.length === 0 ? `
            <div style="text-align: center; padding: 36px 16px; background: var(--color-surface-alt); border-radius: var(--radius-sm); border: 1px dashed var(--color-border);">
              <div style="font-size: 28px; margin-bottom: 6px;">📅</div>
              <div style="font-weight: 600; font-size: 14px;">No interactions recorded for ${rangeLabel}</div>
              <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
                Switch date preset to <strong>Today</strong>, <strong>MTD</strong>, or <strong>This Month</strong> to view active activity feeds.
              </div>
              <button class="fluent-btn fluent-btn-secondary" style="margin-top: 12px;" onclick="app.selectDatePreset('today')">
                Switch to Today (22 Sep 2026)
              </button>
            </div>
          ` : `
            <div style="overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
              <table class="ledger-table">
                <thead>
                  <tr>
                    <th style="width: 90px;">Time</th>
                    <th style="width: 130px;">BDM Staff</th>
                    <th style="min-width: 170px;">Contact & Institution</th>
                    <th style="width: 110px;">Channel</th>
                    <th style="min-width: 170px;">Call Outcome / Result</th>
                    <th style="min-width: 240px; max-width: 320px;">Discussion Notes</th>
                    <th style="min-width: 190px;">Next Action Commitment</th>
                    <th style="width: 110px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${dayInteractions.map(int => {
                    const bdm = this.state.users.find(u => u.id === int.bdm_id);
                    const lead = this.state.leads.find(l => l.id === int.lead_id);
                    const dateObj = new Date(int.created_at);
                    const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const typeIcon = int.type === 'call' ? '📞' : int.type === 'whatsapp' ? '💬' : int.type === 'meeting' ? '🎥' : int.type === 'site_visit' ? '🏢' : '📝';
                    const typeLabel = int.type === 'call' ? 'Call' : int.type === 'whatsapp' ? 'WhatsApp' : int.type === 'meeting' ? 'Zoom Demo' : int.type === 'site_visit' ? 'Site Visit' : 'Note';

                    const resultClass = int.call_result_type === 'neutral' ? 'result-neutral' :
                                        int.call_result_type === 'negative' ? 'result-negative' : 'result-positive';

                    return `
                      <tr>
                        <td class="nowrap">
                          <strong style="color: var(--color-text-primary); font-size: 12px;">${timeFormatted}</strong>
                          <div style="font-size: 10px; color: var(--color-text-secondary);">${dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </td>
                        <td class="nowrap">
                          <strong>${this.escapeHtml(bdm ? bdm.name : 'Aarav Sharma')}</strong>
                          <div style="font-size: 10px; color: var(--color-text-secondary);">${bdm ? bdm.designation : 'BDM'}</div>
                        </td>
                        <td>
                          <strong>${this.escapeHtml(lead ? lead.name : 'Unknown Contact')}</strong>
                          <div style="font-size: 11px; color: var(--color-text-secondary);">🏢 ${this.escapeHtml(lead ? lead.company_name : '—')}</div>
                        </td>
                        <td class="nowrap">
                          <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600; font-size: 12px;">
                            <span>${typeIcon}</span>
                            <span>${typeLabel}</span>
                          </span>
                        </td>
                        <td>
                          <span class="bdm-call-result-pill ${resultClass}" style="display: inline-block;">
                            ${this.escapeHtml(int.call_result_label || 'Activity Logged')}
                          </span>
                        </td>
                        <td style="font-size: 12px; line-height: 16px;">
                          "${this.escapeHtml(int.notes)}"
                        </td>
                        <td>
                          ${int.next_action ? `
                            <div style="font-size: 11px; color: var(--color-primary); font-weight: 600; display: flex; align-items: flex-start; gap: 4px; line-height: 15px;">
                              <span>⏰</span>
                              <span>${this.escapeHtml(int.next_action)}</span>
                            </div>
                          ` : '—'}
                        </td>
                        <td class="nowrap" style="text-align: right;">
                          <button class="fluent-btn fluent-btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="app.navigateTo('A-04', { leadId: '${int.lead_id}' })">
                            Inspect Lead ›
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // --- SCREEN A-03: Dense Lead List (US-06, DESIGN.md §2.5) ---
  renderA03LeadList() {
    const leads = this.getFilteredLeads();
    const allSelected = leads.length > 0 && leads.every(l => this.state.selectedLeadIds.has(l.id));
    const selectedBdm = this.state.users.find(u => u.id === this.state.leadBdmFilter);

    // Compute metrics if a BDM is selected
    let bdmSummaryHtml = '';
    if (selectedBdm) {
      const bdmLeads = this.state.leads.filter(l => l.assigned_to === selectedBdm.id);
      const bdmPipeline = bdmLeads.filter(l => !['won', 'lost', 'invalid'].includes(l.status)).reduce((s, l) => s + (l.expected_value || 0), 0);
      const bdmWon = bdmLeads.filter(l => l.status === 'won').reduce((s, l) => s + (l.won_amount || 0), 0);
      const bdmCallsToday = this.state.interactions.filter(i => i.bdm_id === selectedBdm.id && (i.created_at || '').slice(0, 10) === (this.state.selectedDate || '2026-09-22')).length;

      bdmSummaryHtml = `
        <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-left: 4px solid var(--color-primary); border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #0067B8; color: #FFFFFF; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${selectedBdm.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <strong style="font-size: 14px; color: var(--color-text-primary);">${this.escapeHtml(selectedBdm.name)}</strong>
                <span style="font-size: 11px; background: #E8F4FC; color: #004578; padding: 1px 6px; border-radius: 10px; font-weight: 600;">${selectedBdm.designation}</span>
                <span style="font-size: 11px; color: var(--color-text-secondary);">${selectedBdm.phone} · ${selectedBdm.email}</span>
              </div>
              <div style="display: flex; gap: 16px; font-size: 12px; margin-top: 4px; color: var(--color-text-secondary); flex-wrap: wrap;">
                <span>Assigned Leads: <strong style="color: var(--color-text-primary);">${bdmLeads.length}</strong></span>
                <span>Active Pipeline: <strong style="color: var(--color-primary);">₹${bdmPipeline.toLocaleString('en-IN')}</strong></span>
                <span>Won Revenue: <strong style="color: var(--color-success);">₹${bdmWon.toLocaleString('en-IN')}</strong></span>
                <span>Calls Logged Today (${this.state.selectedDate || '22 Sep'}): <strong style="color: #795B00;">${bdmCallsToday} activities</strong></span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px; padding: 0 10px; display: flex; align-items: center; gap: 4px;" onclick="app.navigateTo('A-19', { bdmId: '${selectedBdm.id}' })">
              <span>📜</span> View ${selectedBdm.name.split(' ')[0]}'s Interaction Ledger ›
            </button>
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="app.handleBdmFilter('')">
              ✕ All Staff
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="fluent-grid-container">
        ${this.state.activeLeadFilter ? `
          <div style="background: #E8F4FC; border: 1px solid #0067B8; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #004578;">
              <span style="font-size: 16px;">🔍</span>
              <div>
                <strong>Active Filter:</strong> <span style="background: #0067B8; color: #fff; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 12px; margin-left: 4px;">${this.escapeHtml(this.state.activeLeadFilter.label)}</span>
                <span style="margin-left: 8px; color: #505050; font-size: 12px;">(${leads.length} records found)</span>
              </div>
            </div>
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 12px; padding: 0 12px; display: flex; align-items: center; gap: 4px; font-weight: 600;" onclick="app.clearLeadFilter()">
              <span>✕</span> Clear Filter & Show All
            </button>
          </div>
        ` : ''}

        ${bdmSummaryHtml}

        <!-- Grid Toolbar with Direct BDM & Status Filters -->
        <div class="fluent-grid-toolbar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 14px; font-weight: 600;">
              ${selectedBdm ? `${selectedBdm.name}'s Assigned Leads` : 'All Active Leads'}
            </span>
            <span style="font-size: 12px; color: var(--color-text-secondary);">(${leads.length} records)</span>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <!-- BDM Filter Dropdown (Track BDM Activity) -->
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--color-text-secondary);">BDM:</span>
              <select class="form-field-select" style="height: 28px; font-size: 12px; min-width: 170px;" onchange="app.handleBdmFilter(this.value)">
                <option value="">All BDMs (Sales Staff)</option>
                ${this.state.users.filter(u => u.role === 'bdm').map(u => `
                  <option value="${u.id}" ${this.state.leadBdmFilter === u.id ? 'selected' : ''}>👤 ${this.escapeHtml(u.name)} (${this.state.leads.filter(l => l.assigned_to === u.id).length} leads)</option>
                `).join('')}
                <option value="unassigned" ${this.state.leadBdmFilter === 'unassigned' ? 'selected' : ''}>⚠️ Unassigned Pool (${this.state.leads.filter(l => !l.assigned_to).length})</option>
              </select>
            </div>

            <!-- Stage Filter Dropdown -->
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--color-text-secondary);">Stage:</span>
              <select class="form-field-select" style="height: 28px; font-size: 12px;" onchange="app.handleStatusFilter(this.value)">
                <option value="">All Statuses</option>
                <option value="new" ${this.state.leadStatusFilter === 'new' ? 'selected' : ''}>New (10%)</option>
                <option value="contacted" ${this.state.leadStatusFilter === 'contacted' ? 'selected' : ''}>Contacted (20%)</option>
                <option value="follow_up" ${this.state.leadStatusFilter === 'follow_up' ? 'selected' : ''}>Follow-up (40%)</option>
                <option value="proposal" ${this.state.leadStatusFilter === 'proposal' ? 'selected' : ''}>Proposal (60%)</option>
                <option value="won" ${this.state.leadStatusFilter === 'won' ? 'selected' : ''}>Won (100%)</option>
                <option value="lost" ${this.state.leadStatusFilter === 'lost' ? 'selected' : ''}>Lost Deals</option>
                <option value="invalid" ${this.state.leadStatusFilter === 'invalid' ? 'selected' : ''}>Invalid Data</option>
              </select>
            </div>

            <!-- Search Field -->
            <input 
              type="text" 
              class="form-field-input" 
              placeholder="Search leads..." 
              value="${this.escapeHtml(this.state.searchQuery || '')}" 
              oninput="app.handleSearch(this.value)" 
              style="height: 28px; width: 140px; font-size: 12px;" 
            />

            ${(this.state.leadBdmFilter || this.state.leadStatusFilter || this.state.searchQuery || this.state.activeLeadFilter) ? `
              <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="app.clearLeadFilter()">
                ✕ Reset
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Dense Table with Hairline Dividers (40px row height) -->
        <div style="overflow-x: auto;">
          <table class="fluent-grid-table">
            <thead>
              <tr>
                <th class="checkbox-col">
                  <input type="checkbox" class="fluent-checkbox" ${allSelected ? 'checked' : ''} onchange="app.toggleSelectAllLeads(this.checked)" />
                </th>
                <th class="sortable">Contact Name</th>
                <th class="sortable">Company / Institution</th>
                <th>State & City</th>
                <th>Product / Service</th>
                <th>Deal Type</th>
                <th>Forecast (₹)</th>
                <th>Status</th>
                <th>Assigned BDM</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              ${leads.length === 0 ? `
                <tr><td colspan="10" style="text-align: center; padding: 32px; color: var(--color-text-secondary);">No leads match the active filters.</td></tr>
              ` : leads.map(l => {
                const isChecked = this.state.selectedLeadIds.has(l.id);
                const tag = this.state.tags.find(t => t.id === l.tag_id);
                const bdm = this.state.users.find(u => u.id === l.assigned_to);

                return `
                  <tr class="${isChecked ? 'selected' : ''}" onclick="app.handleRowClick('${l.id}', event)">
                    <td class="checkbox-col" onclick="event.stopPropagation()">
                      <input type="checkbox" class="fluent-checkbox" ${isChecked ? 'checked' : ''} onchange="app.toggleSelectLead('${l.id}')" />
                    </td>
                    <td><strong>${l.name}</strong></td>
                    <td>${l.company_name || '—'}</td>
                    <td>${l.city ? `${l.city}, ${l.state}` : '—'}</td>
                    <td><span style="font-size: 12px; color: var(--color-text-secondary);">${tag ? tag.name : '—'}</span></td>
                    <td><span style="font-size: 11px; text-transform: uppercase; font-weight: 600;">${l.deal_type.replace('_', ' ')}</span></td>
                    <td><strong>₹${(l.expected_value || l.budget || 0).toLocaleString('en-IN')}</strong></td>
                    <td><span class="status-badge ${l.status}">${l.status.replace('_', ' ')}</span></td>
                    <td>${bdm ? bdm.name : '<span style="color: var(--color-text-disabled);">Unassigned</span>'}</td>
                    <td style="font-size: 12px; color: var(--color-text-secondary);">${l.next_followup_date || 'None scheduled'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-04: Lead Detail Form with Business Process Flow (DESIGN.md §2.4) ---
  renderA04LeadDetail() {
    const lead = this.state.leads.find(l => l.id === this.state.activeLeadId) || this.state.leads[0];
    const bdm = this.state.users.find(u => u.id === lead.assigned_to);
    const tag = this.state.tags.find(t => t.id === lead.tag_id);
    const interactions = this.state.interactions.filter(i => i.lead_id === lead.id);

    return `
      <div class="dynamics-form-container">
        <!-- Lead Header Card -->
        <div class="form-header-card">
          <div class="form-title-group">
            <h1>
              ${lead.name}
              <span class="status-badge ${lead.status}">${lead.status.replace('_', ' ')}</span>
            </h1>
            <div class="form-meta-row">
              <span><strong>Company:</strong> ${lead.company_name || 'Individual'}</span>
              <span><strong>Phone:</strong> ${lead.phone}</span>
              <span><strong>Owner:</strong> ${bdm ? bdm.name : 'Unassigned'}</span>
              <span><strong>Deal Type:</strong> ${lead.deal_type.toUpperCase()}</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="fluent-btn fluent-btn-primary" onclick="app.showToast('Lead details saved')">Save</button>
            <button class="fluent-btn fluent-btn-secondary" onclick="app.navigateTo('A-07', { leadId: lead.id })">Reassign</button>
          </div>
        </div>

        <!-- Business Process Flow Chevron Stepper (DESIGN.md §2.4) -->
        ${this.renderBpfBar(lead)}

        <!-- Dynamics Classic Tabs: Summary / Details / Related -->
        <div class="dynamics-tabs-header">
          <button class="fluent-tab-btn ${this.state.formTab === 'summary' ? 'active' : ''}" onclick="app.setFormTab('summary')">Summary</button>
          <button class="fluent-tab-btn ${this.state.formTab === 'details' ? 'active' : ''}" onclick="app.setFormTab('details')">Requirement Details</button>
          <button class="fluent-tab-btn ${this.state.formTab === 'related' ? 'active' : ''}" onclick="app.setFormTab('related')">Related History & Accounts</button>
        </div>

        <!-- Two Column Content + Docked Timeline -->
        <div class="form-two-column-layout">
          <!-- Left Main Form -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${this.renderFormTabContent(lead, bdm, tag)}
          </div>

          <!-- Right Timeline Pane (Activities) -->
          <div class="timeline-card">
            <div class="timeline-header">
              <span style="font-weight: 600; font-size: 14px;">Activity Timeline</span>
              <button class="fluent-btn fluent-btn-secondary" style="height: 26px; font-size: 11px;" onclick="app.showAddInteractionModal('${lead.id}')">
                + Log Call/Note
              </button>
            </div>

            <div class="timeline-list">
              ${interactions.length === 0 ? `
                <div style="color: var(--color-text-secondary); font-size: 12px; padding: 16px 0;">No activities logged yet.</div>
              ` : interactions.map(i => `
                <div class="timeline-item">
                  <div class="timeline-icon">
                    ${i.type === 'call' ? '📞' : i.type === 'whatsapp' ? '💬' : i.type === 'meeting' ? '👥' : '🏢'}
                  </div>
                  <div class="timeline-body">
                    <div class="timeline-top">
                      <span class="timeline-author">${i.type.toUpperCase()}</span>
                      <span class="timeline-time">${i.created_at.slice(0, 10)}</span>
                    </div>
                    <div class="timeline-notes">${i.notes}</div>
                    ${i.next_action ? `<div class="timeline-action">Next Action: ${i.next_action}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderBpfBar(lead) {
    const stages = ['new', 'contacted', 'follow_up', 'proposal', 'won'];
    const normalizedStatus = lead.status === 'negotiation' ? 'proposal' : lead.status;
    const currentIdx = stages.indexOf(normalizedStatus);

    return `
      <div class="dynamics-bpf-bar">
        ${stages.map((st, idx) => {
          const isCompleted = currentIdx > idx;
          const isActive = currentIdx === idx;
          const label = st.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

          return `
            <div class="bpf-stage ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" onclick="app.advanceStage('${lead.id}', '${st}')">
              <span class="bpf-stage-num">${isCompleted ? '✓' : idx + 1}</span>
              <span>${label}</span>
            </div>
          `;
        }).join('')}

        <button class="bpf-dropoff-btn" onclick="app.branchDropoff('${lead.id}')">
          Mark Lost / Invalid
        </button>
      </div>
    `;
  }

  renderFormTabContent(lead, bdm, tag) {
    if (this.state.formTab === 'details') {
      return `
        <div class="form-section-card">
          <div class="form-section-title">Technical & Custom Requirements</div>
          <div class="form-field-group">
            <label class="form-field-label">Sub-Requirement Summary</label>
            <textarea class="form-field-textarea">${lead.sub_requirement || ''}</textarea>
          </div>
          <div class="form-fields-grid">
            <div class="form-field-group">
              <label class="form-field-label">Attached BRD Document</label>
              <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                <span style="font-size: 13px;">${lead.brd_url ? lead.brd_url.split('/').pop() : 'No BRD uploaded'}</span>
                ${lead.brd_url ? `<button class="fluent-btn fluent-btn-secondary" style="height: 26px;" onclick="app.showToast('Downloading authenticated file from VPS disk...')">Download</button>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.state.formTab === 'related') {
      const acc = this.state.accounts.find(a => a.id === lead.account_id);
      return `
        <div class="form-section-card">
          <div class="form-section-title">Parent Company Account Link</div>
          <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 12px;">
            Accounts allow repeat business, upselling, and reselling to be tracked under a single unified company history.
          </p>
          ${acc ? `
            <div style="background: var(--color-surface-alt); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <h4 style="font-size: 14px; font-weight: 600;">${acc.name}</h4>
              <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">Lifetime Won Revenue: ₹${acc.lifetime_revenue.toLocaleString('en-IN')}</p>
              <button class="fluent-btn fluent-btn-secondary" style="height: 26px; margin-top: 8px;" onclick="app.navigateTo('A-18', { accountId: '${acc.id}' })">
                View Account History ›
              </button>
            </div>
          ` : `
            <div>No Account currently linked to this lead. <button class="fluent-btn fluent-btn-secondary" style="height: 28px;" onclick="app.showToast('Account linker opened')">Link to Account</button></div>
          `}
        </div>
      `;
    }

    // Default 'summary' tab
    return `
      <div class="form-section-card">
        <div class="form-section-title">General Lead Information</div>
        <div class="form-fields-grid">
          <div class="form-field-group">
            <label class="form-field-label">Contact Person</label>
            <input type="text" class="form-field-input" value="${lead.name}" />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Company Name</label>
            <input type="text" class="form-field-input" value="${lead.company_name || ''}" />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Phone Number</label>
            <input type="text" class="form-field-input" value="${lead.phone}" />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Email Address</label>
            <input type="email" class="form-field-input" value="${lead.email || ''}" />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">State</label>
            <input type="text" class="form-field-input" value="${lead.state || ''}" />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">City</label>
            <input type="text" class="form-field-input" value="${lead.city || ''}" />
          </div>
        </div>
      </div>

      <div class="form-section-card">
        <div class="form-section-title">Deal Forecasting & Commercials</div>
        <div class="form-fields-grid">
          <div class="form-field-group">
            <label class="form-field-label">Product / Service Offering</label>
            <select class="form-field-select">
              ${this.state.tags.map(t => `<option value="${t.id}" ${t.id === lead.tag_id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Deal Type</label>
            <select class="form-field-select">
              <option value="new_business" ${lead.deal_type === 'new_business' ? 'selected' : ''}>New Business</option>
              <option value="upsell" ${lead.deal_type === 'upsell' ? 'selected' : ''}>Upsell</option>
              <option value="resell" ${lead.deal_type === 'resell' ? 'selected' : ''}>Resell / Renewal</option>
            </select>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Expected Value (₹ Forecast)</label>
            <input type="number" class="form-field-input" value="${lead.expected_value || ''}" />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Stage Probability (%)</label>
            <input type="text" class="form-field-input" value="${lead.probability_override || STAGE_PROBABILITIES[lead.status]}%" disabled />
          </div>
          ${lead.status === 'won' ? `
            <div class="form-field-group full-width">
              <label class="form-field-label" style="color: var(--color-success);">Closed Won Amount (₹ Mandatory)</label>
              <input type="number" class="form-field-input" value="${lead.won_amount || ''}" />
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // --- SCREEN A-05: Quick Create Lead (DESIGN.md §2.7) ---
  renderA05QuickCreateLead() {
    this.state.quickCreateOpen = true;
    this.state.quickCreateType = 'lead';
    return this.renderA03LeadList();
  }

  // --- SCREEN A-06: Bulk Upload CSV (US-03) ---
  renderA06BulkUpload() {
    return `
      <div class="dynamics-form-container" style="max-width: 800px; margin: 0 auto;">
        <h1 style="font-size: 20px; font-weight: 600;">Bulk Lead Upload (CSV)</h1>
        <p style="font-size: 13px; color: var(--color-text-secondary);">Upload batches of telecaller leads with automatic validation and duplicate detection.</p>

        <div class="form-section-card" style="text-align: center; border: 2px dashed var(--color-border); padding: 40px;">
          <svg width="48" height="48" fill="var(--color-primary)" viewBox="0 0 16 16" style="margin-bottom: 12px;"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V10.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>
          <h3 style="font-size: 15px; font-weight: 600;">Drop CKR_Leads_Upload.csv here</h3>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">Supports UTF-8 CSV with mandatory columns: name, phone, source, tag</p>
          <div style="margin-top: 16px;">
            <button class="fluent-btn fluent-btn-primary" onclick="app.showToast('Validation preview generated: 48 valid rows, 2 duplicates detected')">Choose File</button>
            <button class="fluent-btn fluent-btn-secondary" onclick="app.showToast('Downloaded CKR_Lead_Template.csv')">Download Template</button>
          </div>
        </div>

        <div class="fluent-grid-container">
          <div class="fluent-grid-toolbar">
            <span style="font-weight: 600; font-size: 13px;">Pre-Commit Validation Preview (Sample Batch)</span>
            <span class="status-badge won">48 VALID ROWS</span>
          </div>
          <table class="fluent-grid-table">
            <thead>
              <tr>
                <th>Row</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Validation Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Principal Sharma</td>
                <td>+91 98111 22334</td>
                <td><span class="status-badge won">Valid</span></td>
                <td>Ready to insert</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Vikram Singhania</td>
                <td>+91 98200 45678</td>
                <td><span class="status-badge negotiation">Duplicate Phone</span></td>
                <td><button class="fluent-btn fluent-btn-secondary" style="height: 24px; font-size: 11px;">Skip</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="fluent-btn fluent-btn-secondary" onclick="app.navigateTo('A-03')">Cancel</button>
          <button class="fluent-btn fluent-btn-primary" onclick="app.showToast('Committed 48 leads into pipeline'); app.navigateTo('A-03')">Commit Batch</button>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-07: Assign / Reassign Leads (US-04, US-05) ---
  renderA07AssignLead() {
    const selectedCount = this.state.selectedLeadIds.size || 1;
    const bdms = this.state.users.filter(u => u.role === 'bdm');

    return `
      <div class="dynamics-form-container" style="max-width: 500px; margin: 40px auto;">
        <div class="form-section-card">
          <h2 style="font-size: 18px; font-weight: 600;">Assign Leads to Telecaller</h2>
          <p style="font-size: 13px; color: var(--color-text-secondary);">
            Allocating <strong>${selectedCount} lead(s)</strong> to a sales representative. An in-app notification will be pushed via socket.io immediately.
          </p>

          <div class="form-field-group">
            <label class="form-field-label">Target BDM</label>
            <select class="form-field-select" id="assign-target-bdm">
              ${bdms.map(b => `<option value="${b.id}">${b.name} (${b.employee_id})</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
            <button class="fluent-btn fluent-btn-secondary" onclick="app.navigateTo('A-03')">Cancel</button>
            <button class="fluent-btn fluent-btn-primary" onclick="app.executeAssignment()">Confirm Assignment</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-08: Staff List (Full CRUD Management) ---
  renderA08StaffList() {
    const searchQuery = (this.state.staffSearchQuery || '').toLowerCase();
    const filterStatus = this.state.staffFilterStatus || 'all';

    let users = this.state.users;
    if (filterStatus !== 'all') {
      users = users.filter(u => u.status === filterStatus);
    }
    if (searchQuery) {
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(searchQuery)) ||
        (u.employee_id && u.employee_id.toLowerCase().includes(searchQuery)) ||
        (u.email && u.email.toLowerCase().includes(searchQuery)) ||
        (u.phone && u.phone.includes(searchQuery)) ||
        (u.designation && u.designation.toLowerCase().includes(searchQuery))
      );
    }

    const totalStaff = this.state.users.length;
    const activeStaff = this.state.users.filter(u => u.status === 'active').length;
    const inactiveStaff = this.state.users.filter(u => u.status === 'inactive').length;
    const totalPipeline = this.state.leads
      .filter(l => !['won', 'lost', 'invalid'].includes(l.status))
      .reduce((s, l) => s + (l.expected_value || 0), 0);

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">Total Staff Members</div>
            <div style="font-size: 24px; font-weight: 700; color: var(--color-primary);">${totalStaff}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">${activeStaff} Active · ${inactiveStaff} Inactive</div>
          </div>
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">Active BDMs & Telecallers</div>
            <div style="font-size: 24px; font-weight: 700; color: var(--color-success);">${this.state.users.filter(u => u.role === 'bdm' && u.status === 'active').length}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">Field reps & telecalling agents</div>
          </div>
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">Managed Pipeline</div>
            <div style="font-size: 24px; font-weight: 700; color: #004578;">₹${totalPipeline.toLocaleString('en-IN')}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">Cumulative active deal value</div>
          </div>
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">Attendance Ratio Today</div>
            <div style="font-size: 24px; font-weight: 700; color: #D83B01;">3 / 4 Present</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">1 BDM on Leave (Rahul)</div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="fluent-grid-container">
          <div class="fluent-grid-toolbar" style="flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <!-- Search box -->
              <div class="fluent-search-box" style="width: 260px;">
                <svg class="fluent-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                <input type="text" placeholder="Search staff by name, email, ID..." value="${this.escapeHtml(this.state.staffSearchQuery || '')}" oninput="app.handleStaffSearch(this.value)" />
              </div>

              <!-- Status filter pills -->
              <div style="display: flex; gap: 4px;">
                <button class="ledger-pill-btn ${filterStatus === 'all' ? 'active' : ''}" onclick="app.filterStaffByStatus('all')">All (${totalStaff})</button>
                <button class="ledger-pill-btn ${filterStatus === 'active' ? 'active' : ''}" onclick="app.filterStaffByStatus('active')">Active (${activeStaff})</button>
                <button class="ledger-pill-btn ${filterStatus === 'inactive' ? 'active' : ''}" onclick="app.filterStaffByStatus('inactive')">Inactive (${inactiveStaff})</button>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="fluent-btn fluent-btn-secondary" onclick="app.showToast('Exported staff roster to CSV')">
                📥 Export Staff CSV
              </button>
              <button class="fluent-btn fluent-btn-primary" onclick="app.openStaffModal(null)">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                Add Staff Member
              </button>
            </div>
          </div>

          <table class="fluent-grid-table">
            <thead>
              <tr>
                <th style="width: 220px;">Staff Member</th>
                <th>Role & Designation</th>
                <th>Contact Info</th>
                <th>Department</th>
                <th>Assigned Leads</th>
                <th>Status</th>
                <th style="width: 190px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
                    No staff members match the selected filters.
                  </td>
                </tr>
              ` : users.map(u => {
                const userLeads = this.state.leads.filter(l => l.assigned_to === u.id);
                const activeLeads = userLeads.filter(l => !['won', 'lost', 'invalid'].includes(l.status));
                const wonLeads = userLeads.filter(l => l.status === 'won');
                const initials = (u.name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

                return `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="fluent-avatar" style="width: 32px; height: 32px; font-size: 11px; background: ${u.role === 'admin' ? '#004578' : '#0078D4'};">
                          ${initials}
                        </div>
                        <div>
                          <strong style="color: var(--color-text-primary); display: block; font-size: 13px;">${this.escapeHtml(u.name)}</strong>
                          <span style="font-size: 11px; color: var(--color-text-secondary);">${u.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-weight: 600; font-size: 12px;">${this.escapeHtml(u.designation || 'Staff')}</span>
                        <span style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: ${u.role === 'admin' ? '#004578' : '#107C41'};">
                          ${u.role === 'admin' ? '🛡️ Administrator' : '💼 BDM Sales Rep'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style="font-size: 12px;">
                        <div><a href="mailto:${u.email}" style="color: var(--color-primary); text-decoration: none;">${this.escapeHtml(u.email)}</a></div>
                        <div style="color: var(--color-text-secondary); font-size: 11px;">${this.escapeHtml(u.phone)}</div>
                      </div>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: var(--color-text-secondary);">${this.escapeHtml(u.department || 'Sales')}</span>
                    </td>
                    <td>
                      ${u.role === 'bdm' ? `
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <button class="ledger-pill-btn" onclick="app.openFilteredLeads({ type: 'bdm', value: '${u.id}', label: 'Leads for ${this.escapeHtml(u.name)}' })" title="Click to view all leads assigned to ${this.escapeHtml(u.name)}" style="background: #E8F4FC; color: #004578; font-weight: 600; border-color: #C7E0F4;">
                            📋 ${activeLeads.length} Active (${userLeads.length} total)
                          </button>
                        </div>
                      ` : `
                        <span style="color: var(--color-text-secondary); font-size: 11px;">Super Admin</span>
                      `}
                    </td>
                    <td>
                      <span class="status-badge ${u.status === 'active' ? 'won' : 'lost'}">
                        ${u.status === 'active' ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 4px; justify-content: flex-end;">
                        <button class="fluent-btn fluent-btn-secondary" style="height: 26px; padding: 0 8px; font-size: 11px;" onclick="app.openStaffModal('${u.id}')" title="Edit Staff Details">
                          ✏️ Edit
                        </button>
                        <button class="fluent-btn fluent-btn-secondary" style="height: 26px; padding: 0 8px; font-size: 11px;" onclick="app.triggerPasswordReset('${u.id}')" title="Generate Reset Password Link">
                          🔑 Pass
                        </button>
                        <button class="fluent-btn fluent-btn-secondary danger-cmd" style="height: 26px; padding: 0 8px; font-size: 11px;" onclick="app.openStaffDeleteModal('${u.id}')" title="${u.status === 'active' ? 'Deactivate Staff & Reassign Leads' : 'Reactivate Staff'}">
                          ${u.status === 'active' ? '🗑️ Deactivate' : '♻️ Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-09: Quick Create / Edit Staff (US-32) ---
  renderA09StaffCreateEdit() {
    this.state.staffModalOpen = true;
    this.state.staffModalMode = 'create';
    this.state.staffEditingId = null;
    return this.renderA08StaffList();
  }

  // --- SCREEN A-10: Masters Tags (US-07) ---
  renderA10Masters() {
    return `
      <div class="dynamics-form-container" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 20px; font-weight: 600;">Product & Service Offerings (Tags Master)</h1>
            <p style="font-size: 13px; color: var(--color-text-secondary);">Manage offerings available for lead tagging without code changes.</p>
          </div>
          <button class="fluent-btn fluent-btn-primary" onclick="app.showToast('Tag creator opened')">+ Add Offering Tag</button>
        </div>

        <div class="fluent-grid-container">
          <table class="fluent-grid-table">
            <thead>
              <tr>
                <th>Tag Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.tags.map(t => `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td><span style="font-size: 11px; text-transform: uppercase; font-weight: 600;">${t.type}</span></td>
                  <td><span class="status-badge ${t.is_active ? 'won' : 'invalid'}">${t.is_active ? 'ACTIVE' : 'DEACTIVATED'}</span></td>
                  <td>
                    <button class="fluent-btn fluent-btn-secondary" style="height: 24px; font-size: 11px;" onclick="app.toggleTagStatus('${t.id}')">
                      ${t.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-11: Attendance Matrix (US-16) ---
  renderA11AttendanceMatrix() {
    const dates = ['15', '16', '17', '18', '19', '20', '21', '22'];
    const bdms = this.state.users.filter(u => u.role === 'bdm');

    return `
      <div class="fluent-grid-container">
        <div class="fluent-grid-toolbar">
          <div>
            <span style="font-weight: 600; font-size: 14px;">Monthly Attendance Matrix</span>
            <span style="font-size: 12px; color: var(--color-text-secondary); margin-left: 8px;">September 2026</span>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px;" onclick="app.navigateTo('A-13')">Holidays Calendar</button>
            <button class="fluent-btn fluent-btn-primary" style="height: 28px;" onclick="app.showToast('Exported Attendance Matrix to CSV')">Export</button>
          </div>
        </div>

        <div style="overflow-x: auto; padding: 16px;">
          <table class="attendance-matrix-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 180px;">BDM Staff</th>
                ${dates.map(d => `<th>Sep ${d}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${bdms.map((b, bIdx) => `
                <tr>
                  <td style="text-align: left; font-weight: 600;">${b.name}</td>
                  ${dates.map((d, dIdx) => {
                    let status = 'P';
                    if (d === '20') status = 'HOL'; // Sunday / Holiday
                    else if (bIdx === 2 && d === '22') status = 'L'; // Leave
                    else if (bIdx === 3 && d === '21') status = 'A'; // Absent
                    else if (bIdx === 3 && d === '22') status = 'H'; // Half Day

                    return `
                      <td>
                        <span class="attendance-cell ${status}" onclick="app.navigateTo('A-12', { bdmName: '${b.name}', date: '2026-09-${d}' })" title="Click to edit punch">
                          ${status}
                        </span>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="display: flex; gap: 16px; margin-top: 16px; font-size: 12px;">
            <span><strong style="color: var(--color-success);">P</strong> = Present</span>
            <span><strong style="color: var(--color-error);">A</strong> = Absent</span>
            <span><strong style="color: var(--color-warning);">H</strong> = Half Day</span>
            <span><strong style="color: var(--color-info);">L</strong> = Leave</span>
            <span><strong style="color: var(--color-text-secondary);">HOL</strong> = Holiday</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-12: Attendance Edit (US-14) ---
  renderA12AttendanceEdit() {
    return `
      <div class="dynamics-form-container" style="max-width: 500px; margin: 40px auto;">
        <div class="form-section-card">
          <h2 style="font-size: 18px; font-weight: 600;">Manual Attendance Correction</h2>
          <p style="font-size: 13px; color: var(--color-text-secondary);">Audit record will be stored showing Admin modification.</p>

          <div class="form-field-group">
            <label class="form-field-label">BDM Name</label>
            <input type="text" class="form-field-input" value="Rohan Verma" disabled />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Date</label>
            <input type="text" class="form-field-input" value="2026-09-21" disabled />
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Corrected Status</label>
            <select class="form-field-select">
              <option value="present">Present</option>
              <option value="half_day">Half Day</option>
              <option value="leave" selected>Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <div class="form-field-group">
            <label class="form-field-label">Audit Correction Note (Mandatory)</label>
            <textarea class="form-field-textarea" placeholder="Approved medical leave reported after hours"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
            <button class="fluent-btn fluent-btn-secondary" onclick="app.navigateTo('A-11')">Cancel</button>
            <button class="fluent-btn fluent-btn-primary" onclick="app.showToast('Attendance punch corrected'); app.navigateTo('A-11')">Save Correction</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-13: Holiday Calendar (US-15) ---
  renderA13Holidays() {
    return `
      <div class="dynamics-form-container" style="max-width: 700px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 20px; font-weight: 600;">Official Company Holidays (2026)</h1>
            <p style="font-size: 13px; color: var(--color-text-secondary);">Non-working days are automatically exempt from absent penalties.</p>
          </div>
          <button class="fluent-btn fluent-btn-primary" onclick="app.showToast('Holiday added')">+ Add Holiday</button>
        </div>

        <div class="fluent-grid-container">
          <table class="fluent-grid-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday Occasion</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.holidays.map(h => `
                <tr>
                  <td><strong>${h.date}</strong></td>
                  <td>${h.name}</td>
                  <td><button class="fluent-btn fluent-btn-secondary" style="height: 24px; font-size: 11px;">Remove</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-14: Notifications (US-18) ---
  renderA14Notifications() {
    return `
      <div class="dynamics-form-container" style="max-width: 700px; margin: 0 auto;">
        <h1 style="font-size: 20px; font-weight: 600;">Notifications & Activity Feed</h1>
        <div class="fluent-grid-container">
          <div class="fluent-grid-toolbar">
            <span style="font-size: 13px; font-weight: 600;">System Alerts</span>
            <button class="fluent-btn fluent-btn-secondary" style="height: 24px; font-size: 11px;" onclick="app.showToast('All notifications marked as read')">Mark All Read</button>
          </div>
          <div style="display: flex; flex-direction: column;">
            ${this.state.notifications.map(n => `
              <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; background: ${n.is_read ? 'var(--color-surface)' : 'var(--color-info-bg)'};">
                <div>
                  <div style="font-size: 13px; font-weight: ${n.is_read ? '400' : '600'}; color: var(--color-text-primary);">${n.message}</div>
                  <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">${n.created_at.slice(0, 10)} · In-App Broadcast</div>
                </div>
                ${!n.is_read ? `<span class="status-badge new">Unread</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-15: Export & Reports (US-06) ---
  renderA15Reports() {
    const range = this.getDateRange();
    const fromDate = range.startDate || '2026-09-01';
    const toDate = range.endDate || '2026-09-22';

    return `
      <div class="dynamics-form-container" style="max-width: 650px; margin: 0 auto;">
        <h1 style="font-size: 20px; font-weight: 600;">Export Leads & Attendance Reports</h1>
        <div class="form-section-card">
          <div class="form-field-group">
            <label class="form-field-label">Report Category</label>
            <select class="form-field-select">
              <option>Full Pipeline Leads Export</option>
              <option>Monthly Attendance Matrix</option>
              <option>Daily Telecalling Interaction Rollup</option>
            </select>
          </div>
          <div class="form-fields-grid">
            <div class="form-field-group">
              <label class="form-field-label">Date From</label>
              <input type="date" class="form-field-input" value="${fromDate}" />
            </div>
            <div class="form-field-group">
              <label class="form-field-label">Date To</label>
              <input type="date" class="form-field-input" value="${toDate}" />
            </div>
          </div>
          <button class="fluent-btn fluent-btn-primary" style="margin-top: 12px;" onclick="app.showToast('Downloading CSV Export for ' + app.getDateRange().label + '...')">
            Generate and Download CSV
          </button>
        </div>
      </div>
    `;
  }

  // --- SCREEN A-16: Daily Interaction Report (US-22) ---
  renderA16DailyReport() {
    const range = this.getDateRange();
    const { startDate, endDate, label: rangeLabel } = range;
    let interactions = this.state.interactions;
    if (startDate || endDate) {
      interactions = interactions.filter(i => {
        const dt = (i.created_at || '').slice(0, 10);
        if (startDate && dt < startDate) return false;
        if (endDate && dt > endDate) return false;
        return true;
      });
    }

    return `
      <div class="fluent-grid-container">
        <div class="fluent-grid-toolbar">
          <div>
            <span style="font-weight: 600; font-size: 14px;">Daily Interaction Activity Report</span>
            <span style="font-size: 12px; color: var(--color-text-secondary); margin-left: 8px;">Date Range: ${rangeLabel} (${interactions.length} records)</span>
          </div>

          <button class="fluent-btn fluent-btn-secondary" style="height: 28px;" onclick="app.showToast('Exported Daily Interactions for ' + app.getDateRange().label + ' to CSV')">Export CSV</button>
        </div>

        <div style="background: #FFF9E6; border-bottom: 1px solid #FFE27D; padding: 10px 16px; font-size: 12px; color: #8A6D00;">
          ⚠️ <strong>0-Activity Notice:</strong> Ananya Iyer has logged 0 interactions today despite being marked present.
        </div>

        <table class="fluent-grid-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Telecaller (BDM)</th>
              <th>Lead Name & Company</th>
              <th>Channel</th>
              <th>Notes & Discussion</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>
            ${interactions.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-secondary);">
                  No interaction activities logged within this date range.
                </td>
              </tr>
            ` : interactions.map(i => {
              const bdm = this.state.users.find(u => u.id === i.bdm_id);
              const lead = this.state.leads.find(l => l.id === i.lead_id);
              return `
                <tr>
                  <td>${i.created_at.slice(11, 16)}</td>
                  <td><strong>${bdm ? bdm.name : 'BDM'}</strong></td>
                  <td>${lead ? `${lead.name} (${lead.company_name})` : 'Lead'}</td>
                  <td><span class="status-badge new">${i.type}</span></td>
                  <td>${i.notes}</td>
                  <td><strong style="color: var(--color-primary);">${i.next_action || '—'}</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --- SCREEN A-19: Daily Interaction History & Calling Ledger ---
  renderA19DailyInteractionHistory() {
    const range = this.getDateRange();
    const { startDate, endDate, label: rangeLabel, shortLabel } = range;
    const selectedDate = this.state.selectedDate || endDate || '2026-09-22';
    const activeChannel = this.state.interactionChannelFilter || 'all';
    const activeBdm = this.state.interactionBdmFilter || 'all';
    const searchQuery = (this.state.interactionSearchQuery || '').toLowerCase();

    // Base filtering by active date range
    let list = this.state.interactions;
    if (startDate || endDate) {
      list = list.filter(i => {
        const dt = (i.created_at || '').slice(0, 10);
        if (startDate && dt < startDate) return false;
        if (endDate && dt > endDate) return false;
        return true;
      });
    }
    const allDateInteractions = list;

    // Filter by channel
    if (activeChannel !== 'all') {
      list = list.filter(i => i.type === activeChannel);
    }

    // Filter by BDM
    if (activeBdm !== 'all') {
      list = list.filter(i => i.bdm_id === activeBdm);
    }

    // Search query
    if (searchQuery) {
      list = list.filter(i => {
        const lead = this.state.leads.find(l => l.id === i.lead_id);
        const bdm = this.state.users.find(u => u.id === i.bdm_id);
        return (
          (i.notes && i.notes.toLowerCase().includes(searchQuery)) ||
          (i.next_action && i.next_action.toLowerCase().includes(searchQuery)) ||
          (lead && lead.name && lead.name.toLowerCase().includes(searchQuery)) ||
          (lead && lead.company_name && lead.company_name.toLowerCase().includes(searchQuery)) ||
          (bdm && bdm.name && bdm.name.toLowerCase().includes(searchQuery))
        );
      });
    }

    // Dynamic metrics
    const totalCount = allDateInteractions.length;
    const callCount = allDateInteractions.filter(i => i.type === 'call').length;
    const waCount = allDateInteractions.filter(i => i.type === 'whatsapp').length;
    const demoCount = allDateInteractions.filter(i => i.type === 'meeting').length;
    const visitCount = allDateInteractions.filter(i => i.type === 'site_visit').length;

    const positiveCount = allDateInteractions.filter(i => i.call_result_type === 'positive').length;
    const neutralCount = allDateInteractions.filter(i => i.call_result_type !== 'positive').length;

    const bdmUsers = this.state.users.filter(u => u.role === 'bdm');
    const selectedBdmUser = bdmUsers.find(u => u.id === activeBdm);

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Clean Compact Sub-Header (Page Title & Date Presets are in Top Command Bar) -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <span style="font-size: 13px; color: var(--color-text-secondary);">
              Showing chronological calling ledger, WhatsApp interactions, and client demos for <strong>${rangeLabel}</strong> (${totalCount} records)
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px;" onclick="app.showToast('Exported interactions for ' + app.getDateRange().label + ' to CSV')">
              📥 Export CSV
            </button>
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px;" onclick="app.render()">
              🔄 Refresh
            </button>
          </div>
        </div>

        <!-- KPI 4-Card Summary Strip -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">Total Interactions</div>
            <div style="font-size: 24px; font-weight: 700; color: var(--color-primary);">${totalCount}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">${callCount} calls · ${waCount} WA · ${demoCount + visitCount} demos/visits</div>
          </div>
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">🟢 Positive Outcomes</div>
            <div style="font-size: 24px; font-weight: 700; color: var(--color-success);">${positiveCount}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">Agreements, demos booked, high interest</div>
          </div>
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">🟡 In Progress / Follow-ups</div>
            <div style="font-size: 24px; font-weight: 700; color: #795B00;">${neutralCount}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">Callbacks requested or ringing/no answer</div>
          </div>
          <div class="fluent-tile-card" style="padding: 14px; gap: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--color-text-secondary);">Active Telecallers</div>
            <div style="font-size: 24px; font-weight: 700; color: #004578;">${allDateInteractions.filter((i, idx, arr) => arr.findIndex(x => x.bdm_id === i.bdm_id) === idx).length} / ${bdmUsers.length}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">BDMs logging activity today</div>
          </div>
        </div>

        <!-- BDM Filter Strip (Track BDM Activity) -->
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 12px; font-weight: 700; color: var(--color-text-secondary);">Filter by Sales Staff (BDM):</span>
            <button class="ledger-pill-btn ${activeBdm === 'all' ? 'active' : ''}" onclick="app.setInteractionBdmFilter('all')">
              All BDMs (${totalCount})
            </button>
            ${bdmUsers.map(u => {
              const uCount = allDateInteractions.filter(i => i.bdm_id === u.id).length;
              return `
                <button class="ledger-pill-btn ${activeBdm === u.id ? 'active' : ''}" onclick="app.setInteractionBdmFilter('${u.id}')">
                  👤 ${this.escapeHtml(u.name)} (${uCount})
                </button>
              `;
            }).join('')}
          </div>

          ${selectedBdmUser ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: var(--color-text-secondary);">Tracking: <strong>${this.escapeHtml(selectedBdmUser.name)}</strong> (${selectedBdmUser.designation})</span>
              <button class="fluent-btn fluent-btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="app.navigateTo('A-03', { bdmId: '${selectedBdmUser.id}' })">
                View ${selectedBdmUser.name.split(' ')[0]}'s Assigned Leads ›
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Channel Filter Chips & Search Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div class="ledger-filter-chips">
            <button class="ledger-pill-btn ${activeChannel === 'all' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('all')">
              All Channels (${allDateInteractions.length})
            </button>
            <button class="ledger-pill-btn ${activeChannel === 'call' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('call')">
              📞 Calls (${callCount})
            </button>
            <button class="ledger-pill-btn ${activeChannel === 'whatsapp' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('whatsapp')">
              💬 WhatsApp (${waCount})
            </button>
            <button class="ledger-pill-btn ${activeChannel === 'meeting' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('meeting')">
              🎥 Demos (${demoCount})
            </button>
            <button class="ledger-pill-btn ${activeChannel === 'site_visit' ? 'active' : ''}" onclick="app.setInteractionChannelFilter('site_visit')">
              🏢 Site Visits (${visitCount})
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <input 
              type="text" 
              class="form-field-input" 
              placeholder="Search contact, notes, next action..." 
              value="${this.escapeHtml(this.state.interactionSearchQuery || '')}" 
              oninput="app.setInteractionSearchQuery(this.value)" 
              style="height: 30px; width: 260px; font-size: 12px;" 
            />
            ${this.state.interactionSearchQuery ? `
              <button class="fluent-btn fluent-btn-secondary" style="height: 30px; font-size: 11px; padding: 0 8px;" onclick="app.setInteractionSearchQuery('')">
                ✕ Clear
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Dense Table with Hairline Dividers -->
        <div class="fluent-grid-container" style="background: var(--color-surface); padding: 0; box-shadow: var(--shadow-level1); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
          ${list.length === 0 ? `
            <div style="text-align: center; padding: 48px 16px; color: var(--color-text-secondary);">
              <div style="font-size: 32px; margin-bottom: 8px;">📅</div>
              <div style="font-weight: 600; font-size: 15px; color: var(--color-text-primary);">No interaction records match the filter</div>
              <div style="font-size: 13px; margin-top: 4px;">
                Date Range: <strong>${rangeLabel}</strong> · Channel: <strong>${activeChannel}</strong> · BDM: <strong>${activeBdm === 'all' ? 'All Staff' : selectedBdmUser ? selectedBdmUser.name : activeBdm}</strong>
              </div>
              <button class="fluent-btn fluent-btn-primary" style="margin-top: 14px;" onclick="app.selectDatePreset('today'); app.setInteractionBdmFilter('all'); app.setInteractionChannelFilter('all');">
                Reset to Today (22 Sep 2026) & Reset Filters
              </button>
            </div>
          ` : `
            <div style="overflow-x: auto;">
              <table class="ledger-table">
                <thead>
                  <tr>
                    <th style="width: 90px;">Time</th>
                    <th style="width: 140px;">BDM Staff</th>
                    <th style="min-width: 180px;">Contact & Institution</th>
                    <th style="width: 110px;">Channel</th>
                    <th style="min-width: 170px;">Call Outcome / Result</th>
                    <th style="min-width: 250px;">Discussion Notes</th>
                    <th style="min-width: 200px;">Next Action Commitment</th>
                    <th style="width: 110px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.map(int => {
                    const bdm = this.state.users.find(u => u.id === int.bdm_id);
                    const lead = this.state.leads.find(l => l.id === int.lead_id);
                    const dateObj = new Date(int.created_at);
                    const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const typeIcon = int.type === 'call' ? '📞' : int.type === 'whatsapp' ? '💬' : int.type === 'meeting' ? '🎥' : int.type === 'site_visit' ? '🏢' : '📝';
                    const typeLabel = int.type === 'call' ? 'Call' : int.type === 'whatsapp' ? 'WhatsApp' : int.type === 'meeting' ? 'Zoom Demo' : int.type === 'site_visit' ? 'Site Visit' : 'Note';

                    const resultClass = int.call_result_type === 'neutral' ? 'result-neutral' :
                                        int.call_result_type === 'negative' ? 'result-negative' : 'result-positive';

                    return `
                      <tr>
                        <td class="nowrap">
                          <strong style="color: var(--color-text-primary); font-size: 12px;">${timeFormatted}</strong>
                          <div style="font-size: 10px; color: var(--color-text-secondary);">${dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </td>
                        <td class="nowrap">
                          <strong>${this.escapeHtml(bdm ? bdm.name : 'Aarav Sharma')}</strong>
                          <div style="font-size: 10px; color: var(--color-text-secondary);">${bdm ? bdm.designation : 'BDM'}</div>
                        </td>
                        <td>
                          <a href="javascript:void(0)" onclick="app.navigateTo('A-04', { leadId: '${int.lead_id}' })" style="font-weight: 700; color: var(--color-primary); text-decoration: none;">
                            ${this.escapeHtml(lead ? lead.name : 'Unknown Contact')}
                          </a>
                          <div style="font-size: 11px; color: var(--color-text-secondary);">🏢 ${this.escapeHtml(lead ? lead.company_name : '—')}</div>
                        </td>
                        <td class="nowrap">
                          <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600; font-size: 12px;">
                            <span>${typeIcon}</span>
                            <span>${typeLabel}</span>
                          </span>
                        </td>
                        <td>
                          <span class="bdm-call-result-pill ${resultClass}" style="display: inline-block;">
                            ${this.escapeHtml(int.call_result_label || 'Activity Logged')}
                          </span>
                        </td>
                        <td style="font-size: 12px; line-height: 16px;">
                          "${this.escapeHtml(int.notes)}"
                        </td>
                        <td>
                          ${int.next_action ? `
                            <div style="font-size: 11px; color: var(--color-primary); font-weight: 600; display: flex; align-items: flex-start; gap: 4px; line-height: 15px;">
                              <span>⏰</span>
                              <span>${this.escapeHtml(int.next_action)}</span>
                            </div>
                          ` : '—'}
                        </td>
                        <td class="nowrap" style="text-align: right;">
                          <button class="fluent-btn fluent-btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="app.navigateTo('A-04', { leadId: '${int.lead_id}' })">
                            Inspect Lead ›
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // --- SCREEN A-17: Accounts Directory (US-29) ---
  renderA17AccountList() {
    return `
      <div class="fluent-grid-container">
        <div class="fluent-grid-toolbar">
          <div>
            <span style="font-weight: 600; font-size: 14px;">Customer Accounts (Parent Entities)</span>
            <span style="font-size: 12px; color: var(--color-text-secondary); margin-left: 8px;">Enables repeat business & upsell/resell tracking</span>
          </div>
          <button class="fluent-btn fluent-btn-primary" onclick="app.showToast('New Account creation opened')">+ New Account</button>
        </div>

        <table class="fluent-grid-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>State & City</th>
              <th>Total Leads</th>
              <th>Won Deals</th>
              <th>Lifetime Won Revenue (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.accounts.map(a => `
              <tr onclick="app.navigateTo('A-18', { accountId: '${a.id}' })">
                <td><strong>${a.name}</strong></td>
                <td>${a.city}, ${a.state}</td>
                <td>${a.total_leads_count}</td>
                <td><strong style="color: var(--color-success);">${a.won_leads_count}</strong></td>
                <td><strong style="font-size: 14px;">₹${a.lifetime_revenue.toLocaleString('en-IN')}</strong></td>
                <td>
                  <button class="fluent-btn fluent-btn-secondary" style="height: 24px; font-size: 11px;">View History ›</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --- SCREEN A-18: Account Detail & Lifetime Value (US-29) ---
  renderA18AccountDetail() {
    const acc = this.state.accounts.find(a => a.id === this.state.activeAccountId) || this.state.accounts[0];
    const relatedLeads = this.state.leads.filter(l => l.account_id === acc.id);

    return `
      <div class="dynamics-form-container">
        <div class="form-header-card">
          <div>
            <h1>${acc.name}</h1>
            <div class="form-meta-row">
              <span>Location: ${acc.city}, ${acc.state}</span>
              <span>Total Lifetime Revenue: <strong style="color: var(--color-success);">₹${acc.lifetime_revenue.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
          <button class="fluent-btn fluent-btn-secondary" onclick="app.navigateTo('A-17')">Back to Accounts</button>
        </div>

        <div class="fluent-grid-container">
          <div class="fluent-grid-toolbar">
            <span style="font-weight: 600; font-size: 13px;">Full Lead History & Upsell Opportunities</span>
          </div>
          <table class="fluent-grid-table">
            <thead>
              <tr>
                <th>Deal Person</th>
                <th>Type</th>
                <th>Forecast (₹)</th>
                <th>Won Value (₹)</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${relatedLeads.map(l => `
                <tr onclick="app.navigateTo('A-04', { leadId: '${l.id}' })">
                  <td><strong>${l.name}</strong></td>
                  <td><span style="font-size: 11px; text-transform: uppercase;">${l.deal_type}</span></td>
                  <td>₹${(l.expected_value || 0).toLocaleString('en-IN')}</td>
                  <td>${l.won_amount ? `₹${l.won_amount.toLocaleString('en-IN')}` : '—'}</td>
                  <td><span class="status-badge ${l.status}">${l.status}</span></td>
                  <td>${l.created_at.slice(0, 10)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================================
  // BDM MOBILE PLATFORM SHELL & SCREENS (~390×844px)
  // ==========================================================
  renderBdmShell() {
    const unreadCount = this.state.notifications.filter(n => !n.is_read).length;
    const currentBdmScreen = this.state.currentScreen;

    return `
      <div class="bdm-canvas-container">
        <div class="bdm-phone-frame">
          <!-- iPhone Top Status Bar -->
          <div class="bdm-status-bar">
            <span>9:41</span>
            <div class="bdm-dynamic-island"></div>
            <span>5G  🔋</span>
          </div>

          <!-- BDM App Main Container -->
          <div class="bdm-app-container">
            <!-- App Bar -->
            <header class="bdm-app-bar">
              <span class="bdm-app-bar-title">${this.getBdmScreenTitle()}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fluent-btn fluent-btn-primary" style="height: 28px; padding: 0 10px; font-size: 11px; font-weight: 600; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);" onclick="app.openLeadCreate()">
                  + Add Lead
                </button>
                <button class="icon-btn-utility" onclick="app.navigateTo('B-09')">
                  <svg width="20" height="20" fill="var(--color-primary)" viewBox="0 0 16 16"><path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.553-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/></svg>
                  ${unreadCount > 0 ? `<span class="bdm-nav-badge" style="top: 2px; right: 2px;">${unreadCount}</span>` : ''}
                </button>
              </div>
            </header>

            <!-- Scrollable Content Area -->
            <div class="bdm-content-area" id="bdm-content-area">
              ${this.renderUnhappyStateWrapper(() => this.renderBdmScreen(currentBdmScreen))}
            </div>

            <!-- Mobile Thumb-Reachable Bottom Nav (4 items) -->
            <nav class="bdm-bottom-nav">
              <button class="bdm-nav-item ${currentBdmScreen === 'B-02' ? 'active' : ''}" onclick="app.navigateTo('B-02')">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146z"/></svg>
                <span>Dashboard</span>
              </button>
              <button class="bdm-nav-item ${['B-05', 'B-06', 'B-07', 'B-08'].includes(currentBdmScreen) ? 'active' : ''}" onclick="app.navigateTo('B-05')">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg>
                <span>My Leads</span>
                <span class="bdm-nav-badge">2</span>
              </button>
              <button class="bdm-nav-item ${['B-03', 'B-04'].includes(currentBdmScreen) ? 'active' : ''}" onclick="app.navigateTo('B-03')">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
                <span>Attendance</span>
              </button>
              <button class="bdm-nav-item ${currentBdmScreen === 'B-09' ? 'active' : ''}" onclick="app.navigateTo('B-09')">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/></svg>
                <span>Alerts</span>
              </button>
            </nav>

            <!-- Won, Dropoff & Quick Create Overlays (inside BDM phone frame) -->
            ${this.renderWonModal()}
            ${this.renderDropoffModal()}
            ${this.renderQuickCreateOverlay()}
          </div>
        </div>
      </div>
    `;
  }

  getBdmScreenTitle() {
    const titles = {
      'B-01': 'Sign In',
      'B-02': 'My Workspace',
      'B-03': 'Daily Attendance Punch',
      'B-04': 'Attendance History',
      'B-05': 'My Assigned Leads',
      'B-06': 'Lead Details',
      'B-07': 'Log Follow-up',
      'B-08': 'Upload Lead BRD',
      'B-09': 'Notifications',
      'B-10': 'Welcome Walkthrough'
    };
    return titles[this.state.currentScreen] || 'CKR Connect';
  }

  renderBdmScreen(sId) {
    switch (sId) {
      case 'B-01': return this.renderB01Login();
      case 'B-02': return this.renderB02Dashboard();
      case 'B-03': return this.renderB03AttendancePunch();
      case 'B-04': return this.renderB04AttendanceHistory();
      case 'B-05': return this.renderB05MyLeads();
      case 'B-06': return this.renderB06LeadDetail();
      case 'B-07': return this.renderB07LogFollowup();
      case 'B-08': return this.renderB08UploadBrd();
      case 'B-09': return this.renderB09Notifications();
      case 'B-10': return this.renderB10WelcomeWalkthrough();
      default: return this.renderB02Dashboard();
    }
  }

  // --- SCREEN B-01: BDM Login ---
  renderB01Login() {
    return `
      <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px 0;">
        <div style="text-align: center;">
          <span class="proto-brand-tag" style="margin-bottom: 8px;">CKR CONNECT</span>
          <h2 style="font-size: 20px; font-weight: 600;">BDM Portal Login</h2>
          <p style="font-size: 13px; color: var(--color-text-secondary); margin-top: 4px;">Sign in to start telecalling & attendance</p>
        </div>

        <div class="bdm-card">
          <div class="form-field-group">
            <label class="form-field-label">Employee ID / Email</label>
            <input type="text" class="form-field-input" value="aarav.sharma@ckrtechnologies.in" />
          </div>
          <div class="form-field-group" style="margin-top: 8px;">
            <label class="form-field-label">Password</label>
            <input type="password" class="form-field-input" value="••••••••••••" />
          </div>
          <button class="fluent-btn fluent-btn-primary" style="height: 44px; margin-top: 16px;" onclick="app.navigateTo('B-02')">
            Sign In to My App
          </button>
        </div>
      </div>
    `;
  }

  // --- SCREEN B-02: BDM Dashboard + Today's Activity & Performance (US-21, US-31) ---
  renderB02Dashboard() {
    const currentTab = this.state.bdmDashboardTab || 'today';

    // My Assigned Leads Breakdown
    const myLeads = this.state.leads.filter(l => l.assigned_to === 'u-02');
    const newUntouchedLeads = myLeads.filter(l => (l.status || '').toLowerCase() === 'new' || l.followup_count === 0);
    const contactedLeads = myLeads.filter(l => (l.status || '').toLowerCase() === 'contacted');
    const followupLeads = myLeads.filter(l => (l.status || '').toLowerCase() === 'follow_up');
    const proposalLeads = myLeads.filter(l => (l.status || '').toLowerCase() === 'proposal' || (l.status || '').toLowerCase() === 'negotiation');
    const wonLeads = myLeads.filter(l => (l.status || '').toLowerCase() === 'won');

    // Counts & Values
    const untouchedValue = newUntouchedLeads.reduce((sum, l) => sum + (l.expected_value || l.budget || 0), 0);
    const proposalValue = proposalLeads.reduce((sum, l) => sum + (l.expected_value || l.budget || 0), 0);
    const wonValue = wonLeads.reduce((sum, l) => sum + (l.won_amount || l.expected_value || 0), 0);
    const totalPipelineValue = myLeads.reduce((sum, l) => sum + (l.expected_value || l.budget || 0), 0);

    // Calculate today's interaction metrics for BDM u-02
    const todayInteractions = this.state.interactions.filter(i => 
      (i.bdm_id === 'u-02' || i.created_by === 'u-02') && 
      (i.created_at && i.created_at.startsWith('2026-09-22'))
    );
    const callCount = todayInteractions.filter(i => i.type === 'call').length;
    const waCount = todayInteractions.filter(i => i.type === 'whatsapp').length;
    const meetingCount = todayInteractions.filter(i => i.type === 'meeting').length;
    const positiveCount = todayInteractions.filter(i => i.call_result_type === 'positive').length;
    const neutralCount = todayInteractions.filter(i => i.call_result_type === 'neutral').length;

    const dailyTarget = 15; // Realistic daily telecalling target
    const progressPercent = Math.min(100, Math.round((todayInteractions.length / dailyTarget) * 100));

    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Header Sub-Tabs (Today's Calling & Activity, Pipeline Funnel, My Performance) -->
        <div style="display: flex; background: var(--color-surface-alt); border-radius: var(--radius-sm); padding: 2px;">
          <button class="proto-btn-toggle ${currentTab === 'today' ? 'active' : ''}" style="flex: 1; height: 32px; font-size: 11px;" onclick="app.setBdmTab('today')">
            Today's Activity
          </button>
          <button class="proto-btn-toggle ${currentTab === 'funnel' ? 'active' : ''}" style="flex: 1; height: 32px; font-size: 11px;" onclick="app.setBdmTab('funnel')">
            Pipeline Funnel
          </button>
          <button class="proto-btn-toggle ${currentTab === 'performance' ? 'active' : ''}" style="flex: 1; height: 32px; font-size: 11px;" onclick="app.setBdmTab('performance')">
            My Performance
          </button>
        </div>

        ${currentTab === 'today' ? `
          <!-- TAB 1: TODAY'S CALLING TARGETS, LEAD MATRIX & CALL RESULTS (USER REQUEST) -->
          
          <!-- Punch Status Card -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #004578; color: #FFFFFF; border-radius: var(--radius-md); padding: 8px 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #107C10;"></span>
              <span style="font-size: 12px; font-weight: 600;">Checked In · 09:28 AM</span>
            </div>
            <button onclick="app.navigateTo('B-03')" style="background: rgba(255,255,255,0.2); border: none; color: #FFF; font-size: 11px; padding: 4px 8px; border-radius: var(--radius-sm); cursor: pointer;">
              Punch Out
            </button>
          </div>

          <!-- BDM Quick Actions Bar -->
          <div style="display: flex; gap: 8px;">
            <button class="fluent-btn fluent-btn-primary" style="flex: 1; height: 34px; font-size: 11px; font-weight: 600; justify-content: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" onclick="app.openLeadCreate()">
              <span>➕</span> <span>Add Inbound Lead</span>
            </button>
            <button class="fluent-btn fluent-btn-secondary" style="flex: 1; height: 34px; font-size: 11px; justify-content: center; gap: 6px;" onclick="app.navigateTo('B-05')">
              <span>📋</span> <span>My Pipeline (${myLeads.length})</span>
            </button>
          </div>

          <!-- HIGH URGENCY ALERT: UNTOUCHED LEADS (USER REQUEST) -->
          ${newUntouchedLeads.length > 0 ? `
            <div class="bdm-untouched-alert">
              <div>
                <div style="font-weight: 700; font-size: 13px; color: #78350F;">
                  ⚡ ${newUntouchedLeads.length} Inbound Leads Untouched!
                </div>
                <div style="font-size: 11px; color: #92400E; margin-top: 2px;">
                  Assigned today. Dial immediately to meet daily first-response target!
                </div>
              </div>
              <button class="fluent-btn fluent-btn-primary" style="height: 32px; font-size: 11px; white-space: nowrap; background: #D97706; border-color: #B45309;" onclick="app.openBdmLeadsByStage('NEW')">
                Call Now (${newUntouchedLeads.length}) ›
              </button>
            </div>
          ` : ''}

          <!-- MY ASSIGNED LEADS STATUS & BREAKDOWN MATRIX (USER REQUEST) -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 0 2px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
                MY LEADS PIPELINE MATRIX
              </span>
              <span style="font-size: 11px; color: var(--color-primary); cursor: pointer; font-weight: 600;" onclick="app.openBdmLeadsByStage('all')">
                View All (${myLeads.length}) ›
              </span>
            </div>

            <!-- 2-Column Clickable Status Grid -->
            <div class="bdm-lead-matrix">
              <!-- Untouched / New Leads Card -->
              <div class="bdm-lead-matrix-card untouched-urgent" onclick="app.openBdmLeadsByStage('NEW')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 11px; font-weight: 700; color: #92400E;">⚡ NEW / UNTOUCHED</span>
                  <span style="font-size: 16px; font-weight: 800; color: #B45309;">${newUntouchedLeads.length}</span>
                </div>
                <div style="margin-top: 6px;">
                  <div style="font-size: 11px; color: #78350F; font-weight: 600;">₹${(untouchedValue / 100000).toFixed(1)}L Pipeline</div>
                  <div style="font-size: 10px; color: #B45309;">0 calls made · High Priority</div>
                </div>
              </div>

              <!-- Follow-ups Due Card -->
              <div class="bdm-lead-matrix-card" style="border-left: 4px solid var(--color-warning);" onclick="app.openBdmLeadsByUrgency('today')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary);">⏰ FOLLOW-UPS DUE</span>
                  <span style="font-size: 16px; font-weight: 800; color: var(--color-warning);">${followupLeads.length}</span>
                </div>
                <div style="margin-top: 6px;">
                  <div style="font-size: 11px; color: var(--color-text-primary); font-weight: 600;">1 Overdue · 1 Today</div>
                  <div style="font-size: 10px; color: var(--color-text-secondary);">Scheduled callbacks</div>
                </div>
              </div>

              <!-- In Contacted / Active Card -->
              <div class="bdm-lead-matrix-card" style="border-left: 4px solid #0078D4;" onclick="app.openBdmLeadsByStage('CONTACTED')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary);">📞 CONTACTED</span>
                  <span style="font-size: 16px; font-weight: 800; color: var(--color-primary);">${contactedLeads.length}</span>
                </div>
                <div style="margin-top: 6px;">
                  <div style="font-size: 11px; color: var(--color-text-primary); font-weight: 600;">₹2.6L Pipeline</div>
                  <div style="font-size: 10px; color: var(--color-text-secondary);">First contact done</div>
                </div>
              </div>

              <!-- In Proposal Card -->
              <div class="bdm-lead-matrix-card" style="border-left: 4px solid #8E44AD;" onclick="app.openBdmLeadsByStage('PROPOSAL')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary);">📄 PROPOSAL</span>
                  <span style="font-size: 16px; font-weight: 800; color: #8E44AD;">${proposalLeads.length}</span>
                </div>
                <div style="margin-top: 6px;">
                  <div style="font-size: 11px; color: var(--color-text-primary); font-weight: 600;">₹${(proposalValue / 100000).toFixed(1)}L Expected</div>
                  <div style="font-size: 10px; color: var(--color-text-secondary);">Awaiting client closure</div>
                </div>
              </div>

              <!-- Deals Won Card -->
              <div class="bdm-lead-matrix-card won-highlight" onclick="app.openBdmLeadsByStage('WON')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 11px; font-weight: 700; color: #1E4620;">🏆 DEALS WON</span>
                  <span style="font-size: 16px; font-weight: 800; color: #2E7D32;">${wonLeads.length}</span>
                </div>
                <div style="margin-top: 6px;">
                  <div style="font-size: 11px; color: #2E7D32; font-weight: 700;">₹${(wonValue / 100000).toFixed(2)}L Won</div>
                  <div style="font-size: 10px; color: #1E4620;">Closed this month</div>
                </div>
              </div>

              <!-- All Assigned Total Card -->
              <div class="bdm-lead-matrix-card" onclick="app.openBdmLeadsByStage('all')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary);">📋 TOTAL ASSIGNED</span>
                  <span style="font-size: 16px; font-weight: 800; color: var(--color-text-primary);">${myLeads.length}</span>
                </div>
                <div style="margin-top: 6px;">
                  <div style="font-size: 11px; color: var(--color-text-primary); font-weight: 600;">₹${(totalPipelineValue / 100000).toFixed(1)}L Total</div>
                  <div style="font-size: 10px; color: var(--color-text-secondary);">Tap to filter & search ›</div>
                </div>
              </div>
            </div>
          </div>

          <!-- DAILY CALLING TARGET & RESULTS SCORECARD (USER REQUEST) -->
          <div class="bdm-card" style="border-top: 3px solid var(--color-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
                DAILY CALLING TARGET & PERFORMANCE
              </span>
              <span style="font-size: 11px; font-weight: 700; color: var(--color-primary);">${progressPercent}% COMPLETED</span>
            </div>
            
            <div style="display: flex; align-items: baseline; justify-content: space-between; margin-top: 6px;">
              <div style="font-size: 20px; font-weight: 700; color: var(--color-text-primary);">
                ${todayInteractions.length} <span style="font-size: 13px; font-weight: 400; color: var(--color-text-secondary);">/ ${dailyTarget} Calls Logged Today</span>
              </div>
              <span style="font-size: 12px; color: ${progressPercent >= 50 ? 'var(--color-success)' : 'var(--color-warning)'}; font-weight: 600;">
                ${dailyTarget - todayInteractions.length} more to target
              </span>
            </div>

            <!-- Progress Meter -->
            <div class="bdm-progress-track" style="margin-top: 8px; height: 8px;">
              <div class="bdm-progress-fill" style="width: ${progressPercent}%; background: ${progressPercent >= 80 ? 'var(--color-success)' : 'var(--color-primary)'};"></div>
            </div>

            <!-- Call Result / Outcome Badges Breakdown (USER REQUEST) -->
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--color-border);">
              <div style="font-size: 11px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 6px;">
                TODAY'S CALL RESULTS SUMMARY:
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <span class="bdm-call-result-pill positive">
                  🟢 ${positiveCount} Positive / Next Step Set
                </span>
                <span class="bdm-call-result-pill neutral">
                  🟡 ${neutralCount} Ringing / No Answer
                </span>
                <span class="bdm-call-result-pill positive" style="background:#F0F9FF; color:#0369A1; border-color:#0284C7;">
                  👥 ${meetingCount} Demo Completed
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Action Bar -->
          <div style="display: flex; gap: 8px;">
            <button class="fluent-btn fluent-btn-primary" style="flex: 1; height: 38px; font-weight: 600;" onclick="app.navigateTo('B-07')">
              + Log Call / Interaction
            </button>
            <button class="fluent-btn fluent-btn-secondary" style="height: 38px; padding: 0 12px;" onclick="app.navigateTo('B-05')">
              Filter My Leads ›
            </button>
          </div>

          <!-- Today's Call Ledger & Results Feed Header (USER REQUEST) -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 2px 0 2px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--color-text-primary);">
              Today's Call Ledger & Results (${todayInteractions.length})
            </div>
            <span style="font-size: 11px; color: var(--color-text-secondary);">22 Sep 2026</span>
          </div>

          <!-- Chronological Today's Calls with Results -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${todayInteractions.map(int => {
              const lead = this.state.leads.find(l => l.id === int.lead_id) || {};
              const timeFormatted = new Date(int.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
              const icon = int.type === 'call' ? '📞' : int.type === 'whatsapp' ? '💬' : '👥';
              const resultPillClass = int.call_result_type === 'positive' ? 'positive' : int.call_result_type === 'neutral' ? 'neutral' : 'negative';

              return `
                <div class="bdm-card" style="padding: 12px; cursor: pointer; transition: transform 0.15s ease;" onclick="app.navigateTo('B-06', { leadId: '${int.lead_id}' })">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 14px;">${icon}</span>
                        <strong style="font-size: 13px; color: var(--color-text-primary);">${lead.name || 'Contact'}</strong>
                      </div>
                      <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 1px;">
                        ${lead.company_name || 'Individual'}
                      </div>
                    </div>

                    <!-- Call Result Outcome Badge (USER REQUEST) -->
                    <div style="text-align: right;">
                      <span class="bdm-call-result-pill ${resultPillClass}">
                        ${int.call_result_label || 'Call Logged'}
                      </span>
                      <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 2px;">${timeFormatted}</div>
                    </div>
                  </div>

                  <div style="font-size: 12px; color: var(--color-text-primary); margin-top: 6px; background: var(--color-surface-alt); padding: 6px 8px; border-radius: var(--radius-sm); border-left: 2px solid var(--color-primary);">
                    "${this.escapeHtml(int.notes)}"
                  </div>

                  ${int.next_action ? `
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-primary); font-weight: 500; margin-top: 6px;">
                      <span>⏰ Next Action:</span>
                      <span>${this.escapeHtml(int.next_action)}</span>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        ` : currentTab === 'funnel' ? `
          <!-- TAB 2: PIPELINE FUNNEL -->
          <!-- Quick Status Card -->
          <div class="bdm-card" style="background: linear-gradient(135deg, #0067B8 0%, #004578 100%); color: #FFFFFF;">
            <div style="font-size: 12px; opacity: 0.85;">PUNCH STATUS: TODAY</div>
            <div style="font-size: 20px; font-weight: 700; margin: 4px 0;">Checked In · 09:28 AM</div>
            <div style="font-size: 12px; opacity: 0.85;">2 Follow-ups Due Today · 2 Untouched</div>
          </div>

          <!-- Urgent Leads Alert -->
          <div class="bdm-card" style="border-left: 4px solid var(--color-warning);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>Due Today</strong>
              <span class="status-badge negotiation">Action Required</span>
            </div>
            <div style="font-size: 13px; margin-top: 4px;">Dr. Rajeshwar Rao (Heritage Valley)</div>
            <button class="fluent-btn fluent-btn-secondary" style="height: 32px; margin-top: 8px;" onclick="app.navigateTo('B-06', { leadId: 'lead-101' })">
              Open Lead & Log Call ›
            </button>
          </div>

          <!-- My Pipeline Stages -->
          <div class="bdm-card">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">My Active Pipeline</div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between;">
                <span>New / Untouched (₹8.0L)</span>
                <strong style="color: #D97706;">2 leads</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Proposal (₹10.3L expected)</span>
                <strong>${proposalLeads.length} leads</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Follow-up (₹6.0L expected)</span>
                <strong>2 leads</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Contacted (₹2.6L expected)</span>
                <strong>1 lead</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Won Revenue</span>
                <strong style="color: var(--color-success);">₹4,50,000</strong>
              </div>
            </div>
          </div>
        ` : `
          <!-- TAB 3: US-31: My Performance Section (Self-Scoped Only, No Peer Leaderboard) -->
          <div class="bdm-card">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">MY PERFORMANCE METRICS</span>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
              <div style="background: var(--color-surface-alt); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 11px; color: var(--color-text-secondary);">REVENUE WON</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--color-success);">₹4.50L</div>
              </div>
              <div style="background: var(--color-surface-alt); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 11px; color: var(--color-text-secondary);">WEIGHTED PIPE</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--color-primary);">₹4.16L</div>
              </div>
              <div style="background: var(--color-surface-alt); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 11px; color: var(--color-text-secondary);">AVG DEAL SIZE</div>
                <div style="font-size: 18px; font-weight: 700;">₹4.50L</div>
              </div>
              <div style="background: var(--color-surface-alt); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 11px; color: var(--color-text-secondary);">CONVERSION RATE</div>
                <div style="font-size: 18px; font-weight: 700;">25%</div>
              </div>
            </div>

            <!-- Performance Trend Chart -->
            <div style="margin-top: 16px;">
              <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Weekly Deal Progress</div>
              <div style="display: flex; align-items: flex-end; gap: 12px; height: 100px; padding-top: 16px; border-bottom: 1px solid var(--color-border);">
                <div style="flex: 1; height: 30%; background: var(--color-primary); border-radius: 2px; text-align: center; font-size: 10px; color: #FFF;">W1</div>
                <div style="flex: 1; height: 50%; background: var(--color-primary); border-radius: 2px; text-align: center; font-size: 10px; color: #FFF;">W2</div>
                <div style="flex: 1; height: 90%; background: var(--color-success); border-radius: 2px; text-align: center; font-size: 10px; color: #FFF;">W3</div>
                <div style="flex: 1; height: 60%; background: var(--color-primary); border-radius: 2px; text-align: center; font-size: 10px; color: #FFF;">W4</div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  // --- SCREEN B-03: Attendance Punch (US-13) ---
  renderB03AttendancePunch() {
    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="punch-hero-card">
          <div style="font-size: 14px; opacity: 0.9;">TODAY · 22 SEPTEMBER 2026</div>
          <div class="btn-punch-action ${this.state.bdmPunchedIn ? 'punched-out' : ''}" onclick="app.toggleBdmPunch()">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3.5a.5.5 0 0 1-.5-.5v-3.5A.5.5 0 0 1 8 4z"/></svg>
            <span>${this.state.bdmPunchedIn ? 'PUNCH OUT' : 'PUNCH IN'}</span>
          </div>
          <div style="font-size: 13px;">
            ${this.state.bdmPunchedIn ? `Checked in at ${this.state.lastPunchTime}` : 'Not checked in yet'}
          </div>
        </div>

        <button class="fluent-btn fluent-btn-secondary" style="height: 40px;" onclick="app.navigateTo('B-04')">
          View Monthly Attendance History ›
        </button>
      </div>
    `;
  }

  // --- SCREEN B-04: Attendance History (US-17) ---
  renderB04AttendanceHistory() {
    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="bdm-card">
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span>September 2026 Summary</span>
            <strong style="color: var(--color-success);">18 Days Present</strong>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="bdm-card" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600;">22 Sep 2026 (Today)</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">In: 09:28 AM · Active</div>
            </div>
            <span class="status-badge won">Present</span>
          </div>

          <div class="bdm-card" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600;">21 Sep 2026 (Yesterday)</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">In: 09:30 AM · Out: 06:45 PM</div>
            </div>
            <span class="status-badge won">Present</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN B-05: My Assigned Leads (US-08, US-12, Search & Filter) ---
  renderB05MyLeads() {
    const rawMyLeads = this.state.leads.filter(l => l.assigned_to === 'u-02');
    
    // Quick filter metrics
    const allCount = rawMyLeads.length;
    const untouchedCount = rawMyLeads.filter(l => (l.status || '').toLowerCase() === 'new' || l.followup_count === 0).length;
    const contactedCount = rawMyLeads.filter(l => (l.status || '').toLowerCase() === 'contacted').length;
    const followupCount = rawMyLeads.filter(l => (l.status || '').toLowerCase() === 'follow_up').length;
    const proposalCount = rawMyLeads.filter(l => (l.status || '').toLowerCase() === 'proposal' || (l.status || '').toLowerCase() === 'negotiation').length;
    const overdueCount = rawMyLeads.filter(l => l.id === 'lead-102').length;
    const dueTodayCount = rawMyLeads.filter(l => l.id === 'lead-101' || l.id === 'lead-110').length;
    const wonCount = rawMyLeads.filter(l => (l.status || '').toUpperCase() === 'WON').length;

    // Filter by live text query
    let filteredLeads = rawMyLeads;
    const query = (this.state.bdmSearchQuery || '').trim().toLowerCase();
    if (query) {
      filteredLeads = filteredLeads.filter(l => 
        (l.name && l.name.toLowerCase().includes(query)) ||
        (l.company_name && l.company_name.toLowerCase().includes(query)) ||
        (l.phone && l.phone.toLowerCase().includes(query)) ||
        (l.city && l.city.toLowerCase().includes(query)) ||
        (l.email && l.email.toLowerCase().includes(query))
      );
    }

    // Filter by urgency
    if (this.state.bdmFilterUrgency === 'overdue') {
      filteredLeads = filteredLeads.filter(l => l.id === 'lead-102');
    } else if (this.state.bdmFilterUrgency === 'today') {
      filteredLeads = filteredLeads.filter(l => l.id === 'lead-101' || l.id === 'lead-110');
    } else if (this.state.bdmFilterUrgency === 'won') {
      filteredLeads = filteredLeads.filter(l => (l.status || '').toUpperCase() === 'WON');
    }

    // Filter by pipeline stage
    if (this.state.bdmFilterStage !== 'all') {
      if (this.state.bdmFilterStage === 'NEW') {
        filteredLeads = filteredLeads.filter(l => (l.status || '').toUpperCase() === 'NEW' || l.followup_count === 0);
      } else if (this.state.bdmFilterStage === 'PROPOSAL') {
        filteredLeads = filteredLeads.filter(l => (l.status || '').toUpperCase() === 'PROPOSAL' || (l.status || '').toUpperCase() === 'NEGOTIATION');
      } else {
        filteredLeads = filteredLeads.filter(l => (l.status || '').toUpperCase() === this.state.bdmFilterStage.toUpperCase());
      }
    }

    const hasActiveFilters = Boolean(query || this.state.bdmFilterUrgency !== 'all' || this.state.bdmFilterStage !== 'all');

    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Header row with count and + Add Lead -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 2px 0 2px;">
          <div>
            <span style="font-size: 13px; font-weight: 700;">My Pipeline</span>
            <span style="font-size: 11px; color: var(--color-text-secondary); margin-left: 6px;">(${rawMyLeads.length} leads assigned)</span>
          </div>
          <button class="fluent-btn fluent-btn-primary" style="height: 28px; padding: 0 12px; font-size: 11px; font-weight: 600; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);" onclick="app.openLeadCreate()">
            + Add Lead
          </button>
        </div>

        <!-- Search Bar with Live Filter & Clear Button -->
        <div class="bdm-search-box">
          <svg class="bdm-search-icon-left" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input 
            type="text" 
            id="bdm-lead-search-input"
            class="bdm-search-input" 
            placeholder="Search school, contact, phone, city..." 
            value="${this.escapeHtml(this.state.bdmSearchQuery)}" 
            oninput="app.setBdmSearch(this.value)"
          />
          ${this.state.bdmSearchQuery ? `
            <button class="bdm-search-clear-btn" onclick="app.setBdmSearch('')" title="Clear search">✕</button>
          ` : ''}
        </div>

        <!-- Urgency Quick Filter Chips (Horizontal Scrolling) -->
        <div class="bdm-filter-chips-scroll">
          <button class="bdm-filter-chip ${this.state.bdmFilterUrgency === 'all' ? 'active' : ''}" onclick="app.setBdmUrgencyFilter('all')">
            All (${allCount})
          </button>
          <button class="bdm-filter-chip chip-error ${this.state.bdmFilterUrgency === 'overdue' ? 'active' : ''}" onclick="app.setBdmUrgencyFilter('overdue')">
            🚨 Overdue (${overdueCount})
          </button>
          <button class="bdm-filter-chip chip-warning ${this.state.bdmFilterUrgency === 'today' ? 'active' : ''}" onclick="app.setBdmUrgencyFilter('today')">
            ⏰ Due Today (${dueTodayCount})
          </button>
          <button class="bdm-filter-chip chip-success ${this.state.bdmFilterUrgency === 'won' ? 'active' : ''}" onclick="app.setBdmUrgencyFilter('won')">
            🏆 Won (${wonCount})
          </button>
        </div>

        <!-- Stage Filter Pills with Live Lead Counts -->
        <div class="bdm-filter-chips-scroll" style="margin-top: -2px;">
          <button class="bdm-filter-chip ${this.state.bdmFilterStage === 'all' ? 'active' : ''}" onclick="app.setBdmStageFilter('all')">
            All Stages (${allCount})
          </button>
          <button class="bdm-filter-chip ${this.state.bdmFilterStage === 'NEW' ? 'active' : ''}" style="${this.state.bdmFilterStage === 'NEW' ? '' : 'border-color: #F7B500; color: #B45309;'}" onclick="app.setBdmStageFilter('NEW')">
            ⚡ Untouched (${untouchedCount})
          </button>
          <button class="bdm-filter-chip ${this.state.bdmFilterStage === 'FOLLOW_UP' ? 'active' : ''}" onclick="app.setBdmStageFilter('FOLLOW_UP')">
            Follow-up (${followupCount})
          </button>
          <button class="bdm-filter-chip ${this.state.bdmFilterStage === 'PROPOSAL' ? 'active' : ''}" onclick="app.setBdmStageFilter('PROPOSAL')">
            Proposal (${proposalCount})
          </button>
          <button class="bdm-filter-chip ${this.state.bdmFilterStage === 'CONTACTED' ? 'active' : ''}" onclick="app.setBdmStageFilter('CONTACTED')">
            Contacted (${contactedCount})
          </button>
          <button class="bdm-filter-chip ${this.state.bdmFilterStage === 'WON' ? 'active' : ''}" onclick="app.setBdmStageFilter('WON')">
            Won (${wonCount})
          </button>
        </div>

        <!-- Results Counter & Reset Action -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--color-text-secondary); margin: 2px 2px;">
          <span>Showing <strong>${filteredLeads.length}</strong> of ${allCount} leads</span>
          ${hasActiveFilters ? `
            <button onclick="app.clearBdmFilters()" style="background: none; border: none; color: var(--color-primary); font-size: 11px; font-weight: 600; cursor: pointer; padding: 0;">
              Reset Filters
            </button>
          ` : ''}
        </div>

        <!-- Leads List -->
        ${filteredLeads.length === 0 ? `
          <div class="bdm-card" style="text-align: center; padding: 32px 16px;">
            <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">No matching leads</div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">Try adjusting your search terms or active filter chips.</div>
            <button class="fluent-btn fluent-btn-secondary" style="height: 32px; font-size: 12px;" onclick="app.clearBdmFilters()">
              Clear All Filters
            </button>
          </div>
        ` : filteredLeads.map(l => {
          const isOverdue = l.id === 'lead-102';
          const isDueToday = l.id === 'lead-101' || l.id === 'lead-110';
          const isWon = (l.status || '').toUpperCase() === 'WON';
          const isUntouched = (l.status || '').toUpperCase() === 'NEW' || l.followup_count === 0;

          return `
            <div class="bdm-lead-card ${isOverdue ? 'overdue' : isDueToday ? 'due-today' : isWon ? 'won' : isUntouched ? 'untouched' : ''}" style="cursor: pointer;" onclick="app.navigateTo('B-06', { leadId: '${l.id}' })">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="font-size: 14px; color: var(--color-text-primary);">${l.name}</strong>
                    ${isUntouched ? `<span style="font-size: 10px; font-weight: 700; background: #FFF4CE; color: #78350F; padding: 1px 5px; border-radius: 3px; border: 1px solid #F2C94C;">⚡ Untouched</span>` : ''}
                  </div>
                  <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px;">
                    🏢 ${l.company_name || 'Individual'} ${l.city ? `· 📍 ${l.city}` : ''}
                  </div>
                </div>
                <span class="status-badge ${l.status}">${l.status}</span>
              </div>

              <!-- Quick Communication Action Row -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--color-border); font-size: 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <strong style="font-size: 13px; color: var(--color-text-primary);">₹${(l.expected_value || l.budget || 0).toLocaleString('en-IN')}</strong>
                  ${isOverdue ? `<span style="color: var(--color-error); font-weight: 700; font-size: 11px;">🚨 Overdue</span>` : ''}
                  ${isDueToday && !isOverdue ? `<span style="color: var(--color-warning); font-weight: 700; font-size: 11px;">⏰ Due Today</span>` : ''}
                  ${isWon ? `<span style="color: var(--color-success); font-weight: 700; font-size: 11px;">🏆 Deal Won</span>` : ''}
                  ${isUntouched && !isDueToday && !isOverdue ? `<span style="color: #B45309; font-weight: 600; font-size: 11px;">0 Calls Made</span>` : ''}
                </div>

                <!-- Instant Action Buttons (Stop Propagation to stay in list) -->
                <div style="display: flex; gap: 6px;" onclick="event.stopPropagation()">
                  <a href="tel:${l.phone}" class="fluent-btn ${isUntouched ? 'fluent-btn-primary' : 'fluent-btn-secondary'}" style="height: 28px; padding: 0 8px; font-size: 11px; text-decoration: none;" title="Call ${l.name}">
                    📞 Call
                  </a>
                  <a href="https://wa.me/${(l.phone || '').replace(/[^0-9]/g, '')}" class="fluent-btn fluent-btn-secondary" style="height: 28px; padding: 0 8px; font-size: 11px; text-decoration: none;" title="WhatsApp ${l.name}">
                    💬 WA
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --- SCREEN B-06: Mobile Lead Detail (US-09, US-24) ---
  // --- SCREEN B-06: Mobile Lead Detail & Stepper + Waterfall History (US-06, US-09, US-10) ---
  renderB06LeadDetail() {
    const lead = this.state.leads.find(l => l.id === this.state.activeLeadId) || this.state.leads[0];
    const tag = this.state.tags.find(t => t.id === lead.tag_id);
    const assignedUser = this.state.users.find(u => u.id === lead.assigned_to);
    const account = this.state.accounts.find(a => a.id === lead.account_id);
    
    // Sort all interactions for this lead: newest first
    const leadInteractions = (this.state.interactions || [])
      .filter(i => i.lead_id === lead.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const isOverdue = lead.id === 'lead-102' || (lead.next_followup_date && lead.next_followup_date < '2026-09-22');
    const isDueToday = lead.next_followup_date === '2026-09-22';
    const isWon = (lead.status || '').toUpperCase() === 'WON';
    const isUntouched = (lead.status || '').toUpperCase() === 'NEW' || (lead.followup_count === 0 && leadInteractions.length === 0);

    const createdFormatted = new Date(lead.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    const probability = lead.probability_override || (
      lead.status === 'won' ? 100 :
      lead.status === 'proposal' ? 75 :
      lead.status === 'follow_up' ? 50 :
      lead.status === 'contacted' ? 25 : 10
    );

    return `
      <div style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 24px;">
        <!-- Top Navigation Header -->
        <div class="bdm-detail-header-bar">
          <button class="bdm-back-btn" onclick="app.navigateTo('B-05')">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
            My Leads
          </button>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary); letter-spacing: 0.5px;">LEAD PROFILE</span>
          <span class="status-badge ${lead.status}">${lead.status}</span>
        </div>

        <!-- 1. Key Entity Header Card -->
        <div class="bdm-detail-card" style="border-top: 3px solid ${isWon ? 'var(--color-success)' : isOverdue ? 'var(--color-error)' : isDueToday ? 'var(--color-warning)' : isUntouched ? '#D97706' : 'var(--color-primary)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <h3 style="font-size: 17px; font-weight: 700; color: var(--color-text-primary); margin: 0;">${this.escapeHtml(lead.name)}</h3>
                ${isUntouched ? `<span style="font-size: 10px; font-weight: 700; background: #FFF4CE; color: #78350F; padding: 2px 6px; border-radius: 4px; border: 1px solid #F2C94C;">⚡ Untouched</span>` : ''}
              </div>
              <div style="font-size: 13px; color: var(--color-text-secondary); margin-top: 3px;">
                🏢 ${this.escapeHtml(lead.company_name)} ${lead.city ? `· 📍 ${this.escapeHtml(lead.city)}, ${this.escapeHtml(lead.state || '')}` : ''}
              </div>
            </div>
          </div>

          <!-- Deal Highlight Metrics -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--color-surface-alt); padding: 8px 10px; border-radius: var(--radius-sm); margin-top: 4px;">
            <div>
              <div style="font-size: 10px; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 600;">Forecast Value</div>
              <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">₹${(lead.expected_value || lead.budget || 0).toLocaleString('en-IN')}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 700; text-transform: uppercase; background: ${lead.priority === 'high' ? '#FDE7E9; color: #A80000; border: 1px solid #F7B5B9;' : '#E8F4FC; color: #005A9E; border: 1px solid #C7E0F4;'}">
                ${(lead.priority || 'medium').toUpperCase()} PRIORITY
              </span>
              <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">
                ${lead.deal_type === 'new_business' ? 'New Business' : 'Upsell'} · ${probability}% Win
              </div>
            </div>
          </div>

          <!-- Direct Communication Touch Targets (US-06) -->
          <div class="bdm-contact-actions-row">
            <a href="tel:${lead.phone}" class="bdm-contact-btn btn-call" onclick="app.showToast('Initiating cellular dialer to ${lead.phone}')">
              <span style="font-size: 14px;">📞</span>
              <span>Call Now</span>
            </a>
            <a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" target="_blank" class="bdm-contact-btn btn-wa" onclick="app.showToast('Opening WhatsApp chat with ${lead.name}')">
              <span style="font-size: 14px;">💬</span>
              <span>WhatsApp</span>
            </a>
            <a href="mailto:${lead.email}" class="bdm-contact-btn" onclick="app.showToast('Opening email client for ${lead.email}')">
              <span style="font-size: 14px;">✉️</span>
              <span>Send Email</span>
            </a>
          </div>
        </div>

        <!-- 2. Pipeline Progress Stepper (BPF) -->
        <div class="bdm-detail-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--color-text-primary);">Pipeline Progress</span>
            <span style="font-size: 10px; color: var(--color-text-secondary);">Tap chevron to advance stage</span>
          </div>
          ${this.renderBpfBar(lead)}
        </div>

        <!-- 3. Primary Actions -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${!isWon ? `
            <button class="fluent-btn fluent-btn-primary" style="height: 44px; background: var(--color-success); border-color: var(--color-success); font-weight: 700; font-size: 14px;" onclick="app.openWonModal('${lead.id}')">
              🏆 Close Deal as Won
            </button>
          ` : `
            <div style="background: var(--color-success-bg); color: var(--color-success); border: 1px solid var(--color-success); border-radius: var(--radius-sm); padding: 12px; font-size: 14px; text-align: center; font-weight: 700;">
              ✓ Deal Closed as Won (₹${(lead.won_amount || lead.expected_value || 0).toLocaleString('en-IN')})
            </div>
          `}
          
          <div style="display: flex; gap: 8px;">
            <button class="fluent-btn fluent-btn-primary" style="flex: 1; height: 40px; font-size: 13px;" onclick="app.navigateTo('B-07', { leadId: '${lead.id}' })">
              + Log Activity
            </button>
            <button class="fluent-btn fluent-btn-secondary" style="flex: 1; height: 40px; font-size: 13px;" onclick="app.navigateTo('B-08', { leadId: '${lead.id}' })">
              📎 Scope BRD
            </button>
          </div>
        </div>

        <!-- 4. Full Lead Details & Specifications (US-06, US-09) -->
        <div class="bdm-detail-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-size: 13px; font-weight: 700; color: var(--color-text-primary);">📋 Full Lead Specifications</span>
            <span style="font-size: 10px; color: var(--color-text-secondary); font-family: monospace;">ID: #${lead.id}</span>
          </div>

          <!-- Requirement & Scope Callout -->
          ${lead.sub_requirement ? `
            <div style="background: #F3F9FD; border-left: 3px solid var(--color-primary); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px; color: var(--color-text-primary); line-height: 18px;">
              <strong style="color: var(--color-primary); font-size: 11px; display: block; margin-bottom: 2px;">REQUIREMENT & SCOPE:</strong>
              "${this.escapeHtml(lead.sub_requirement)}"
            </div>
          ` : ''}

          <!-- Detailed Key-Value Specs Table -->
          <div class="bdm-specs-table">
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>📞</span> Phone</span>
              <span class="bdm-spec-val"><a href="tel:${lead.phone}" style="color: var(--color-primary); text-decoration: none;">${lead.phone}</a></span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>✉️</span> Email</span>
              <span class="bdm-spec-val"><a href="mailto:${lead.email}" style="color: var(--color-primary); text-decoration: none;">${lead.email}</a></span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>📍</span> Location</span>
              <span class="bdm-spec-val">${this.escapeHtml(lead.city || 'N/A')}, ${this.escapeHtml(lead.state || 'India')}</span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>🏢</span> Institution / Account</span>
              <span class="bdm-spec-val">${this.escapeHtml(account ? account.name : lead.company_name)}</span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>🏷️</span> Solution Product</span>
              <span class="bdm-spec-val"><span style="background: #E8F4FC; color: #004578; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${this.escapeHtml(tag ? tag.name : 'General Suite')}</span></span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>💰</span> Client Budget</span>
              <span class="bdm-spec-val">₹${(lead.budget || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>📈</span> Expected Value</span>
              <span class="bdm-spec-val" style="color: var(--color-primary);">₹${(lead.expected_value || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>⏰</span> Next Action Due</span>
              <span class="bdm-spec-val">
                ${lead.next_followup_date || 'None scheduled'}
                ${isOverdue ? '<span style="color: var(--color-error); font-weight: 700; font-size: 11px;">(🚨 Overdue)</span>' : isDueToday ? '<span style="color: var(--color-warning); font-weight: 700; font-size: 11px;">(⏰ Today)</span>' : ''}
              </span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>🔄</span> Touchpoints Logged</span>
              <span class="bdm-spec-val">${leadInteractions.length} activity entries</span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>👤</span> Assigned BDM</span>
              <span class="bdm-spec-val">${this.escapeHtml(assignedUser ? assignedUser.name : 'Aarav Sharma')}</span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>🌐</span> Inbound Source</span>
              <span class="bdm-spec-val">${this.escapeHtml((lead.source || 'Inbound').replace('_', ' ').toUpperCase())}</span>
            </div>
            <div class="bdm-spec-row">
              <span class="bdm-spec-label"><span>🗓️</span> Lead Created</span>
              <span class="bdm-spec-val">${createdFormatted}</span>
            </div>
          </div>

          <!-- Scope Document (BRD) Status -->
          <div style="margin-top: 4px; padding-top: 8px; border-top: 1px solid var(--color-border);">
            <div style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">ATTACHED SCOPE DOCUMENT (BRD)</div>
            ${lead.brd_url ? `
              <div style="display: flex; align-items: center; justify-content: space-between; background: var(--color-surface-alt); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 20px;">📄</span>
                  <div>
                    <div style="font-weight: 600; color: var(--color-text-primary); font-size: 12px;">${lead.brd_url.split('/').pop()}</div>
                    <div style="font-size: 10px; color: var(--color-text-secondary);">BRD Scope Attached · 2.4 MB PDF</div>
                  </div>
                </div>
                <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px; padding: 0 10px;" onclick="app.showToast('Previewing ${lead.brd_url.split('/').pop()}')">
                  View
                </button>
              </div>
            ` : `
              <div style="display: flex; align-items: center; justify-content: space-between; background: var(--color-surface-alt); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px dashed var(--color-border); font-size: 11px; color: var(--color-text-secondary);">
                <span>📎 No scope document uploaded yet</span>
                <button onclick="app.navigateTo('B-08', { leadId: '${lead.id}' })" style="background: none; border: none; color: var(--color-primary); font-weight: 600; cursor: pointer; padding: 0; font-size: 11px;">
                  + Upload BRD
                </button>
              </div>
            `}
          </div>
        </div>

        <!-- 5. Interaction Waterfall History (Timeline Feed) -->
        <div class="bdm-detail-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: var(--color-text-primary);">
                🌊 Interaction Waterfall History
              </div>
              <div style="font-size: 11px; color: var(--color-text-secondary);">
                ${leadInteractions.length + 1} milestone${leadInteractions.length === 0 ? '' : 's'} recorded
              </div>
            </div>
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px; font-weight: 600;" onclick="app.quickLogBdmInteraction('${lead.id}')">
              + Log Activity
            </button>
          </div>

          <!-- Vertical Connected Waterfall Timeline -->
          <div class="bdm-waterfall-wrapper">
            ${leadInteractions.length === 0 ? `
              <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12px; color: #92400E; margin-bottom: 8px;">
                ⚡ <strong>No calls or meetings logged yet.</strong> This lead is untouched! Use the <strong>Call Now</strong> button or tap <strong>+ Log Activity</strong> to record your first touchpoint.
              </div>
            ` : leadInteractions.map(int => {
              const bdmUser = this.state.users.find(u => u.id === int.bdm_id);
              const authorName = bdmUser ? bdmUser.name : 'Aarav Sharma';
              const dateObj = new Date(int.created_at);
              const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateFormatted = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

              const typeIcon = int.type === 'call' ? '📞' : int.type === 'whatsapp' ? '💬' : int.type === 'meeting' ? '👥' : int.type === 'site_visit' ? '🏢' : '📝';
              const typeLabel = int.type === 'call' ? 'PHONE CALL' : int.type === 'whatsapp' ? 'WHATSAPP' : int.type === 'meeting' ? 'VIDEO DEMO' : int.type === 'site_visit' ? 'SITE VISIT' : 'NOTE';

              const resultPillClass = int.call_result_type === 'neutral' ? 'result-neutral' :
                                      int.call_result_type === 'negative' ? 'result-negative' : 'result-positive';

              return `
                <div class="bdm-waterfall-node">
                  <div class="bdm-waterfall-icon">
                    ${typeIcon}
                  </div>
                  <div class="bdm-waterfall-card">
                    <div class="bdm-waterfall-top">
                      <div>
                        <div class="bdm-waterfall-title">
                          <span>${typeLabel}</span>
                          <span style="font-weight: 500; color: var(--color-text-secondary); font-size: 11px;">· ${this.escapeHtml(authorName)}</span>
                        </div>
                        <div class="bdm-waterfall-time">${dateFormatted} at ${timeFormatted}</div>
                      </div>
                      ${int.call_result_label ? `
                        <span class="bdm-call-result-pill ${resultPillClass}">
                          ${this.escapeHtml(int.call_result_label)}
                        </span>
                      ` : ''}
                    </div>

                    <!-- Notes Body -->
                    <div class="bdm-waterfall-notes">
                      "${this.escapeHtml(int.notes)}"
                    </div>

                    <!-- Next Action Indicator -->
                    ${int.next_action ? `
                      <div class="bdm-waterfall-next">
                        <span>⏰ Next Action:</span>
                        <span>${this.escapeHtml(int.next_action)}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}

            <!-- Waterfall Genesis Node: Initial Inbound Lead Capture -->
            <div class="bdm-waterfall-node">
              <div class="bdm-waterfall-icon icon-init">
                ⚡
              </div>
              <div class="bdm-waterfall-card" style="background: #FAFAFA; border-left: 3px solid #6E56CF;">
                <div class="bdm-waterfall-top">
                  <div>
                    <div class="bdm-waterfall-title" style="color: #6E56CF;">
                      <span>INBOUND LEAD RECEIVED</span>
                    </div>
                    <div class="bdm-waterfall-time">${createdFormatted}</div>
                  </div>
                  <span class="bdm-call-result-pill result-positive" style="background: #F3EEFC; color: #6E56CF; border-color: #D6C7F7;">
                    ${this.escapeHtml((lead.source || 'Inbound').toUpperCase())}
                  </span>
                </div>
                <div style="font-size: 11px; color: var(--color-text-secondary); line-height: 16px;">
                  Lead captured via <strong>${this.escapeHtml((lead.source || 'Website').toUpperCase())}</strong> and assigned to <strong>${this.escapeHtml(assignedUser ? assignedUser.name : 'Aarav Sharma')}</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN B-07: Log Follow-up Activity (US-10) ---
  renderB07LogFollowup() {
    const lead = this.state.leads.find(l => l.id === this.state.activeLeadId) || this.state.leads[0];

    return `
      <div style="display: flex; flex-direction: column; gap: 14px; padding-bottom: 24px;">
        <div class="bdm-detail-header-bar">
          <button class="bdm-back-btn" onclick="app.navigateTo('B-06', { leadId: '${lead.id}' })">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
            Cancel
          </button>
          <span style="font-size: 12px; font-weight: 700; color: var(--color-text-secondary);">LOG ACTIVITY</span>
          <span class="status-badge ${lead.status}">${lead.status}</span>
        </div>

        <div class="bdm-card">
          <div style="font-size: 12px; color: var(--color-text-secondary);">RECORDING TOUCHPOINT FOR:</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--color-text-primary);">${this.escapeHtml(lead.name)}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">${this.escapeHtml(lead.company_name)}</div>
        </div>

        <div class="bdm-card">
          <div class="form-field-group">
            <label class="form-field-label">Interaction Channel</label>
            <select id="bdm-followup-channel" class="form-field-select" style="height: 40px;">
              <option value="call" selected>📞 Phone Call</option>
              <option value="whatsapp">💬 WhatsApp Message</option>
              <option value="meeting">👥 Video / Zoom Demo</option>
              <option value="site_visit">🏢 On-site Client / School Visit</option>
              <option value="note">📝 Internal Account Note</option>
            </select>
          </div>

          <div class="form-field-group" style="margin-top: 10px;">
            <label class="form-field-label">Call Result / Outcome</label>
            <select id="bdm-followup-result" class="form-field-select" style="height: 40px;">
              <option value="terms_agreed">Terms Agreed / Deal Finalizing</option>
              <option value="demo_scheduled">Demo Scheduled / Video Sent</option>
              <option value="demo_completed">Virtual Demo Completed</option>
              <option value="site_visit">Site Visit Scheduled</option>
              <option value="interested" selected>Interested / Follow-up Callback Set</option>
              <option value="no_answer">Ringing / No Answer (Retry Queued)</option>
              <option value="not_interested">Not Interested / Drop-off</option>
            </select>
          </div>

          <div class="form-field-group" style="margin-top: 10px;">
            <label class="form-field-label">Discussion Notes & Action Points</label>
            <textarea id="bdm-followup-notes" class="form-field-textarea" style="height: 90px;" placeholder="Summarize the client discussion, key requirements, questions raised, and next commitments..."></textarea>
          </div>

          <div class="form-field-group" style="margin-top: 10px;">
            <label class="form-field-label">Next Action Scheduled Date</label>
            <input id="bdm-followup-date" type="date" class="form-field-input" style="height: 40px;" value="2026-09-25" />
          </div>

          <div style="display: flex; gap: 8px; margin-top: 16px;">
            <button class="fluent-btn fluent-btn-secondary" style="flex: 1; height: 42px;" onclick="app.navigateTo('B-06', { leadId: '${lead.id}' })">Cancel</button>
            <button class="fluent-btn fluent-btn-primary" style="flex: 1; height: 42px; font-weight: 700;" onclick="app.saveBdmFollowup('${lead.id}')">Save to Waterfall</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN B-08: Upload BRD Document (US-11) ---
  renderB08UploadBrd() {
    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <h3 style="font-size: 16px; font-weight: 600;">Attach Client BRD File</h3>
        <div class="bdm-card" style="text-align: center; padding: 24px;">
          <svg width="40" height="40" fill="var(--color-primary)" viewBox="0 0 16 16" style="margin-bottom: 8px;"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/></svg>
          <div style="font-size: 14px; font-weight: 600;">Select PDF or DOCX file</div>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">Stored directly on CKR VPS server</p>
          <button class="fluent-btn fluent-btn-primary" style="height: 42px; margin-top: 16px; width: 100%;" onclick="app.showToast('Uploaded HeritageValley_BRD.pdf to VPS disk'); app.navigateTo('B-06')">
            Choose & Upload Document
          </button>
        </div>
      </div>
    `;
  }

  // --- SCREEN B-09: Notifications (US-18) ---
  renderB09Notifications() {
    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <h3 style="font-size: 16px; font-weight: 600;">My In-App Alerts</h3>
        ${this.state.notifications.slice(0, 3).map(n => `
          <div class="bdm-card" style="border-left: 3px solid ${n.type === 'followup_overdue' ? 'var(--color-error)' : 'var(--color-primary)'};">
            <div style="font-size: 13px; font-weight: 600;">${n.message}</div>
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">Delivered via Socket.io</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- SCREEN B-10: First-login Welcome Walkthrough (US-34) ---
  renderB10WelcomeWalkthrough() {
    const slides = [
      {
        title: "1. My Assigned Leads",
        desc: "All leads allocated to you appear here in real-time. Follow up on schedule and never miss an overdue notification.",
        icon: "📋"
      },
      {
        title: "2. Daily Attendance Punch",
        desc: "Punch in every morning before calling. Check out at end of shift with a single tap.",
        icon: "⏰"
      },
      {
        title: "3. Real-Time Broadcasts",
        desc: "Instant live alerts when new leads are assigned or follow-up milestones are due.",
        icon: "🔔"
      }
    ];

    const slide = slides[this.state.onboardingSlide];

    return `
      <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between; text-align: center; padding: 20px 0;">
        <div style="font-size: 12px; color: var(--color-text-secondary);">NEW HIRE ONBOARDING · SLIDE ${this.state.onboardingSlide + 1} OF 3</div>

        <div style="padding: 20px;">
          <div style="font-size: 64px; margin-bottom: 16px;">${slide.icon}</div>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${slide.title}</h2>
          <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 20px;">${slide.desc}</p>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="fluent-btn fluent-btn-secondary" style="flex: 1; height: 44px;" onclick="app.navigateTo('B-02')">Skip Walkthrough</button>
          <button class="fluent-btn fluent-btn-primary" style="flex: 1; height: 44px;" onclick="app.nextOnboardingSlide()">
            ${this.state.onboardingSlide === 2 ? 'Finish & Launch' : 'Next ›'}
          </button>
        </div>
      </div>
    `;
  }

  nextOnboardingSlide() {
    if (this.state.onboardingSlide < 2) {
      this.state.onboardingSlide++;
      this.render();
    } else {
      this.navigateTo('B-02');
    }
  }

  // ==========================================================
  // SHARED OVERLAYS & MODALS
  // ==========================================================
  renderQuickCreateOverlay() {
    const isLead = this.state.quickCreateType === 'lead';
    const isBdm = this.state.platform === 'bdm';
    const bdmUser = this.state.users.find(u => u.id === (this.state.currentBdmId || 'u-02'));

    return `
      <div class="quick-create-overlay dock-${this.state.panelSide} ${this.state.quickCreateOpen ? 'open' : ''}" id="quick-create-overlay" onclick="app.closeQuickCreate(event)">
        <div class="quick-create-panel" onclick="event.stopPropagation()">
          <div class="quick-create-header">
            <h2 style="font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <span>${isLead ? '⚡ Quick Add Lead' : '👤 Quick Create: Staff Account'}</span>
              ${isLead && isBdm ? `<span class="proto-brand-tag" style="font-size: 10px; padding: 2px 6px;">BDM Mode</span>` : ''}
            </h2>
            <button class="icon-btn-utility" onclick="app.closeQuickCreate()">✕</button>
          </div>

          <div class="quick-create-body">
            ${isLead ? `
              <!-- Mandatory Information Card -->
              <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-left: 3px solid var(--color-primary); border-radius: var(--radius-sm); padding: 12px 14px;">
                <div class="quick-create-section-title" style="margin-top: 0; padding-bottom: 6px; border-bottom: 1px dashed var(--color-border);">
                  <span>⭐</span>
                  <span>Required Information (Mandatory)</span>
                </div>
                <div class="form-fields-grid" style="margin-top: 10px;">
                  <div class="form-field-group full-width">
                    <label class="form-field-label">
                      Contact Person Name <span style="color: #D83B01; font-weight: 700;">*</span>
                    </label>
                    <input type="text" class="form-field-input" id="qc-lead-name" placeholder="e.g. Dr. Harish Reddy / Principal Sharma" required />
                  </div>
                  <div class="form-field-group full-width">
                    <label class="form-field-label">
                      Phone Number <span style="color: #D83B01; font-weight: 700;">*</span>
                    </label>
                    <input type="tel" class="form-field-input" id="qc-lead-phone" placeholder="e.g. +91 98480 12345" required />
                  </div>
                  <div class="form-field-group full-width">
                    <label class="form-field-label">
                      Discussion / Requirement Notes <span style="color: #D83B01; font-weight: 700;">*</span>
                    </label>
                    <textarea class="form-field-textarea" id="qc-lead-notes" style="height: 80px;" placeholder="e.g. Custom App for campus management with parent mobile app, fee gateway, and real-time attendance..." required></textarea>
                    <span style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">
                      Automatically logged into Daily Interaction Waterfall & Calling Ledger.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Optional Details Card -->
              <div style="background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 12px 14px;">
                <div class="quick-create-section-title" style="margin-top: 0; padding-bottom: 6px; border-bottom: 1px dashed var(--color-border); color: var(--color-text-secondary);">
                  <span>⚙️</span>
                  <span>Optional Details (Defaults Provided)</span>
                </div>
                <div class="form-fields-grid" style="margin-top: 10px;">
                  <div class="form-field-group full-width">
                    <label class="form-field-label">Company / School / Organization</label>
                    <input type="text" class="form-field-input" id="qc-lead-company" placeholder="e.g. St. Xavier Senior School (or blank)" />
                  </div>

                  <div class="form-field-group full-width">
                    <label class="form-field-label">
                      Offering / Solution Tag 
                      <span style="font-size: 11px; color: var(--color-primary); font-weight: 600;">(Default: Custom App)</span>
                    </label>
                    <select class="form-field-select" id="qc-lead-tag">
                      ${this.state.tags.map(t => `
                        <option value="${t.id}" ${t.id === 'tag-02' ? 'selected' : ''}>
                          ${this.escapeHtml(t.name)} ${t.id === 'tag-02' ? '★ (Default)' : `(${t.type})`}
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="form-field-group">
                    <label class="form-field-label">Expected Deal Value (₹)</label>
                    <input type="number" class="form-field-input" id="qc-lead-val" placeholder="e.g. 250000" />
                  </div>

                  <div class="form-field-group">
                    <label class="form-field-label">Next Follow-up Due Date</label>
                    <input type="date" class="form-field-input" id="qc-lead-date" value="${new Date(Date.now() + 2*86400000).toISOString().slice(0, 10)}" />
                  </div>

                  <div class="form-field-group">
                    <label class="form-field-label">City</label>
                    <input type="text" class="form-field-input" id="qc-lead-city" placeholder="e.g. Hyderabad / Delhi" />
                  </div>

                  <div class="form-field-group">
                    <label class="form-field-label">State</label>
                    <select class="form-field-select" id="qc-lead-state">
                      <option value="Telangana">Telangana</option>
                      <option value="Delhi" selected>Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div class="form-field-group full-width">
                    <label class="form-field-label">Email Address</label>
                    <input type="email" class="form-field-input" id="qc-lead-email" placeholder="e.g. contact@institution.org" />
                  </div>

                  <div class="form-field-group full-width">
                    <label class="form-field-label">Assign to BDM</label>
                    <select class="form-field-select" id="qc-lead-assigned">
                      ${isBdm ? `
                        <option value="${this.state.currentBdmId || 'u-02'}" selected>
                          👤 Assigned to Me (${bdmUser ? bdmUser.name : 'Aarav Sharma'})
                        </option>
                      ` : `
                        ${this.state.users.filter(u => u.role === 'bdm').map(u => `
                          <option value="${u.id}" ${u.id === 'u-02' ? 'selected' : ''}>${this.escapeHtml(u.name)} (${u.employee_id})</option>
                        `).join('')}
                        <option value="">-- Unassigned (Lead Pool) --</option>
                      `}
                    </select>
                  </div>
                </div>
              </div>
            ` : `
              <div class="form-field-group">
                <label class="form-field-label">Full Name *</label>
                <input type="text" class="form-field-input" id="qc-staff-name" placeholder="e.g. Rahul Sharma" />
              </div>
              <div class="form-field-group">
                <label class="form-field-label">Email Address *</label>
                <input type="email" class="form-field-input" id="qc-staff-email" placeholder="rahul@ckrtechnologies.in" />
              </div>
              <div class="form-field-group">
                <label class="form-field-label">Phone Number</label>
                <input type="text" class="form-field-input" id="qc-staff-phone" placeholder="+91 9..." />
              </div>
              <div class="form-field-group">
                <label class="form-field-label">Designation</label>
                <input type="text" class="form-field-input" id="qc-staff-desig" value="Business Development Manager" />
              </div>
            `}
          </div>

          <div class="quick-create-footer">
            <button class="fluent-btn fluent-btn-secondary" onclick="app.closeQuickCreate()">Cancel</button>
            ${isLead ? `
              <button class="fluent-btn fluent-btn-secondary" onclick="app.saveQuickCreate(true)">Save & Open Detail</button>
            ` : ''}
            <button class="fluent-btn fluent-btn-primary" onclick="app.saveQuickCreate(false)">Save and Close</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- STAFF CRUD MODAL (Create & Edit Dialog) ---
  renderStaffCrudModal() {
    if (!this.state.staffModalOpen) return '';

    const isEdit = this.state.staffModalMode === 'edit';
    const user = isEdit ? this.state.users.find(u => u.id === this.state.staffEditingId) : null;
    const nextEmpNum = String(this.state.users.length + 1).padStart(3, '0');
    const autoEmpId = `CKR-BDM-${nextEmpNum}`;

    return `
      <div class="fluent-dialog-backdrop open" id="staff-crud-dialog">
        <div class="fluent-dialog-box large-modal" style="width: 580px; max-width: 95vw;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">
            <h2 style="font-size: 18px; font-weight: 600; margin: 0;">
              ${isEdit ? `✏️ Edit Staff Member · ${this.escapeHtml(user ? user.name : '')}` : '➕ Add New Staff Member'}
            </h2>
            <button class="icon-btn-utility" onclick="app.closeStaffModal()" title="Close">✕</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px;">
            <div class="form-field-group">
              <label class="form-field-label">Employee ID *</label>
              <input type="text" id="staff-modal-empid" class="form-field-input" value="${this.escapeHtml(user ? user.employee_id : autoEmpId)}" />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Full Name *</label>
              <input type="text" id="staff-modal-name" class="form-field-input" value="${this.escapeHtml(user ? user.name : '')}" placeholder="e.g. Sameer Verma" required />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Work Email *</label>
              <input type="email" id="staff-modal-email" class="form-field-input" value="${this.escapeHtml(user ? user.email : '')}" placeholder="name@ckrtechnologies.in" required />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Mobile Phone *</label>
              <input type="tel" id="staff-modal-phone" class="form-field-input" value="${this.escapeHtml(user ? user.phone : '+91 ')}" placeholder="+91 98765 43210" required />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Designation</label>
              <input type="text" id="staff-modal-designation" class="form-field-input" value="${this.escapeHtml(user ? user.designation : 'BDM - Inside Sales')}" placeholder="e.g. Senior BDM" />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Department</label>
              <select id="staff-modal-dept" class="form-field-select">
                <option value="Sales" ${user && user.department === 'Sales' ? 'selected' : ''}>Sales & BD</option>
                <option value="Telecalling" ${user && user.department === 'Telecalling' ? 'selected' : ''}>Inbound / Outbound Telecalling</option>
                <option value="Leadership" ${user && user.department === 'Leadership' ? 'selected' : ''}>Executive Leadership</option>
                <option value="Operations" ${user && user.department === 'Operations' ? 'selected' : ''}>Operations & Delivery</option>
              </select>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Platform Role</label>
              <select id="staff-modal-role" class="form-field-select">
                <option value="bdm" ${!user || user.role === 'bdm' ? 'selected' : ''}>BDM (Mobile & Calling Access)</option>
                <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>Admin (Full Web Portal Access)</option>
              </select>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Account Status</label>
              <select id="staff-modal-status" class="form-field-select">
                <option value="active" ${!user || user.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${user && user.status === 'inactive' ? 'selected' : ''}>Inactive (Suspended)</option>
              </select>
            </div>

            <div class="form-field-group" style="grid-column: span 2;">
              <label class="form-field-label">Monthly Target Value (₹)</label>
              <input type="number" id="staff-modal-target" class="form-field-input" value="${user ? (user.sales_target || 500000) : 500000}" placeholder="500000" />
            </div>
          </div>

          ${!isEdit ? `
            <div style="margin-top: 10px; padding: 10px 12px; background: #FFF9E6; border: 1px solid #FFE27D; border-radius: var(--radius-sm); font-size: 12px; color: #8A6D00;">
              🔑 <strong>Temporary Password Notice:</strong> An initial one-time temporary password will be generated upon saving, and the staff member will be required to reset it on their first login.
            </div>
          ` : ''}

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; border-top: 1px solid var(--color-border); padding-top: 14px;">
            <button class="fluent-btn fluent-btn-secondary" onclick="app.closeStaffModal()">Cancel</button>
            <button class="fluent-btn fluent-btn-primary" onclick="app.saveStaffModal()">
              ${isEdit ? 'Save Changes' : 'Create Staff Member'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- STAFF DEACTIVATE & LEAD REASSIGNMENT MODAL ---
  renderStaffDeleteModal() {
    if (!this.state.staffDeactivateModalOpen) return '';

    const targetUser = this.state.users.find(u => u.id === this.state.staffDeactivateTargetId);
    if (!targetUser) return '';

    const otherBdms = this.state.users.filter(u => u.role === 'bdm' && u.id !== targetUser.id && u.status === 'active');
    const userLeads = this.state.leads.filter(l => l.assigned_to === targetUser.id);
    const activeLeads = userLeads.filter(l => !['won', 'lost', 'invalid'].includes(l.status));
    const isActivating = targetUser.status === 'inactive';

    return `
      <div class="fluent-dialog-backdrop open" id="staff-delete-dialog">
        <div class="fluent-dialog-box" style="width: 520px; max-width: 95vw;">
          <h2 style="font-size: 18px; font-weight: 600; margin: 0; color: ${isActivating ? 'var(--color-primary)' : 'var(--color-error)'};">
            ${isActivating ? '♻️ Reactivate Staff Member' : '⚠️ Deactivate Staff Member'}
          </h2>

          <p style="font-size: 13px; color: var(--color-text-secondary); margin: 8px 0 14px 0;">
            ${isActivating ? 
              `Are you sure you want to reactivate <strong>${this.escapeHtml(targetUser.name)}</strong> (${targetUser.employee_id})? They will be able to log in and receive new lead assignments.` : 
              `You are about to deactivate <strong>${this.escapeHtml(targetUser.name)}</strong> (${targetUser.employee_id}).`
            }
          </p>

          ${!isActivating && activeLeads.length > 0 ? `
            <div style="padding: 12px; background: #FFF4CE; border: 1px solid #FDE79E; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <strong style="color: #8A6D00; font-size: 13px; display: block; margin-bottom: 4px;">
                ⚠️ Pipeline Allocation Warning
              </strong>
              <span style="font-size: 12px; color: #444444;">
                ${this.escapeHtml(targetUser.name)} currently has <strong>${activeLeads.length} active lead(s)</strong> in their sales pipeline. Choose how you would like to handle their assigned leads:
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer;">
                <input type="radio" name="staff-reassign-opt" value="reassign" checked style="margin-top: 3px;" />
                <div>
                  <strong>Reassign all ${activeLeads.length} active leads to another BDM:</strong>
                  <div style="margin-top: 6px;">
                    <select id="staff-reassign-select" class="form-field-select" style="width: 100%; height: 32px;">
                      ${otherBdms.map(b => `<option value="${b.id}">${this.escapeHtml(b.name)} (${b.employee_id})</option>`).join('')}
                    </select>
                  </div>
                </div>
              </label>

              <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer;">
                <input type="radio" name="staff-reassign-opt" value="pool" style="margin-top: 3px;" />
                <div>
                  <strong>Move leads to Unassigned Pool</strong>
                  <div style="font-size: 11px; color: var(--color-text-secondary);">Leads will be unassigned and available for manual reallocation in Lead Assignment.</div>
                </div>
              </label>

              <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer;">
                <input type="radio" name="staff-reassign-opt" value="keep" style="margin-top: 3px;" />
                <div>
                  <strong>Keep leads with ${this.escapeHtml(targetUser.name)}</strong>
                  <div style="font-size: 11px; color: var(--color-text-secondary);">Retain current assignments; account will just be locked from further logins.</div>
                </div>
              </label>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; border-top: 1px solid var(--color-border); padding-top: 14px;">
            <button class="fluent-btn fluent-btn-secondary" onclick="app.closeStaffDeleteModal()">Cancel</button>
            <button class="fluent-btn ${isActivating ? 'fluent-btn-primary' : 'danger-cmd'}" onclick="app.confirmStaffDeactivate()">
              ${isActivating ? 'Confirm Reactivation' : 'Confirm Deactivation'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- ONE-TIME PASSWORD DIALOG (US-32 / US-33) ---
  renderOneTimePasswordModal() {
    const data = this.state.oneTimePasswordModal;
    return `
      <div class="fluent-dialog-backdrop ${data ? 'open' : ''}" id="password-dialog">
        <div class="fluent-dialog-box">
          <h2 style="font-size: 18px; font-weight: 600;">Staff Onboarding Credentials</h2>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 18px;">
            Copy this initial password now and hand it to the staff member. Per security policy, <strong>this password will NEVER be shown again</strong> once you close this dialog.
          </p>

          <div style="font-size: 12px; color: var(--color-text-secondary);">Employee ID: <strong>${data ? data.employee_id : ''}</strong></div>
          <div class="password-display-box">
            <span>${data ? data.password : ''}</span>
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px; font-size: 11px;" onclick="app.copyPassword('${data ? data.password : ''}')">
              Copy Password
            </button>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <button class="fluent-btn fluent-btn-primary" onclick="app.closePasswordModal()">
              I Have Securely Copied This Password
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- SIGNOFF REVIEW SCREEN ---
  renderSignoffScreen() {
    return `
      <div style="padding: 40px; overflow-y: auto; height: 100%; width: 100%;">
        <div class="signoff-sheet-container">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--color-border); padding-bottom: 16px; margin-bottom: 20px;">
            <div>
              <span class="proto-brand-tag" style="margin-bottom: 8px;">PROTOTYPE REVIEW & SIGNOFF</span>
              <h1 style="font-size: 24px; font-weight: 700;">CKR Connect — Prototype v0.1</h1>
              <p style="font-size: 13px; color: var(--color-text-secondary);">Date: 22 September 2026 · Microsoft Fluent 2 / Dynamics 365 Architecture</p>
            </div>
            <button class="fluent-btn fluent-btn-secondary" onclick="app.navigateTo('A-03')">Back to Prototype</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px; line-height: 22px;">
            <p>
              This clickable interactive prototype validates all 28 screens specified in <code>SCREEN-MAP.md</code> across both the <strong>Admin Panel</strong> (A-01 to A-18) and the mobile-first <strong>BDM App</strong> (B-01 to B-10).
            </p>

            <div style="background: var(--color-surface-alt); padding: 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--color-primary);">
              <strong>Visual Direction Validation:</strong>
              <ul style="margin-left: 20px; margin-top: 8px; font-size: 13px;">
                <li>Dense entity grids with 40px row height and hairline dividers.</li>
                <li>Selection-sensitive Command Bar actions (Assign, Delete).</li>
                <li>Interactive Business Process Flow (BPF) chevron bar.</li>
                <li>Staff credential handoff modal with one-time copyable password (US-32).</li>
                <li>Self-scoped BDM "My Performance" analytics and 3-slide welcome walkthrough (B-10).</li>
                <li>Quick Create live dock side toggle (Left vs Right) tested and confirmed.</li>
              </ul>
            </div>

            <div style="margin-top: 24px; padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #FAF9F8;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Sign-Off Approval</h3>
              <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px;">
                "Reviewed and approved to proceed to build — Chandan Mallik, CKR Technologies"
              </p>

              <div style="display: flex; gap: 16px; align-items: center;">
                <input type="text" class="form-field-input" value="Chandan Mallik, Co-Founder & CTO" disabled style="width: 280px;" />
                <input type="text" class="form-field-input" value="22 Sep 2026" disabled style="width: 120px;" />
                <button class="fluent-btn fluent-btn-primary" style="height: 36px;" onclick="app.showToast('Signed & Approved! Prototype is locked as build reference.');">
                  Confirm Approval & Lock Prototype
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- UNHAPPY STATES WRAPPER ---
  renderUnhappyStateWrapper(renderFn) {
    if (this.state.unhappyState === 'skeleton') {
      return `
        <div style="padding: 24px;">
          <div class="unhappy-skeleton-row" style="width: 40%; height: 28px; margin-bottom: 24px;"></div>
          <div class="unhappy-skeleton-row" style="width: 100%;"></div>
          <div class="unhappy-skeleton-row" style="width: 95%;"></div>
          <div class="unhappy-skeleton-row" style="width: 85%;"></div>
          <div class="unhappy-skeleton-row" style="width: 90%;"></div>
        </div>
      `;
    }
    if (this.state.unhappyState === 'empty') {
      return `
        <div class="unhappy-empty-box">
          <svg width="48" height="48" fill="var(--color-text-disabled)" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M4 4h8v1H4V4zm0 3h8v1H4V7zm0 3h5v1H4v-1z"/></svg>
          <h3 style="font-size: 16px; font-weight: 600;">No records found</h3>
          <p style="font-size: 13px; color: var(--color-text-secondary);">There is currently no data matching your query.</p>
          <button class="fluent-btn fluent-btn-primary" onclick="app.state.unhappyState = 'normal'; app.render();">Reset State</button>
        </div>
      `;
    }
    if (this.state.unhappyState === 'error') {
      return `
        <div style="padding: 24px;">
          <div class="unhappy-error-banner">
            <div>
              <strong>Failed to load data from CKR VPS API.</strong>
              <div style="font-size: 12px; margin-top: 2px;">Connection timed out after 5000ms.</div>
            </div>
            <button class="fluent-btn fluent-btn-secondary" style="height: 28px;" onclick="app.state.unhappyState = 'normal'; app.render();">Retry</button>
          </div>
        </div>
      `;
    }

    return renderFn();
  }

  // ==========================================================
  // EVENT ATTACHMENT & LOGIC HELPERS
  // ==========================================================
  postRenderAttachEvents() {
    const btnNewLead = document.getElementById('cmd-new-lead');
    if (btnNewLead) {
      btnNewLead.onclick = () => this.openLeadCreate();
    }
    const btnBulkUpload = document.getElementById('cmd-bulk-upload');
    if (btnBulkUpload) {
      btnBulkUpload.onclick = () => this.navigateTo('A-06');
    }
    const btnAssignSelected = document.getElementById('cmd-assign-selected');
    if (btnAssignSelected) {
      btnAssignSelected.onclick = () => this.navigateTo('A-07');
    }
    const btnDeleteSelected = document.getElementById('cmd-delete-selected');
    if (btnDeleteSelected) {
      btnDeleteSelected.onclick = () => this.deleteSelectedLeads();
    }
    const btnExportLeads = document.getElementById('cmd-export-leads');
    if (btnExportLeads) {
      btnExportLeads.onclick = () => this.navigateTo('A-15');
    }
    const btnNewStaff = document.getElementById('cmd-new-staff');
    if (btnNewStaff) {
      btnNewStaff.onclick = () => this.openStaffCreate();
    }
  }

  getFilteredLeads() {
    let list = this.state.leads;

    // Filter by dashboard-selected metric (RTK-style prop / filter state)
    if (this.state.activeLeadFilter) {
      const f = this.state.activeLeadFilter;
      if (f.type === 'status' && !this.state.leadStatusFilter) {
        if (f.value === 'proposal') {
          list = list.filter(l => l.status === 'proposal' || l.status === 'negotiation');
        } else {
          list = list.filter(l => l.status === f.value);
        }
      } else if (f.type === 'bdm' && !this.state.leadBdmFilter) {
        list = list.filter(l => l.assigned_to === f.value);
      } else if (f.type === 'pipeline' || f.type === 'active') {
        list = list.filter(l => !['won', 'lost', 'invalid'].includes(l.status));
      } else if (f.type === 'due_date') {
        const dt = f.value || this.state.selectedDate;
        list = list.filter(l => l.next_followup_date === dt);
      } else if (f.type === 'overdue') {
        const dt = f.value || this.state.selectedDate;
        list = list.filter(l => l.next_followup_date && l.next_followup_date < dt && !['won', 'lost', 'invalid'].includes(l.status));
      } else if (f.type === 'terminal') {
        list = list.filter(l => ['lost', 'invalid'].includes(l.status));
      }
    }

    // Direct BDM Filter dropdown
    if (this.state.leadBdmFilter) {
      if (this.state.leadBdmFilter === 'unassigned') {
        list = list.filter(l => !l.assigned_to);
      } else {
        list = list.filter(l => l.assigned_to === this.state.leadBdmFilter);
      }
    }

    // Direct Status / Stage Filter dropdown
    if (this.state.leadStatusFilter) {
      if (this.state.leadStatusFilter === 'proposal') {
        list = list.filter(l => l.status === 'proposal' || l.status === 'negotiation');
      } else {
        list = list.filter(l => l.status === this.state.leadStatusFilter);
      }
    }

    // Live Search Query
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      list = list.filter(l => 
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.company_name && l.company_name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q))
      );
    }
    return list;
  }

  handleBdmFilter(bdmId) {
    this.state.leadBdmFilter = bdmId;
    const bdm = this.state.users.find(u => u.id === bdmId);
    if (bdmId && bdm) {
      this.state.activeLeadFilter = {
        type: 'bdm',
        value: bdmId,
        label: `BDM: ${bdm.name}`
      };
      this.showToast(`Filtered leads assigned to ${bdm.name}`);
    } else if (bdmId === 'unassigned') {
      this.state.activeLeadFilter = {
        type: 'bdm',
        value: 'unassigned',
        label: 'Unassigned Leads'
      };
      this.showToast('Showing unassigned leads');
    } else {
      if (this.state.activeLeadFilter && this.state.activeLeadFilter.type === 'bdm') {
        this.state.activeLeadFilter = null;
      }
      this.showToast('Showing leads across all sales staff');
    }
    this.render();
  }

  handleStatusFilter(val) {
    this.state.leadStatusFilter = val;
    if (val) {
      this.state.activeLeadFilter = {
        type: 'status',
        value: val,
        label: `Stage: ${val.charAt(0).toUpperCase() + val.slice(1).replace('_', '-')}`
      };
    } else {
      if (this.state.activeLeadFilter && this.state.activeLeadFilter.type === 'status') {
        this.state.activeLeadFilter = null;
      }
    }
    this.render();
  }

  openFilteredLeads(filterObj) {
    this.state.activeLeadFilter = filterObj;
    if (filterObj.type === 'bdm') {
      this.state.leadBdmFilter = filterObj.value;
    } else if (filterObj.type === 'status') {
      this.state.leadStatusFilter = filterObj.value;
    } else {
      this.state.leadBdmFilter = '';
      this.state.leadStatusFilter = '';
    }
    this.state.currentScreen = 'A-03';
    this.state.platform = 'admin';
    this.showToast(`Filtered: ${filterObj.label}`);
    this.render();
  }

  clearLeadFilter() {
    this.state.activeLeadFilter = null;
    this.state.leadBdmFilter = '';
    this.state.leadStatusFilter = '';
    this.state.searchQuery = '';
    this.showToast('Lead filters cleared');
    this.render();
  }

  setInteractionChannelFilter(channel) {
    this.state.interactionChannelFilter = channel;
    this.render();
  }

  setInteractionBdmFilter(bdmId) {
    this.state.interactionBdmFilter = bdmId;
    const bdm = this.state.users.find(u => u.id === bdmId);
    this.showToast(bdmId === 'all' ? 'Showing activities for all staff' : `Filtered activities for ${bdm ? bdm.name : bdmId}`);
    this.render();
  }

  setInteractionSearchQuery(query) {
    this.state.interactionSearchQuery = query;
    this.render();
  }

  handleSearch(val) {
    this.state.searchQuery = val;
    this.render();
  }

  handleRowClick(leadId, e) {
    this.navigateTo('A-04', { leadId });
  }

  toggleSelectLead(leadId) {
    if (this.state.selectedLeadIds.has(leadId)) {
      this.state.selectedLeadIds.delete(leadId);
    } else {
      this.state.selectedLeadIds.add(leadId);
    }
    this.render();
  }

  toggleSelectAllLeads(checked) {
    if (checked) {
      this.getFilteredLeads().forEach(l => this.state.selectedLeadIds.add(l.id));
    } else {
      this.state.selectedLeadIds.clear();
    }
    this.render();
  }

  deleteSelectedLeads() {
    if (confirm(`Delete ${this.state.selectedLeadIds.size} selected lead(s)?`)) {
      this.state.leads = this.state.leads.filter(l => !this.state.selectedLeadIds.has(l.id));
      this.state.selectedLeadIds.clear();
      this.showToast('Leads removed from system');
      this.render();
    }
  }

  setFormTab(tab) {
    this.state.formTab = tab;
    this.render();
  }

  setBdmTab(tab) {
    this.state.bdmDashboardTab = tab;
    this.render();
  }

  setBdmSearch(query) {
    this.state.bdmSearchQuery = query;
    this.render();
    const input = document.getElementById('bdm-lead-search-input');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  setBdmUrgencyFilter(filter) {
    this.state.bdmFilterUrgency = filter;
    this.render();
  }

  setBdmStageFilter(stage) {
    this.state.bdmFilterStage = stage;
    this.render();
  }

  clearBdmFilters() {
    this.state.bdmSearchQuery = '';
    this.state.bdmFilterUrgency = 'all';
    this.state.bdmFilterStage = 'all';
    this.render();
  }

  openBdmLeadsByStage(stage) {
    this.state.bdmFilterStage = stage;
    this.state.bdmFilterUrgency = 'all';
    this.state.bdmSearchQuery = '';
    this.navigateTo('B-05');
  }

  openBdmLeadsByUrgency(urgency) {
    this.state.bdmFilterUrgency = urgency;
    this.state.bdmFilterStage = 'all';
    this.state.bdmSearchQuery = '';
    this.navigateTo('B-05');
  }

  advanceStage(leadId, stage) {
    if (stage === 'won') {
      this.openWonModal(leadId);
      return;
    }
    if (stage === 'lost' || stage === 'invalid') {
      this.openDropoffModal(leadId, stage);
      return;
    }
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return;
    lead.status = stage;
    this.showToast(`Stage advanced to ${stage.toUpperCase()}`);
    this.render();
  }

  branchDropoff(leadId) {
    this.openDropoffModal(leadId, 'lost');
  }

  openWonModal(leadId) {
    this.state.wonModalLeadId = leadId;
    this.render();
  }

  closeWonModal() {
    this.state.wonModalLeadId = null;
    this.render();
  }

  confirmLeadWon(leadId) {
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const amountInput = document.getElementById('won-modal-amount');
    const dealTypeInput = document.getElementById('won-modal-deal-type');
    const accountNameInput = document.getElementById('won-modal-account-name');
    const notesInput = document.getElementById('won-modal-notes');

    const wonAmount = parseFloat(amountInput?.value) || 0;
    if (wonAmount <= 0) {
      alert("Please enter a valid Won Amount in ₹ (Mandatory per PRD US-27).");
      return;
    }

    lead.status = 'won';
    lead.won_amount = wonAmount;
    if (dealTypeInput) lead.deal_type = dealTypeInput.value;

    // Link or create account (US-29)
    let acc = this.state.accounts.find(a => a.id === lead.account_id);
    if (!acc && accountNameInput && accountNameInput.value) {
      acc = this.state.accounts.find(a => a.name.toLowerCase() === accountNameInput.value.toLowerCase());
      if (!acc) {
        acc = {
          id: `acc-${Date.now()}`,
          name: accountNameInput.value,
          state: lead.state || 'Delhi',
          city: lead.city || 'New Delhi',
          created_by: 'u-01',
          created_at: new Date().toISOString(),
          lifetime_revenue: wonAmount,
          won_leads_count: 1,
          total_leads_count: 1
        };
        this.state.accounts.unshift(acc);
      } else {
        acc.lifetime_revenue = (acc.lifetime_revenue || 0) + wonAmount;
        acc.won_leads_count = (acc.won_leads_count || 0) + 1;
      }
      lead.account_id = acc.id;
    } else if (acc) {
      acc.lifetime_revenue = (acc.lifetime_revenue || 0) + wonAmount;
      acc.won_leads_count = (acc.won_leads_count || 0) + 1;
    }

    // Log closing interaction
    const notes = notesInput?.value || `Deal closed and marked Won for ₹${wonAmount.toLocaleString('en-IN')}`;
    this.state.interactions.unshift({
      id: `int-${Date.now()}`,
      lead_id: lead.id,
      bdm_id: lead.assigned_to || 'u-02',
      type: 'meeting',
      notes,
      next_action: 'Project onboarding & kick-off handoff',
      created_at: new Date().toISOString()
    });

    // Push notification to Admin
    this.state.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: 'u-01',
      lead_id: lead.id,
      type: 'other',
      message: `🎉 Deal Won! ${lead.name} (${lead.company_name}) closed for ₹${wonAmount.toLocaleString('en-IN')}`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.state.wonModalLeadId = null;
    this.showToast(`🎉 Deal marked Won! Added ₹${wonAmount.toLocaleString('en-IN')} to revenue.`);
    this.render();
  }

  renderWonModal() {
    if (!this.state.wonModalLeadId) return '';
    const lead = this.state.leads.find(l => l.id === this.state.wonModalLeadId);
    if (!lead) return '';

    return `
      <div class="deal-modal-backdrop open">
        <div class="deal-modal-box">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">🏆</span>
              <h2 style="font-size: 16px; font-weight: 600;">Convert & Close Deal as Won</h2>
            </div>
            <button class="icon-btn-utility" onclick="app.closeWonModal()">✕</button>
          </div>

          <p style="font-size: 12px; color: var(--color-text-secondary); line-height: 16px;">
            Record actual closed deal value and customer account linkage per <strong>PRD US-27 & US-29</strong>.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-field-group">
              <label class="form-field-label">Actual Closed Deal Amount (₹ Mandatory) *</label>
              <input type="number" class="form-field-input" id="won-modal-amount" value="${lead.expected_value || 480000}" placeholder="e.g. 480000" />
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Deal Type</label>
              <select class="form-field-select" id="won-modal-deal-type">
                <option value="new_business" ${lead.deal_type === 'new_business' ? 'selected' : ''}>New Business (First Sale)</option>
                <option value="upsell" ${lead.deal_type === 'upsell' ? 'selected' : ''}>Upsell (Additional Module/Campus)</option>
                <option value="resell" ${lead.deal_type === 'resell' ? 'selected' : ''}>Resell / AMC Renewal</option>
              </select>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Customer Company / Account</label>
              <input type="text" class="form-field-input" id="won-modal-account-name" value="${lead.company_name || 'Heritage Valley International School'}" />
              <span style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">
                Links to Customer Account to accumulate lifetime revenue.
              </span>
            </div>

            <div class="form-field-group">
              <label class="form-field-label">Closing Notes & Payment Terms</label>
              <textarea class="form-field-textarea" id="won-modal-notes" style="height: 60px;" placeholder="e.g. Signed 3-year ERP agreement with 50% advance received via NEFT"></textarea>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button class="fluent-btn fluent-btn-secondary" onclick="app.closeWonModal()">Cancel</button>
            <button class="fluent-btn fluent-btn-primary" style="background: var(--color-success); border-color: var(--color-success); font-weight: 600;" onclick="app.confirmLeadWon('${lead.id}')">
              Confirm & Record Won Revenue
            </button>
          </div>
        </div>
      </div>
    `;
  }

  openDropoffModal(leadId, defaultStage = 'lost') {
    this.state.dropoffModalData = { leadId, defaultStage };
    this.render();
  }

  closeDropoffModal() {
    this.state.dropoffModalData = null;
    this.render();
  }

  toggleDropoffFields(val) {
    const invalidGroup = document.getElementById('dropoff-invalid-reason-group');
    const lostGroup = document.getElementById('dropoff-lost-reason-group');
    if (invalidGroup && lostGroup) {
      if (val === 'invalid') {
        invalidGroup.style.display = 'flex';
        lostGroup.style.display = 'none';
      } else {
        invalidGroup.style.display = 'none';
        lostGroup.style.display = 'flex';
      }
    }
  }

  confirmDropoff(leadId) {
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const statusVal = document.getElementById('dropoff-status')?.value || 'lost';
    const invalidReasonVal = document.getElementById('dropoff-invalid-reason')?.value;
    const lostReasonVal = document.getElementById('dropoff-lost-reason')?.value;

    lead.status = statusVal;
    if (statusVal === 'invalid') {
      lead.invalid_reason = invalidReasonVal || 'wrong_number';
      lead.lost_reason = null;
      this.showToast(`Lead marked Invalid (${lead.invalid_reason}). Removed from pipeline.`);
    } else {
      lead.lost_reason = lostReasonVal || 'Price too high / opted for competitor';
      lead.invalid_reason = null;
      this.showToast(`Lead marked Lost: ${lead.lost_reason}`);
    }

    this.state.dropoffModalData = null;
    this.render();
  }

  renderDropoffModal() {
    if (!this.state.dropoffModalData) return '';
    const { leadId, defaultStage } = this.state.dropoffModalData;
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return '';

    return `
      <div class="deal-modal-backdrop open">
        <div class="deal-modal-box">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
            <h2 style="font-size: 16px; font-weight: 600; color: var(--color-error);">
              Exit Pipeline: Mark Lost or Invalid
            </h2>
            <button class="icon-btn-utility" onclick="app.closeDropoffModal()">✕</button>
          </div>

          <p style="font-size: 12px; color: var(--color-text-secondary); line-height: 16px;">
            Per PRD §3, <strong>Invalid</strong> (bad data / duplicate / spam) and <strong>Lost</strong> (opportunity lost to competitors) are kept distinct to prevent analytics distortion.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-field-group">
              <label class="form-field-label">Exit Status</label>
              <select class="form-field-select" id="dropoff-status" onchange="app.toggleDropoffFields(this.value)">
                <option value="lost" ${defaultStage === 'lost' ? 'selected' : ''}>Lost (Genuine Opportunity Lost)</option>
                <option value="invalid" ${defaultStage === 'invalid' ? 'selected' : ''}>Invalid (Bad Data / Spam / Duplicate)</option>
              </select>
            </div>

            <div class="form-field-group" id="dropoff-invalid-reason-group" style="display: ${defaultStage === 'invalid' ? 'flex' : 'none'};">
              <label class="form-field-label">Invalid Reason (Mandatory) *</label>
              <select class="form-field-select" id="dropoff-invalid-reason">
                <option value="wrong_number">Wrong Number</option>
                <option value="duplicate">Duplicate Record</option>
                <option value="not_interested">Not Interested at First Contact</option>
                <option value="spam">Spam / Test Submission</option>
                <option value="out_of_service_area">Out of Service Area</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-field-group" id="dropoff-lost-reason-group" style="display: ${defaultStage === 'invalid' ? 'none' : 'flex'};">
              <label class="form-field-label">Lost Reason (Mandatory) *</label>
              <textarea class="form-field-textarea" id="dropoff-lost-reason" style="height: 60px;" placeholder="e.g. Competitor provided lower quote; decision postponed"></textarea>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button class="fluent-btn fluent-btn-secondary" onclick="app.closeDropoffModal()">Cancel</button>
            <button class="fluent-btn fluent-btn-primary" style="background: var(--color-error); border-color: var(--color-error); font-weight: 600;" onclick="app.confirmDropoff('${lead.id}')">
              Confirm Exit
            </button>
          </div>
        </div>
      </div>
    `;
  }

  openLeadCreate() {
    this.state.quickCreateType = 'lead';
    this.state.quickCreateOpen = true;
    this.render();
    setTimeout(() => {
      const nameInput = document.getElementById('qc-lead-name');
      if (nameInput) nameInput.focus();
    }, 50);
  }

  openStaffCreate() {
    this.state.quickCreateType = 'staff';
    this.state.quickCreateOpen = true;
    this.render();
    setTimeout(() => {
      const nameInput = document.getElementById('qc-staff-name');
      if (nameInput) nameInput.focus();
    }, 50);
  }

  closeQuickCreate(event) {
    if (event && event.target && event.target.id !== 'quick-create-overlay') {
      return;
    }
    this.state.quickCreateOpen = false;
    const overlay = document.getElementById('quick-create-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  saveQuickCreate(openDetail = false) {
    if (this.state.quickCreateType === 'lead') {
      const isBdm = this.state.platform === 'bdm';
      const name = document.getElementById('qc-lead-name')?.value.trim();
      const phone = document.getElementById('qc-lead-phone')?.value.trim();
      const notes = document.getElementById('qc-lead-notes')?.value.trim();

      // STRICT MANDATORY VALIDATION: Name + Phone + Notes
      if (!name) {
        alert('Please enter Contact Person Name (Mandatory)');
        document.getElementById('qc-lead-name')?.focus();
        return;
      }
      if (!phone) {
        alert('Please enter Phone Number (Mandatory)');
        document.getElementById('qc-lead-phone')?.focus();
        return;
      }
      if (!notes) {
        alert('Please enter Discussion / Requirement Notes (Mandatory)');
        document.getElementById('qc-lead-notes')?.focus();
        return;
      }

      // Optional fields with defaults
      const company = document.getElementById('qc-lead-company')?.value.trim() || `${name}'s Organization`;
      const email = document.getElementById('qc-lead-email')?.value.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'contact'}@lead.in`;
      const city = document.getElementById('qc-lead-city')?.value.trim() || 'New Delhi';
      const state = document.getElementById('qc-lead-state')?.value || 'Delhi';
      const tagId = document.getElementById('qc-lead-tag')?.value || 'tag-02'; // Default: Custom App & Web Dev
      const valInput = document.getElementById('qc-lead-val')?.value.trim();
      const val = valInput ? parseInt(valInput, 10) : 250000;
      const assignedTo = document.getElementById('qc-lead-assigned')?.value || (isBdm ? (this.state.currentBdmId || 'u-02') : 'u-02');
      const followupDate = document.getElementById('qc-lead-date')?.value || new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

      const newId = `lead-${Date.now()}`;
      const newLead = {
        id: newId,
        name,
        company_name: company,
        account_id: null,
        phone,
        email,
        city,
        state,
        source: isBdm ? 'bdm_inbound' : 'manual_admin',
        tag_id: tagId,
        deal_type: 'new_business',
        assigned_to: assignedTo,
        status: 'new',
        priority: 'medium',
        budget: val,
        expected_value: val,
        probability_override: null,
        won_amount: null,
        next_followup_date: followupDate,
        last_followup_date: new Date().toISOString().slice(0, 10),
        followup_count: 1,
        sub_requirement: notes,
        brd_url: null,
        lost_reason: null,
        invalid_reason: null,
        created_by: isBdm ? (this.state.currentBdmId || 'u-02') : 'u-01',
        created_at: new Date().toISOString()
      };

      this.state.leads.unshift(newLead);

      // Record first interaction entry automatically
      this.state.interactions.unshift({
        id: `int-${Date.now()}`,
        lead_id: newId,
        bdm_id: assignedTo || 'u-02',
        type: 'call',
        call_result: 'interested',
        call_result_label: isBdm ? 'Direct BDM Inbound / Initial Note' : 'Manual Lead Created & Logged',
        call_result_type: 'positive',
        notes: notes,
        status_snapshot: 'new',
        next_action: `Follow-up scheduled on ${followupDate}`,
        created_at: new Date().toISOString()
      });

      this.closeQuickCreate();
      this.showToast(`Lead "${name}" created and added to pipeline`);

      if (openDetail) {
        if (this.state.platform === 'bdm') {
          this.navigateTo('B-06', { leadId: newId });
        } else {
          this.navigateTo('A-04', { leadId: newId });
        }
      } else {
        this.render();
      }
    } else {
      // Staff Create -> Triggers US-32 one-time password modal!
      const name = document.getElementById('qc-staff-name')?.value || 'Rohit Deshmukh';
      const email = document.getElementById('qc-staff-email')?.value || 'rohit@ckrtechnologies.in';
      const newEmpId = `CKR-BDM-00${this.state.users.length + 1}`;
      const tempPass = `CKR@${Math.floor(1000 + Math.random() * 9000)}`;

      this.state.users.push({
        id: `u-${Date.now()}`,
        employee_id: newEmpId,
        name,
        email,
        phone: '+91 98888 77777',
        role: 'bdm',
        designation: 'Business Development Manager',
        status: 'active',
        is_active: true,
        force_password_reset: true,
        has_seen_onboarding: false
      });

      this.closeQuickCreate();
      this.state.oneTimePasswordModal = {
        employee_id: newEmpId,
        password: tempPass
      };
      this.render();
    }
  }

  triggerPasswordReset(userId) {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return;
    const tempPass = `CKR-Reset-${Math.floor(1000 + Math.random() * 9000)}`;
    this.state.oneTimePasswordModal = {
      employee_id: user.employee_id,
      password: tempPass
    };
    this.render();
  }

  copyPassword(pass) {
    navigator.clipboard.writeText(pass);
    this.showToast('Copied password to clipboard');
  }

  closePasswordModal() {
    this.state.oneTimePasswordModal = null;
    this.render();
  }

  executeAssignment() {
    const targetBdmId = document.getElementById('assign-target-bdm')?.value;
    const targetBdm = this.state.users.find(u => u.id === targetBdmId);
    const count = this.state.selectedLeadIds.size || 1;

    if (this.state.selectedLeadIds.size > 0) {
      this.state.selectedLeadIds.forEach(id => {
        const lead = this.state.leads.find(l => l.id === id);
        if (lead) lead.assigned_to = targetBdmId;
      });
      this.state.selectedLeadIds.clear();
    } else {
      const lead = this.state.leads.find(l => l.id === this.state.activeLeadId);
      if (lead) lead.assigned_to = targetBdmId;
    }

    this.showToast(`Assigned ${count} lead(s) to ${targetBdm ? targetBdm.name : 'BDM'}`);
    this.navigateTo('A-03');
  }

  toggleBdmPunch() {
    this.state.bdmPunchedIn = !this.state.bdmPunchedIn;
    if (this.state.bdmPunchedIn) {
      this.state.lastPunchTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.showToast(`Punched in at ${this.state.lastPunchTime}`);
    } else {
      this.showToast(`Punched out successfully`);
    }
    this.render();
  }

  toggleTagStatus(tagId) {
    const tag = this.state.tags.find(t => t.id === tagId);
    if (tag) {
      tag.is_active = !tag.is_active;
      this.showToast(`Tag ${tag.name} set to ${tag.is_active ? 'Active' : 'Deactivated'}`);
      this.render();
    }
  }

  showAddInteractionModal(leadId) {
    const notes = prompt("Enter call notes / summary:");
    if (!notes) return;
    this.state.interactions.unshift({
      id: `int-${Date.now()}`,
      lead_id: leadId,
      bdm_id: 'u-02',
      type: 'call',
      call_result: 'interested',
      call_result_label: 'Call Logged / In Progress',
      call_result_type: 'positive',
      notes,
      next_action: 'Send proposal document',
      created_at: new Date().toISOString()
    });
    this.showToast('Interaction logged into history');
    this.render();
  }

  saveBdmFollowup(leadId) {
    const channel = document.getElementById('bdm-followup-channel')?.value || 'call';
    const notes = document.getElementById('bdm-followup-notes')?.value || 'Follow-up interaction recorded';
    const nextDate = document.getElementById('bdm-followup-date')?.value || '';
    const result = document.getElementById('bdm-followup-result')?.value || 'interested';

    const resultLabels = {
      terms_agreed: 'Terms Agreed / Deal Finalizing',
      demo_scheduled: 'Demo Scheduled / Video Sent',
      demo_completed: 'Virtual Demo Completed',
      site_visit: 'Site Visit Scheduled',
      interested: 'Interested / Follow-up Callback Set',
      no_answer: 'Ringing / No Answer (Retry Queued)',
      not_interested: 'Not Interested / Drop-off'
    };

    const lead = this.state.leads.find(l => l.id === leadId);
    if (lead) {
      lead.followup_count = (lead.followup_count || 0) + 1;
      lead.last_followup_date = new Date().toISOString().slice(0, 10);
      if (nextDate) lead.next_followup_date = nextDate;
      if (lead.status === 'new') lead.status = 'contacted';
    }

    this.state.interactions.unshift({
      id: `int-${Date.now()}`,
      lead_id: leadId,
      bdm_id: 'u-02',
      type: channel,
      call_result: result,
      call_result_label: resultLabels[result] || 'Interaction Logged',
      call_result_type: result === 'no_answer' ? 'neutral' : result === 'not_interested' ? 'negative' : 'positive',
      notes: notes,
      status_snapshot: lead ? lead.status : 'follow_up',
      next_action: nextDate ? `Scheduled next touch on ${nextDate}` : 'Follow up next week',
      created_at: new Date().toISOString()
    });

    this.showToast('Activity logged to waterfall history');
    this.navigateTo('B-06', { leadId });
  }

  quickLogBdmInteraction(leadId) {
    const notes = prompt("Enter call notes or discussion summary for this lead:");
    if (!notes) return;
    const nextAction = prompt("Enter next follow-up action (e.g. Call Friday 11 AM):", "Follow up with client");
    
    const lead = this.state.leads.find(l => l.id === leadId);
    if (lead) {
      lead.followup_count = (lead.followup_count || 0) + 1;
      lead.last_followup_date = new Date().toISOString().slice(0, 10);
      if (lead.status === 'new') lead.status = 'contacted';
    }

    this.state.interactions.unshift({
      id: `int-${Date.now()}`,
      lead_id: leadId,
      bdm_id: 'u-02',
      type: 'call',
      call_result: 'interested',
      call_result_label: 'Call Logged / In Progress',
      call_result_type: 'positive',
      notes: notes,
      status_snapshot: lead ? lead.status : 'follow_up',
      next_action: nextAction || 'Follow up with client',
      created_at: new Date().toISOString()
    });

    this.showToast('New call interaction logged into waterfall history');
    this.render();
  }

  // ==========================================================
  // RTK DATE SLICE & PRESETS ACTIONS
  // ==========================================================
  setDatePreset(preset, dateVal) {
    if (preset === 'today') this.selectDatePreset('today');
    else if (preset === 'yesterday') this.selectDatePreset('yesterday');
    else if (preset === 'month') this.selectDatePreset('this_month');
    else if (preset === 'mtd') this.selectDatePreset('mtd');
    else if (preset === 'ytd') this.selectDatePreset('ytd');
    else if (dateVal) this.applyCustomDateRange(dateVal, dateVal);
    else this.selectDatePreset(preset);
  }

  setGlobalDate(dateVal) {
    if (!dateVal) {
      this.selectDatePreset('all');
      return;
    }
    if (dateVal === '2026-09-22') {
      this.selectDatePreset('today');
      return;
    }
    if (dateVal === '2026-09-21') {
      this.selectDatePreset('yesterday');
      return;
    }

    this.state.globalDate = dateVal;
    this.state.selectedDate = dateVal;
    const formatted = this.formatDateReadable(dateVal);
    this.state.datePreset = 'custom';
    this.state.dateRange = {
      preset: 'custom',
      startDate: dateVal,
      endDate: dateVal,
      label: `Single Date (${formatted})`,
      shortLabel: formatted
    };
    this.state.customStartDateInput = dateVal;
    this.state.customEndDateInput = dateVal;

    const topPicker = document.getElementById('proto-date-picker');
    if (topPicker && topPicker.value !== dateVal) {
      topPicker.value = dateVal;
    }
    this.showToast(`Platform date set to ${formatted}`);
    this.render();
  }

  // ==========================================================
  // AUTH PORTAL & EXECUTIVE IDENTITY ACTIONS
  // ==========================================================
  loginAdmin() {
    this.state.platform = 'admin';
    this.navigateTo('A-02');
    this.showToast('Welcome to CKR Connect · Chandan Mallik (Executive Admin)');
  }

  loginBdm(userId = 'u-02') {
    this.state.platform = 'bdm';
    this.state.currentUser = this.state.users.find(u => u.id === userId) || this.state.users[1];
    this.navigateTo('B-02');
    this.showToast(`Logged in as ${this.state.currentUser.name} (BDM Mobile Hub)`);
  }

  logoutAdmin() {
    this.state.userMenuOpen = false;
    this.state.currentScreen = 'A-01';
    this.showToast('Signed out of CKR Connect');
    this.render();
  }

  toggleUserMenu() {
    this.state.userMenuOpen = !this.state.userMenuOpen;
    this.render();
  }

  // ==========================================================
  // FULL STAFF CRUD MANAGEMENT ACTIONS
  // ==========================================================
  openStaffModal(staffId = null) {
    this.state.staffModalOpen = true;
    this.state.staffEditingId = staffId;
    this.state.staffModalMode = staffId ? 'edit' : 'create';
    this.render();
  }

  closeStaffModal() {
    this.state.staffModalOpen = false;
    this.state.staffEditingId = null;
    this.render();
  }

  saveStaffModal() {
    const name = document.getElementById('staff-modal-name')?.value?.trim();
    const email = document.getElementById('staff-modal-email')?.value?.trim();
    const phone = document.getElementById('staff-modal-phone')?.value?.trim();
    const empId = document.getElementById('staff-modal-empid')?.value?.trim();
    const designation = document.getElementById('staff-modal-designation')?.value?.trim();
    const role = document.getElementById('staff-modal-role')?.value;
    const dept = document.getElementById('staff-modal-dept')?.value;
    const status = document.getElementById('staff-modal-status')?.value;
    const targetVal = parseFloat(document.getElementById('staff-modal-target')?.value) || 0;

    if (!name || !email || !phone) {
      alert('Please fill in all required fields: Full Name, Email, and Mobile Phone.');
      return;
    }

    if (this.state.staffModalMode === 'create') {
      const nextNum = String(this.state.users.length + 1).padStart(2, '0');
      const newId = `u-${nextNum}`;
      const newUser = {
        id: newId,
        employee_id: empId || `CKR-BDM-${String(this.state.users.length + 1).padStart(3, '0')}`,
        name: name,
        email: email,
        phone: phone,
        role: role || 'bdm',
        designation: designation || 'BDM - Inside Sales',
        department: dept || 'Sales',
        date_of_joining: new Date().toISOString().slice(0, 10),
        status: status || 'active',
        is_active: (status === 'active'),
        sales_target: targetVal,
        force_password_reset: true,
        has_seen_onboarding: false
      };
      this.state.users.push(newUser);
      this.closeStaffModal();

      // Show temporary onboarding password dialog
      const tempPass = `CKR@${Math.floor(1000 + Math.random() * 9000)}`;
      this.state.oneTimePasswordModal = {
        employee_id: newUser.employee_id,
        password: tempPass
      };

      this.showToast(`Staff member "${name}" (${newUser.employee_id}) created successfully`);
    } else {
      const user = this.state.users.find(u => u.id === this.state.staffEditingId);
      if (user) {
        user.name = name;
        user.email = email;
        user.phone = phone;
        if (empId) user.employee_id = empId;
        user.designation = designation;
        user.role = role;
        user.department = dept;
        user.status = status;
        user.is_active = (status === 'active');
        user.sales_target = targetVal;
        this.closeStaffModal();
        this.showToast(`Updated staff profile for ${name}`);
      }
    }
    this.render();
  }

  openStaffDeleteModal(staffId) {
    this.state.staffDeactivateModalOpen = true;
    this.state.staffDeactivateTargetId = staffId;
    this.state.staffDeactivateReassignTo = 'reassign';
    this.render();
  }

  closeStaffDeleteModal() {
    this.state.staffDeactivateModalOpen = false;
    this.state.staffDeactivateTargetId = null;
    this.render();
  }

  confirmStaffDeactivate() {
    const targetUser = this.state.users.find(u => u.id === this.state.staffDeactivateTargetId);
    if (!targetUser) return;

    const action = document.querySelector('input[name="staff-reassign-opt"]:checked')?.value || 'reassign';
    const activeLeads = this.state.leads.filter(l => l.assigned_to === targetUser.id && !['won', 'lost', 'invalid'].includes(l.status));

    if (targetUser.status === 'active') {
      if (action === 'reassign' && activeLeads.length > 0) {
        const targetBdmId = document.getElementById('staff-reassign-select')?.value;
        const targetBdm = this.state.users.find(u => u.id === targetBdmId);
        activeLeads.forEach(l => {
          l.assigned_to = targetBdmId;
        });
        if (targetBdm) {
          this.showToast(`Reassigned ${activeLeads.length} leads to ${targetBdm.name}`);
        }
      } else if (action === 'pool' && activeLeads.length > 0) {
        activeLeads.forEach(l => {
          l.assigned_to = null;
        });
        this.showToast(`Moved ${activeLeads.length} leads to Unassigned Pool`);
      }
      targetUser.status = 'inactive';
      targetUser.is_active = false;
      this.showToast(`Deactivated staff account for ${targetUser.name}`);
    } else {
      targetUser.status = 'active';
      targetUser.is_active = true;
      this.showToast(`Reactivated staff account for ${targetUser.name}`);
    }

    this.closeStaffDeleteModal();
    this.render();
  }

  handleStaffSearch(query) {
    this.state.staffSearchQuery = query;
    this.render();
  }

  filterStaffByStatus(status) {
    this.state.staffFilterStatus = status;
    this.render();
  }
}

// Global App Instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new CkrCrmApp();
});
