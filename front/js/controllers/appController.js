/**
 * Controller: AppController
 * Intermediário entre os Models (CycleModel, UserModel) e as Views no padrão arquitetural MVC.
 */
export class AppController {
  constructor(models, views) {
    this.models = models;
    this.views = views;
  }

  init() {
    this._initUserProfile();
    this._initTheme();
    this._renderCurrentCycle();
    this._initCalendar();
    this._initInsights();
    this._bindEvents();
    this._checkOnboardingStatus();
  }

  _checkOnboardingStatus() {
    if (this.models.user.isFirstAccess()) {
      if (this.views.onboarding) {
        this.views.onboarding.show();
      }
    }
  }

  _initUserProfile() {
    const profile = this.models.user.getProfile();
    this.views.profile.renderUserProfile(profile);
  }

  _initTheme() {
    const currentTheme = this.models.cycle.getThemePreference();
    this.views.profile.applyTheme(currentTheme);
  }

  _renderCurrentCycle() {
    const cycleInfo = this.models.cycle.getCycleInfo();
    this.views.ring.render(cycleInfo);
    this.views.week.render(cycleInfo);
  }

  _initCalendar() {
    const cycleInfo = this.models.cycle.getCycleInfo();
    this.views.calendar.render(new Date(), cycleInfo);
  }

  _initInsights() {
    const symptoms = this.models.cycle.getSymptomFrequencies();
    this.views.insights.render(symptoms);
  }

  _bindEvents() {
    // Onboarding & Login Flow
    if (this.views.onboarding) {
      this.views.onboarding.bindFlowEvents({
        onSocialAuth: (provider, email) => {
          this.models.user.updateProfile({
            isAuthenticated: true,
            email: email || `user_${Date.now()}@${provider.toLowerCase()}.com`
          });
          this.views.logSheet.showToast(`Autenticado com ${provider} ✨`);
        },
        onComplete: (data) => {
          // 1. Recalcula o ciclo real a partir da data de início informada
          this.models.cycle.setupInitialCycle({
            startDateStr: data.lastPeriodDate,
            cycleLength: data.cycleDays,
            periodLength: data.periodDays,
            isUnknownCycle: data.isUnknownCycle,
            contraceptive: data.contraceptive
          });

          // 2. Conclui onboarding no perfil
          this.models.user.completeOnboarding({
            name: data.name,
            goal: data.goal,
            remindersEnabled: data.reminders,
            isAuthenticated: this.models.user.getProfile().isAuthenticated
          });

          // 3. Atualiza todas as views
          this._initUserProfile();
          this._renderCurrentCycle();
          this._initCalendar();
          this.views.logSheet.showToast(`Bem-vinda, ${data.name}! Ciclo personalizado 🌸`);
        }
      });
    }

    // Botão de reiniciar onboarding / recalcular ciclo (Perfil)
    this.views.profile.bindRestartOnboarding(() => {
      if (this.views.onboarding) {
        this.views.onboarding.show();
      }
    });

    // Mudança de abas
    this.views.navigation.bindTabChange((tabName) => {
      if (tabName === 'insights') {
        requestAnimationFrame(() => this.views.insights.animateBars());
      }
    });

    // Navegação do calendário
    this.views.calendar.bindMonthChange((viewDate) => {
      const cycleInfo = this.models.cycle.getCycleInfo();
      this.views.calendar.render(viewDate, cycleInfo);
    });

    // Salvar registro de sintomas completo
    this.views.logSheet.bindSave((logData) => {
      const todayStr = new Date().toISOString().split('T')[0];
      this.models.cycle.saveDailyLog(todayStr, logData);
      
      // Se registrou fluxo menstrual e o dia atual era fora da menstruação, atualiza cálculos
      if (logData.flow && ['light', 'medium', 'heavy'].includes(logData.flow.value)) {
        this._renderCurrentCycle();
        this._initCalendar();
      }
      
      this.views.logSheet.showToast('Registro completo salvo com sucesso 💗');
    });

    // Toggle de tema
    this.views.profile.bindThemeToggle((newTheme) => {
      this.models.cycle.setThemePreference(newTheme);
      this.views.profile.applyTheme(newTheme);
    });
  }
}
