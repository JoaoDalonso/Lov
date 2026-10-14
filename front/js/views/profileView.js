/**
 * View: ProfileView
 * Controla os elementos da tela de perfil, informações do usuário, tema,
 * preferências fixas de rotina/saúde e modais funcionais (Amigas, Lembretes, Privacidade, Contraceptivo, Idioma).
 */
const CONTRACEPTIVE_NAMES = {
  none: 'Nenhum',
  pill: 'Pílula anticoncepcional diária',
  'pill-taken': 'Pílula no horário',
  iud: 'DIU / Implante hormonal',
  condom: 'Preservativo',
  injection: 'Injeção hormonal',
  ring_patch: 'Anel vaginal ou Adesivo',
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

    // Botões principais do perfil
    this.btnOpenFriends = document.getElementById('btnOpenFriends');
    this.btnOpenReminders = document.getElementById('btnOpenReminders');
    this.btnOpenPrivacy = document.getElementById('btnOpenPrivacy');
    this.btnOpenLanguage = document.getElementById('btnOpenLanguage');

    // Rotina & Condições
    this.contraceptiveLabel = document.getElementById('profileContraceptiveLabel');
    this.conditionsLabel = document.getElementById('profileConditionsLabel');
    this.btnChangeContraceptive = document.getElementById('btnChangeRoutineContraceptive');
    this.btnManageConditions = document.getElementById('btnManageConditions');
    this.switchAutoPreFill = document.getElementById('switchAutoPreFill');

    // Modais
    this.conditionsModal = document.getElementById('conditionsModal');
    this.closeConditionsModalBtn = document.getElementById('closeConditionsModal');
    this.btnSaveConditions = document.getElementById('btnSaveConditions');
    this.conditionsCheckList = document.getElementById('conditionsCheckList');

    this.friendsModal = document.getElementById('friendsModal');
    this.closeFriendsModalBtn = document.getElementById('closeFriendsModal');
    this.btnCopyInviteLink = document.getElementById('btnCopyInviteLink');
    this.btnAddFriendBtn = document.getElementById('btnAddFriendBtn');
    this.inputFriendHandle = document.getElementById('inputFriendHandle');
    this.friendsList = document.getElementById('friendsList');

    this.remindersModal = document.getElementById('remindersModal');
    this.closeRemindersModalBtn = document.getElementById('closeRemindersModal');
    this.btnSaveReminders = document.getElementById('btnSaveReminders');

    this.privacyModal = document.getElementById('privacyModal');
    this.closePrivacyModalBtn = document.getElementById('closePrivacyModal');
    this.btnClosePrivacySettings = document.getElementById('btnClosePrivacySettings');
    this.btnExportHealthData = document.getElementById('btnExportHealthData');
    this.btnResetCycleData = document.getElementById('btnResetCycleData');

    this.contraceptiveModal = document.getElementById('contraceptiveModal');
    this.closeContraceptiveModalBtn = document.getElementById('closeContraceptiveModal');
    this.btnSaveContraceptiveModal = document.getElementById('btnSaveContraceptiveModal');
    this.contraceptivePillsContainer = document.getElementById('contraceptiveModalPills');

    this.languageModal = document.getElementById('languageModal');
    this.closeLanguageModalBtn = document.getElementById('closeLanguageModal');
    this.btnConfirmLanguage = document.getElementById('btnConfirmLanguage');

    // Callbacks externos
    this._onSaveContraceptive = null;
    this._onExportData = null;
    this._onResetData = null;
    this._onToast = null;

    this._setupModalListeners();
  }

  setToastHandler(handler) {
    this._onToast = handler;
  }

  _notify(message) {
    if (this._onToast) {
      this._onToast(message);
    }
  }

  _setupModalListeners() {
    // 1. Condições de saúde
    if (this.closeConditionsModalBtn) {
      this.closeConditionsModalBtn.addEventListener('click', () => this._closeModal(this.conditionsModal));
    }
    if (this.btnManageConditions) {
      this.btnManageConditions.addEventListener('click', () => this._openModal(this.conditionsModal));
    }

    // 2. Minhas amigas
    if (this.btnOpenFriends) {
      this.btnOpenFriends.addEventListener('click', () => this._openModal(this.friendsModal));
    }
    if (this.closeFriendsModalBtn) {
      this.closeFriendsModalBtn.addEventListener('click', () => this._closeModal(this.friendsModal));
    }
    if (this.btnCopyInviteLink) {
      this.btnCopyInviteLink.addEventListener('click', () => {
        navigator.clipboard?.writeText('https://lov.app/convite/@anajulia');
        this._notify('Link de convite copiado para a área de transferência! 🔗');
      });
    }
    if (this.btnAddFriendBtn && this.inputFriendHandle) {
      this.btnAddFriendBtn.addEventListener('click', () => {
        const val = this.inputFriendHandle.value.trim();
        if (!val) return;
        this.inputFriendHandle.value = '';
        this._notify(`Convite enviado para ${val}! 🌸`);
      });
    }
    if (this.friendsList) {
      this.friendsList.addEventListener('click', (e) => {
        const hugBtn = e.target.closest('[data-friend-name]');
        if (hugBtn) {
          const name = hugBtn.dataset.friendName;
          hugBtn.style.transform = 'scale(1.25)';
          setTimeout(() => (hugBtn.style.transform = ''), 200);
          this._notify(`Você enviou um abraço virtual para ${name}! 💖☕`);
        }
      });
    }

    // 3. Lembretes
    if (this.btnOpenReminders) {
      this.btnOpenReminders.addEventListener('click', () => this._openModal(this.remindersModal));
    }
    if (this.closeRemindersModalBtn) {
      this.closeRemindersModalBtn.addEventListener('click', () => this._closeModal(this.remindersModal));
    }
    if (this.btnSaveReminders) {
      this.btnSaveReminders.addEventListener('click', () => {
        this._closeModal(this.remindersModal);
        this._notify('Lembretes e horários salvos com sucesso! 🔔💗');
      });
    }

    // 4. PIN e Privacidade
    if (this.btnOpenPrivacy) {
      this.btnOpenPrivacy.addEventListener('click', () => this._openModal(this.privacyModal));
    }
    if (this.closePrivacyModalBtn) {
      this.closePrivacyModalBtn.addEventListener('click', () => this._closeModal(this.privacyModal));
    }
    if (this.btnClosePrivacySettings) {
      this.btnClosePrivacySettings.addEventListener('click', () => this._closeModal(this.privacyModal));
    }
    if (this.btnExportHealthData) {
      this.btnExportHealthData.addEventListener('click', () => {
        if (this._onExportData) {
          this._onExportData();
        } else {
          this._notify('Exportando seus dados de saúde em JSON... 📥');
        }
      });
    }
    if (this.btnResetCycleData) {
      this.btnResetCycleData.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja redefinir seus dados do ciclo? Essa ação restaurará os valores iniciais.')) {
          if (this._onResetData) {
            this._onResetData();
          } else {
            localStorage.clear();
            window.location.reload();
          }
        }
      });
    }

    // 5. Contraceptivo modal
    if (this.btnChangeContraceptive) {
      this.btnChangeContraceptive.addEventListener('click', () => this._openModal(this.contraceptiveModal));
    }
    if (this.closeContraceptiveModalBtn) {
      this.closeContraceptiveModalBtn.addEventListener('click', () => this._closeModal(this.contraceptiveModal));
    }
    if (this.contraceptivePillsContainer) {
      this.contraceptivePillsContainer.addEventListener('click', (e) => {
        const choice = e.target.closest('.contraceptive-choice');
        if (!choice) return;
        this.contraceptivePillsContainer
          .querySelectorAll('.contraceptive-choice')
          .forEach((c) => c.classList.remove('active'));
        choice.classList.add('active');
      });
    }
    if (this.btnSaveContraceptiveModal) {
      this.btnSaveContraceptiveModal.addEventListener('click', () => {
        const active = this.contraceptivePillsContainer?.querySelector('.contraceptive-choice.active');
        const val = active?.dataset.value || 'pill';
        this._closeModal(this.contraceptiveModal);
        if (this._onSaveContraceptive) {
          this._onSaveContraceptive(val);
        } else {
          if (this.contraceptiveLabel) {
            this.contraceptiveLabel.textContent = CONTRACEPTIVE_NAMES[val] || val;
          }
          this._notify(`Método atualizado para: ${CONTRACEPTIVE_NAMES[val] || val} 💊`);
        }
      });
    }

    // 6. Idioma modal
    if (this.btnOpenLanguage) {
      this.btnOpenLanguage.addEventListener('click', () => this._openModal(this.languageModal));
    }
    if (this.closeLanguageModalBtn) {
      this.closeLanguageModalBtn.addEventListener('click', () => this._closeModal(this.languageModal));
    }
    if (this.btnConfirmLanguage) {
      this.btnConfirmLanguage.addEventListener('click', () => {
        this._closeModal(this.languageModal);
        this._notify('Idioma mantido em Português (Brasil) 🇧🇷');
      });
    }

    // Fechar ao clicar fora no overlay
    [
      this.conditionsModal,
      this.friendsModal,
      this.remindersModal,
      this.privacyModal,
      this.contraceptiveModal,
      this.languageModal
    ].forEach((m) => {
      if (!m) return;
      m.addEventListener('click', (e) => {
        if (e.target === m) this._closeModal(m);
      });
    });
  }

  _openModal(modal) {
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }

  _closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  openConditionsModal() {
    this._openModal(this.conditionsModal);
  }

  closeConditionsModal() {
    this._closeModal(this.conditionsModal);
  }

  openContraceptiveModal() {
    this._openModal(this.contraceptiveModal);
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
    const cValue = routineDefaults?.contraceptive || profile.contraceptiveMethod || 'none';
    if (this.contraceptiveLabel) {
      this.contraceptiveLabel.textContent = CONTRACEPTIVE_NAMES[cValue] || cValue;
    }

    // Seleciona o pill correto no modal
    if (this.contraceptivePillsContainer) {
      this.contraceptivePillsContainer.querySelectorAll('.contraceptive-choice').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === cValue);
      });
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

  bindSaveContraceptive(handler) {
    this._onSaveContraceptive = handler;
  }

  bindChangeContraceptive(handler) {
    if (this.btnChangeContraceptive) {
      this.btnChangeContraceptive.addEventListener('click', () => {
        this.openContraceptiveModal();
        if (handler) handler();
      });
    }
  }

  bindExportData(handler) {
    this._onExportData = handler;
  }

  bindResetData(handler) {
    this._onResetData = handler;
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
