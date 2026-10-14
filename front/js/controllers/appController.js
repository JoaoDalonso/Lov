/**
 * Controller: AppController
 * Intermediário entre os Models (CycleModel, UserModel) e as Views no padrão arquitetural MVC.
 * Não manipula o DOM diretamente; orquestra as regras de negócio e aciona as views correspondentes.
 */
export class AppController {
  constructor(models, views) {
    this.models = models;
    this.views = views;
    this.calendarDate = new Date();
  }

  init() {
    this._initUserProfile();
    this._initTheme();
    this._renderAll();
    this._bindEvents();
    this._checkOnboardingStatus();
  }

  _checkOnboardingStatus() {
    if (this.models.user.isFirstAccess()) {
      if (this.views.onboarding) {
        this.views.onboarding.setInitialValues(this.models.user.getProfile());
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

  /**
   * Atualiza a renderização de todas as páginas da aplicação
   * garantindo que os dados estejam consistentes após qualquer mutação.
   */
  _renderAll() {
    const today = new Date();
    const cycleInfo = this.models.cycle.getCycleInfo(today);

    // 1. Tela Hoje
    this.views.ring.render(cycleInfo);
    this.views.week.render(this.models.cycle.getWeek(today), today);
    this.views.phaseCards.render(this.models.cycle.getPhaseCards(cycleInfo));

    // 2. Tela Calendário
    this._renderCalendar();

    // 3. Tela Insights
    this.views.insights.renderStats(this.models.cycle.getStats());
    this.views.insights.renderSymptoms(this.models.cycle.getSymptomFrequencies());

    // 4. Tela Perfil
    this.views.profile.renderUserProfile(this.models.user.getProfile());
  }

  _renderCalendar() {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const monthData = this.models.cycle.getMonth(year, month);
    this.views.calendar.render(this.calendarDate, monthData);
  }

  _bindEvents() {
    // 1. Onboarding e Autenticação
    if (this.views.onboarding) {
      this.views.onboarding.bindFlowEvents({
        onSocialAuth: (provider, email) => {
          this.models.user.updateProfile({
            isAuthenticated: true,
            email: email || `user_${Date.now()}@${provider.toLowerCase()}.com`
          });
          this.views.toast.show(`Autenticado com ${provider} ✨`);
        },
        onInvalid: (message) => {
          this.views.toast.show(message);
        },
        onComplete: (data) => {
          // Recalibra o ciclo a partir da data de início e durações informadas
          this.models.cycle.setupInitialCycle({
            startDateStr: data.lastPeriodDate,
            cycleLength: data.cycleDays,
            periodLength: data.periodDays,
            isUnknownCycle: data.isUnknownCycle,
            contraceptive: data.contraceptive
          });

          // Atualiza dados do perfil
          this.models.user.completeOnboarding({
            name: data.name,
            goal: data.goal,
            remindersEnabled: data.reminders
          });

          this._renderAll();
          this.views.toast.show(`Bem-vinda ao Lov, ${data.name}! Ciclo pronto 🌸`);
        }
      });
    }

    // 2. Botão de reajustar ciclo no Perfil
    this.views.profile.bindRestartOnboarding(() => {
      if (this.views.onboarding) {
        this.views.onboarding.setInitialValues(this.models.user.getProfile());
        this.views.onboarding.show();
      }
    });

    // 3. Botões de funcionalidades futuras no Perfil (data-soon)
    this.views.profile.bindSoonButtons((message) => {
      this.views.toast.show(message);
    });

    // 4. Mudança de abas e animação de barras de sintomas
    this.views.navigation.bindTabChange((tabName) => {
      if (tabName === 'insights') {
        requestAnimationFrame(() => this.views.insights.animateBars());
      }
    });

    // 5. Navegação mensal no Calendário
    this.views.calendar.bindMonthChange((offset) => {
      this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + offset, 1);
      this._renderCalendar();
    });

    // 6. Abertura e Salvamento da Bottom Sheet de Sintomas
    this.views.logSheet.bindOpen(() => {
      const todayLog = this.models.cycle.getDailyLog(new Date());
      this.views.logSheet.populate(todayLog);
    });

    this.views.logSheet.bindSave((logData) => {
      const today = new Date();
      this.models.cycle.saveDailyLog(today, logData);

      // Se registrou fluxo real menstrual em dia fora do período previsto, inicia novo ciclo
      if (this.models.cycle.isNewPeriodStart(logData, today)) {
        this.models.cycle.registerPeriodStart(today);
      }

      this._renderAll();
      this.views.toast.show('Registro salvo com sucesso! 💗');
    });

    // 7. Alternância de tema claro/escuro
    this.views.profile.bindThemeToggle((newTheme) => {
      this.models.cycle.setThemePreference(newTheme);
      this.views.profile.applyTheme(newTheme);
    });

    // 8. Botão FAB do microfone (Assistente IA Lov)
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.views.toast.show('Assistente Lov AI por voz: em integração na Fase 3 🎙️✨');
      });
    }
  }
}
