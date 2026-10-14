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

    // Salvar registro de sintomas
    this.views.logSheet.bindSave((selectedSymptoms) => {
      const todayStr = new Date().toISOString().split('T')[0];
      this.models.cycle.saveDailyLog(todayStr, { symptoms: selectedSymptoms });
      this.views.logSheet.showToast('Registro salvo com sucesso 💗');
    });

    // Toggle de tema
    this.views.profile.bindThemeToggle((newTheme) => {
      this.models.cycle.setThemePreference(newTheme);
      this.views.profile.applyTheme(newTheme);
    });
  }
}
