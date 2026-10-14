/**
 * View: OnboardingView
 * Controla todo o fluxo visual de boas-vindas, login/cadastro e wizard de configuração inicial do ciclo.
 */
import { addDays, toLocalISODate } from '../utils/dateUtils.js';

const TOTAL_WIZARD_STEPS = 5;

export class OnboardingView {
  constructor() {
    this.container = document.getElementById('onboardingOverlay');
    this.progressBar = document.getElementById('onboardingProgressFill');
    this.steps = Array.from(document.querySelectorAll('.onboarding-step'));

    this.selectedGoal = 'track';
    this.selectedDate = toLocalISODate(addDays(new Date(), -2));
    this.periodDays = 5;
    this.cycleDays = 28;
    this.isUnknownCycle = false;
    this.selectedContraceptive = 'none';
    this.userName = 'Ana Julia';
    this.reminders = true;

    this.currentStepIndex = 0;
    this._setupDOMListeners();
  }

  setInitialValues(profile) {
    if (profile?.name) {
      this.userName = profile.name;
      const nameInput = document.getElementById('inputUserName');
      if (nameInput) nameInput.value = profile.name;
    }
  }

  _setupDOMListeners() {
    if (!this.container) return;

    // Seleção de objetivo
    this.container.querySelectorAll('.choice-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('.choice-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedGoal = card.dataset.goal || 'track';
      });
    });

    // Atalhos rápidos de data da última menstruação
    this.container.querySelectorAll('.date-quick-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.date-quick-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const daysAgo = parseInt(btn.dataset.daysAgo, 10);
        this.selectedDate = toLocalISODate(addDays(new Date(), -daysAgo));
        const dateInput = document.getElementById('inputLastPeriodDate');
        if (dateInput) dateInput.value = this.selectedDate;
      });
    });

    const dateInput = document.getElementById('inputLastPeriodDate');
    if (dateInput) {
      dateInput.value = this.selectedDate;
      dateInput.max = toLocalISODate(new Date());
      dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectedDate = e.target.value;
          this.container.querySelectorAll('.date-quick-btn').forEach((b) => b.classList.remove('active'));
        }
      });
    }

    // Stepper de Duração da Menstruação (2 a 10 dias)
    const btnPeriodMinus = document.getElementById('btnPeriodMinus');
    const btnPeriodPlus = document.getElementById('btnPeriodPlus');
    const displayPeriod = document.getElementById('displayPeriodDays');
    if (btnPeriodMinus && btnPeriodPlus && displayPeriod) {
      btnPeriodMinus.addEventListener('click', () => {
        this.periodDays = Math.max(2, this.periodDays - 1);
        displayPeriod.textContent = `${this.periodDays} dias`;
      });
      btnPeriodPlus.addEventListener('click', () => {
        this.periodDays = Math.min(10, this.periodDays + 1);
        displayPeriod.textContent = `${this.periodDays} dias`;
      });
    }

    // Stepper de Duração do Ciclo (21 a 45 dias)
    const btnCycleMinus = document.getElementById('btnCycleMinus');
    const btnCyclePlus = document.getElementById('btnCyclePlus');
    const displayCycle = document.getElementById('displayCycleDays');
    if (btnCycleMinus && btnCyclePlus && displayCycle) {
      btnCycleMinus.addEventListener('click', () => {
        this.cycleDays = Math.max(21, this.cycleDays - 1);
        displayCycle.textContent = `${this.cycleDays} dias`;
      });
      btnCyclePlus.addEventListener('click', () => {
        this.cycleDays = Math.min(45, this.cycleDays + 1);
        displayCycle.textContent = `${this.cycleDays} dias`;
      });
    }

    // Checkbox de ciclo desconhecido
    const checkUnknown = document.getElementById('checkUnknownCycle');
    const cardCycle = document.getElementById('cardCycleLength');
    if (checkUnknown) {
      checkUnknown.addEventListener('change', (e) => {
        this.isUnknownCycle = e.target.checked;
        if (cardCycle) {
          cardCycle.style.opacity = this.isUnknownCycle ? '0.45' : '1';
          cardCycle.style.pointerEvents = this.isUnknownCycle ? 'none' : 'auto';
        }
      });
    }

    // Pílulas de método contraceptivo
    const pillsContainer = document.getElementById('contraceptivePills');
    if (pillsContainer) {
      pillsContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill-opt');
        if (!pill) return;
        pillsContainer.querySelectorAll('.pill-opt').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedContraceptive = pill.dataset.val || 'none';
      });
    }

    // Switch de lembretes
    const reminderSwitch = document.getElementById('switchReminders');
    if (reminderSwitch) {
      reminderSwitch.addEventListener('click', () => {
        const isCurrentlyOn = reminderSwitch.classList.contains('on');
        this.reminders = !isCurrentlyOn;
        reminderSwitch.classList.toggle('on', this.reminders);
        reminderSwitch.setAttribute('aria-checked', String(this.reminders));
      });
    }
  }

  show() {
    if (!this.container) return;
    this.container.classList.add('active');
    this.container.inert = false;
    this.goToStep(0);
  }

  hide() {
    if (!this.container) return;
    this.container.classList.remove('active');
    this.container.inert = true;
  }

  goToStep(index) {
    this.currentStepIndex = index;
    this.steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === index);
      if (idx === index) {
        step.scrollTop = 0;
      }
    });

    if (this.progressBar) {
      if (index >= 2 && index <= 5) {
        const progress = ((index - 1) / (TOTAL_WIZARD_STEPS - 1)) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressBar.parentElement.style.opacity = '1';
      } else {
        this.progressBar.parentElement.style.opacity = '0';
      }
    }
  }

  bindFlowEvents({ onComplete, onSocialAuth, onInvalid }) {
    if (!this.container) return;

    // 1. Splash -> Iniciar
    const btnStart = document.getElementById('btnStartOnboarding');
    if (btnStart) {
      btnStart.addEventListener('click', () => this.goToStep(2));
    }

    // 2. Splash -> Entrar
    const btnGoToAuth = document.getElementById('btnGoToAuth');
    if (btnGoToAuth) {
      btnGoToAuth.addEventListener('click', () => this.goToStep(1));
    }

    // 3. Auth -> Alternar Abas (Criar Conta / Entrar)
    const authTabs = this.container.querySelectorAll('.auth-tab');
    authTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        authTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        const submitBtn = document.getElementById('btnSubmitAuth');
        if (submitBtn) {
          submitBtn.textContent = mode === 'signup' ? 'Criar minha conta 🌸' : 'Entrar na minha conta 🌸';
        }
      });
    });

    // 4. Social Auth (Google / Apple)
    const btnGoogle = document.getElementById('btnGoogleAuth');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => {
        onSocialAuth('Google');
        this.goToStep(2);
      });
    }
    const btnApple = document.getElementById('btnAppleAuth');
    if (btnApple) {
      btnApple.addEventListener('click', () => {
        onSocialAuth('Apple');
        this.goToStep(2);
      });
    }

    // 5. Auth Skip ou Submit
    const btnSkipAuth = document.getElementById('btnSkipAuth');
    if (btnSkipAuth) {
      btnSkipAuth.addEventListener('click', () => this.goToStep(2));
    }

    const btnSubmitAuth = document.getElementById('btnSubmitAuth');
    if (btnSubmitAuth) {
      btnSubmitAuth.addEventListener('click', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('inputAuthEmail');
        const email = emailInput?.value.trim() || '';

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (onInvalid) onInvalid('Informe um e-mail válido para continuar 🌸');
          return;
        }

        onSocialAuth('Email', email || 'anajulia@exemplo.com');
        this.goToStep(2);
      });
    }

    // 6. Wizard: Próximos e Voltar
    this.container.querySelectorAll('[data-next-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextIndex = parseInt(btn.dataset.nextStep, 10);
        this.goToStep(nextIndex);
      });
    });

    this.container.querySelectorAll('[data-prev-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prevIndex = parseInt(btn.dataset.prevStep, 10);
        this.goToStep(prevIndex);
      });
    });

    // 7. Concluir Onboarding
    const btnFinish = document.getElementById('btnFinishOnboarding');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        const nameInput = document.getElementById('inputUserName');
        if (nameInput?.value.trim()) {
          this.userName = nameInput.value.trim();
        }

        this.goToStep(6); // Animação de cálculo

        setTimeout(() => {
          onComplete({
            name: this.userName,
            goal: this.selectedGoal,
            lastPeriodDate: this.selectedDate,
            periodDays: this.periodDays,
            cycleDays: this.cycleDays,
            isUnknownCycle: this.isUnknownCycle,
            contraceptive: this.selectedContraceptive,
            reminders: this.reminders
          });
          this.hide();
        }, 1500);
      });
    }
  }
}
