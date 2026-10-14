/**
 * View: OnboardingView
 * Controla todo o fluxo visual de boas-vindas, login/cadastro e wizard de configuração inicial do ciclo.
 */
export class OnboardingView {
  constructor() {
    this.container = document.getElementById('onboardingOverlay');
    this.progressBar = document.getElementById('onboardingProgressFill');
    this.steps = Array.from(document.querySelectorAll('.onboarding-step'));
    
    // Controles de valor
    this.selectedGoal = 'track';
    this.selectedDate = this._getDefaultStartDate(2);
    this.periodDays = 5;
    this.cycleDays = 28;
    this.isUnknownCycle = false;
    this.selectedContraceptive = 'none';
    this.userName = 'Ana Julia';
    this.reminders = true;

    this.currentStepIndex = 0;
    this._setupDOMListeners();
  }

  _getDefaultStartDate(daysAgo = 2) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  _setupDOMListeners() {
    if (!this.container) return;

    // Seleção de objetivo
    this.container.querySelectorAll('.choice-card').forEach(card => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedGoal = card.dataset.goal || 'track';
      });
    });

    // Atalhos de data da última menstruação
    this.container.querySelectorAll('.date-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.date-quick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const daysAgo = parseInt(btn.dataset.daysAgo, 10);
        this.selectedDate = this._getDefaultStartDate(daysAgo);
        const dateInput = document.getElementById('inputLastPeriodDate');
        if (dateInput) dateInput.value = this.selectedDate;
      });
    });

    const dateInput = document.getElementById('inputLastPeriodDate');
    if (dateInput) {
      dateInput.value = this.selectedDate;
      dateInput.max = new Date().toISOString().split('T')[0];
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.container.querySelectorAll('.date-quick-btn').forEach(b => b.classList.remove('active'));
      });
    }

    // Controles de incremento/decremento (Stepper)
    this._setupStepper('btnPeriodMinus', 'btnPeriodPlus', 'displayPeriodDays', (val) => {
      this.periodDays = Math.max(2, Math.min(10, val));
      return `${this.periodDays} dias`;
    }, 5);

    this._setupStepper('btnCycleMinus', 'btnCyclePlus', 'displayCycleDays', (val) => {
      this.cycleDays = Math.max(21, Math.min(45, val));
      return `${this.cycleDays} dias`;
    }, 28);

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

    // Pílulas de contracepção
    const pillsContainer = document.getElementById('contraceptivePills');
    if (pillsContainer) {
      pillsContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill-opt');
        if (!pill) return;
        pillsContainer.querySelectorAll('.pill-opt').forEach(p => p.classList.remove('active'));
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
      });
    }
  }

  _setupStepper(minusId, plusId, displayId, updateFn, initialVal) {
    let currentVal = initialVal;
    const minusBtn = document.getElementById(minusId);
    const plusBtn = document.getElementById(plusId);
    const display = document.getElementById(displayId);

    if (minusBtn && plusBtn && display) {
      minusBtn.onclick = () => {
        currentVal--;
        display.textContent = updateFn(currentVal);
      };
      plusBtn.onclick = () => {
        currentVal++;
        display.textContent = updateFn(currentVal);
      };
    }
  }

  show() {
    if (!this.container) return;
    this.container.classList.add('active');
    this.goToStep(0);
  }

  hide() {
    if (!this.container) return;
    this.container.classList.remove('active');
  }

  goToStep(index) {
    this.currentStepIndex = index;
    const totalWizardSteps = 5; // passos após o splash/auth

    this.steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === index);
    });

    if (this.progressBar) {
      if (index >= 2 && index <= 5) {
        const progress = ((index - 1) / (totalWizardSteps - 1)) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressBar.parentElement.style.opacity = '1';
      } else {
        this.progressBar.parentElement.style.opacity = '0';
      }
    }
  }

  bindFlowEvents({ onComplete, onSocialAuth }) {
    if (!this.container) return;

    // 1. Splash -> Iniciar
    const btnStart = document.getElementById('btnStartOnboarding');
    if (btnStart) {
      btnStart.onclick = () => this.goToStep(2); // Vai para objetivo
    }

    // 2. Splash -> Entrar
    const btnGoToAuth = document.getElementById('btnGoToAuth');
    if (btnGoToAuth) {
      btnGoToAuth.onclick = () => this.goToStep(1); // Vai para tela de Login/Cadastro
    }

    // 3. Auth -> Alternar Abas (Entrar / Cadastrar)
    const authTabs = this.container.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.onclick = () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        const submitBtn = document.getElementById('btnSubmitAuth');
        if (submitBtn) {
          submitBtn.textContent = mode === 'signup' ? 'Criar minha conta 🌸' : 'Entrar na minha conta 🌸';
        }
      };
    });

    // 4. Social Auth (Google / Apple)
    const btnGoogle = document.getElementById('btnGoogleAuth');
    if (btnGoogle) {
      btnGoogle.onclick = () => {
        onSocialAuth('Google');
        this.goToStep(2);
      };
    }
    const btnApple = document.getElementById('btnAppleAuth');
    if (btnApple) {
      btnApple.onclick = () => {
        onSocialAuth('Apple');
        this.goToStep(2);
      };
    }

    // 5. Auth Skip ou Submit
    const btnSkipAuth = document.getElementById('btnSkipAuth');
    if (btnSkipAuth) {
      btnSkipAuth.onclick = () => this.goToStep(2);
    }
    const btnSubmitAuth = document.getElementById('btnSubmitAuth');
    if (btnSubmitAuth) {
      btnSubmitAuth.onclick = (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('inputAuthEmail');
        const email = emailInput ? emailInput.value : '';
        onSocialAuth('Email', email);
        this.goToStep(2);
      };
    }

    // 6. Wizard: Próximos e Voltar
    this.container.querySelectorAll('[data-next-step]').forEach(btn => {
      btn.onclick = () => {
        const nextIndex = parseInt(btn.dataset.nextStep, 10);
        this.goToStep(nextIndex);
      };
    });

    this.container.querySelectorAll('[data-prev-step]').forEach(btn => {
      btn.onclick = () => {
        const prevIndex = parseInt(btn.dataset.prevStep, 10);
        this.goToStep(prevIndex);
      };
    });

    // 7. Concluir Onboarding
    const btnFinish = document.getElementById('btnFinishOnboarding');
    if (btnFinish) {
      btnFinish.onclick = () => {
        const nameInput = document.getElementById('inputUserName');
        if (nameInput && nameInput.value.trim()) {
          this.userName = nameInput.value.trim();
        }

        // Exibe animação de cálculo
        this.goToStep(6);

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
        }, 1600);
      };
    }
  }
}
