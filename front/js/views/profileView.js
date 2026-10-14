/**
 * View: ProfileView
 * Controla os elementos da tela de perfil, informações do usuário, tema e preferências fixas de saúde/rotina.
 */
const CONTRACEPTIVE_NAMES = {
  none: 'Nenhum',
  pill: 'Pílula anticoncepcional diária',
  'pill-taken': 'Pílula no horário',
  iud: 'DIU / Implante hormonal',
  condom: 'Preservativo',
  other: 'Outro método'
};

const CONDITION_NAMES = {
  sop: 'SOP (Ovários Policísticos)',
  endometriose: 'Endometriose',
  irregular: 'Ciclo Irregular',
  pms_heavy: 'TPM Severa / TDPM',
  migraine: 'Enxaqueca Menstrual'
};

export class ProfileView {
  constructor() {
    this.themeSwitch = document.getElementById('themeSwitch');
    this.topAvatar = document.getElementById('topAvatar');
    this.userGreeting = document.getElementById('userGreeting');
    this.profileAvatar = document.getElementById('profileAvatar');
    this.profileName = document.getElementById('profileName');
    this.profileHandle = document.getElementById('profileHandle');
    this.restartOnboardingBtn = document.getElementById('btnRestartOnboarding');

    // Rotina & Condições
    this.contraceptiveLabel = document.getElementById('profileContraceptiveLabel');
    this.conditionsLabel = document.getElementById('profileConditionsLabel');
    this.btnChangeContraceptive = document.getElementById('btnChangeRoutineContraceptive');
    this.btnManageConditions = document.getElementById('btnManageConditions');
    this.switchAutoPreFill = document.getElementById('switchAutoPreFill');

    // Modal de condições
    this.conditionsModal = document.getElementById('conditionsModal');
    this.closeConditionsModalBtn = document.getElementById('closeConditionsModal');
    this.btnSaveConditions = document.getElementById('btnSaveConditions');
    this.conditionsCheckList = document.getElementById('conditionsCheckList');

    this._setupModalListeners();
  }

  _setupModalListeners() {
    if (this.closeConditionsModalBtn) {
      this.closeConditionsModalBtn.addEventListener('click', () => this.closeConditionsModal());
    }
    if (this.conditionsModal) {
      this.conditionsModal.addEventListener('click', (e) => {
        if (e.target === this.conditionsModal) this.closeConditionsModal();
      });
    }
    if (this.btnManageConditions) {
      this.btnManageConditions.addEventListener('click', () => this.openConditionsModal());
    }
  }

  openConditionsModal() {
    if (!this.conditionsModal) return;
    this.conditionsModal.classList.add('show');
    this.conditionsModal.setAttribute('aria-hidden', 'false');
  }

  closeConditionsModal() {
    if (!this.conditionsModal) return;
    this.conditionsModal.classList.remove('show');
    this.conditionsModal.setAttribute('aria-hidden', 'true');
  }

  renderUserProfile(profile, routineDefaults = null) {
    if (this.userGreeting) {
      this.userGreeting.textContent = `Olá, ${profile.name} 🌸`;
    }
    if (this.topAvatar) {
      this.topAvatar.textContent = profile.initials || 'AJ';
    }
    if (this.profileAvatar) {
      this.profileAvatar.textContent = profile.initials || 'AJ';
    }
    if (this.profileName) {
      this.profileName.textContent = profile.name;
    }
    if (this.profileHandle) {
      this.profileHandle.textContent = profile.handle;
    }

    // Renderiza rótulo de contraceptivo fixo
    if (this.contraceptiveLabel) {
      const cValue = routineDefaults?.contraceptive || profile.contraceptiveMethod || 'none';
      this.contraceptiveLabel.textContent = CONTRACEPTIVE_NAMES[cValue] || cValue;
    }

    // Renderiza condições de saúde salvas
    const conditions = routineDefaults?.conditions || profile.healthConditions || [];
    if (this.conditionsLabel) {
      if (conditions.length) {
        const names = conditions.map((c) => CONDITION_NAMES[c] || c).join(', ');
        this.conditionsLabel.textContent = names;
      } else {
        this.conditionsLabel.textContent = 'Nenhuma condição selecionada';
      }
    }

    // Marca checkboxes no modal
    if (this.conditionsCheckList) {
      this.conditionsCheckList.querySelectorAll('input[type=checkbox]').forEach((cb) => {
        cb.checked = conditions.includes(cb.value);
      });
    }

    // Estado do switch de auto preenchimento
    if (this.switchAutoPreFill) {
      const isAuto = routineDefaults?.pinDefaults ?? true;
      this.switchAutoPreFill.classList.toggle('on', isAuto);
      this.switchAutoPreFill.setAttribute('aria-checked', String(isAuto));
    }
  }

  bindSaveConditions(handler) {
    if (!this.btnSaveConditions || !this.conditionsCheckList) return;
    this.btnSaveConditions.addEventListener('click', () => {
      const selected = Array.from(this.conditionsCheckList.querySelectorAll('input[type=checkbox]:checked')).map(
        (cb) => cb.value
      );
      handler(selected);
      this.closeConditionsModal();
    });
  }

  bindChangeContraceptive(handler) {
    if (this.btnChangeContraceptive) {
      this.btnChangeContraceptive.addEventListener('click', () => handler());
    }
  }

  bindAutoPreFillToggle(handler) {
    if (this.switchAutoPreFill) {
      this.switchAutoPreFill.addEventListener('click', () => {
        const isCurrentlyOn = this.switchAutoPreFill.classList.contains('on');
        const newState = !isCurrentlyOn;
        this.switchAutoPreFill.classList.toggle('on', newState);
        this.switchAutoPreFill.setAttribute('aria-checked', String(newState));
        handler(newState);
      });
    }
  }

  bindThemeToggle(handler) {
    if (!this.themeSwitch) return;
    this.themeSwitch.addEventListener('click', () => {
      const isDark = !this.themeSwitch.classList.contains('on');
      handler(isDark ? 'dark' : 'light');
    });
  }

  applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    if (this.themeSwitch) {
      this.themeSwitch.classList.toggle('on', isDark);
      this.themeSwitch.setAttribute('aria-checked', String(isDark));
    }
  }

  bindRestartOnboarding(handler) {
    if (this.restartOnboardingBtn) {
      this.restartOnboardingBtn.addEventListener('click', () => handler());
    }
  }

  bindSoonButtons(handler) {
    document.querySelectorAll('[data-soon]').forEach((btn) => {
      btn.addEventListener('click', () => {
        handler(btn.dataset.soon);
      });
    });
  }
}
