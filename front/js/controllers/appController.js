/**
 * Controller: AppController
 * Orquestrador principal da arquitetura MVC do Lov.
 * Gerencia a navegação entre telas, a seleção e edição de dias do calendário/semana,
 * o histórico de ciclos e a fixação de rotinas/medicamentos padrão.
 */
import { parseLocalDate, toLocalISODate } from '../utils/dateUtils.js';

export class AppController {
  constructor(models, views) {
    this.models = models;
    this.views = views;
    this.calendarDate = new Date();
    if (this.calendarDate.getFullYear() < 2000) {
      this.calendarDate.setFullYear(new Date().getFullYear());
    }
    this.selectedDateIso = toLocalISODate(new Date());
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
    const routineDefaults = this.models.cycle.getDailyDefaults();
    this.views.profile.renderUserProfile(profile, routineDefaults);
  }

  _initTheme() {
    const currentTheme = this.models.cycle.getThemePreference();
    this.views.profile.applyTheme(currentTheme);
  }

  /**
   * Atualiza a renderização de todas as telas com dados recalculados e consistentes.
   */
  _renderAll() {
    const today = new Date();
    const cycleInfo = this.models.cycle.getCycleInfo(today);
    const selectedDate = parseLocalDate(this.selectedDateIso) || today;

    // 1. Tela Hoje
    this.views.ring.render(cycleInfo);
    this.views.week.render(this.models.cycle.getWeek(selectedDate), today);
    this.views.phaseCards.render(this.models.cycle.getPhaseCards(cycleInfo));

    // 2. Tela Calendário
    this._renderCalendar();

    // 3. Tela Insights
    this.views.insights.renderStats(this.models.cycle.getStats());
    this.views.insights.renderSymptoms(this.models.cycle.getSymptomFrequencies());

    // 4. Tela Perfil
    const profile = this.models.user.getProfile();
    const routineDefaults = this.models.cycle.getDailyDefaults();
    this.views.profile.renderUserProfile(profile, routineDefaults);
  }

  _renderCalendar() {
    const year = this.calendarDate.getFullYear() < 2000 ? new Date().getFullYear() : this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const selectedDate = parseLocalDate(this.selectedDateIso) || new Date();
    const monthData = this.models.cycle.getMonth(year, month, selectedDate);
    const dayDetail = this.models.cycle.getDayDetail(selectedDate);
    const periodsHistory = this.models.cycle.getPeriods();

    this.views.calendar.render(this.calendarDate, monthData, dayDetail, periodsHistory);
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
          this.models.cycle.setupInitialCycle({
            startDateStr: data.lastPeriodDate,
            cycleLength: data.cycleDays,
            periodLength: data.periodDays,
            isUnknownCycle: data.isUnknownCycle,
            contraceptive: data.contraceptive
          });

          this.models.user.completeOnboarding({
            name: data.name,
            goal: data.goal,
            remindersEnabled: data.reminders
          });

          this.selectedDateIso = data.lastPeriodDate;
          this._renderAll();
          this.views.toast.show(`Bem-vinda ao Lov, ${data.name}! Ciclo pronto 🌸`);
        }
      });
    }

    // 2. Interatividade da Faixa Semanal (Hoje)
    this.views.week.bindDaySelect((isoDate) => {
      this.selectedDateIso = isoDate;
      const targetDate = parseLocalDate(isoDate) || new Date();
      const safeYear = targetDate.getFullYear() < 2000 ? new Date().getFullYear() : targetDate.getFullYear();
      this.calendarDate = new Date(safeYear, targetDate.getMonth(), 1);
      this._renderAll();
      // Abre a sheet para registrar ou editar o dia selecionado na semana
      this.views.logSheet.openForDate(targetDate);
    });

    // 3. Interatividade da Grade do Calendário
    this.views.calendar.bindDaySelect((isoDate) => {
      this.selectedDateIso = isoDate;
      this._renderCalendar();
    });

    // 4. Marcação/Desmarcação rápida de Menstruação no Calendário
    this.views.calendar.bindToggleDayPeriod((isoDate) => {
      const targetDate = parseLocalDate(isoDate);
      const isPeriod = this.models.cycle.togglePeriodDay(targetDate);
      this._renderAll();
      this.views.toast.show(
        isPeriod ? 'Menstruação marcada para este dia 🩸' : 'Menstruação removida deste dia'
      );
    });

    // 5. Abertura do Log completo a partir do Calendário
    this.views.calendar.bindOpenDayLog((isoDate) => {
      this.views.logSheet.openForDate(parseLocalDate(isoDate));
    });

    // 6. Gerenciamento do Histórico de Ciclos (Adicionar / Editar / Excluir)
    this.views.calendar.bindAddPeriod(() => {
      this.views.calendar.openPeriodModal();
    });

    this.views.calendar.bindSavePeriod(({ id, startDate, endDate }) => {
      if (id) {
        this.models.cycle.updatePeriod(id, startDate, endDate);
        this.views.toast.show('Ciclo atualizado no histórico 🌸');
      } else {
        this.models.cycle.addPeriod(startDate, endDate);
        this.views.toast.show('Ciclo adicionado ao histórico 🌸');
      }
      this._renderAll();
    });

    this.views.calendar.bindDeletePeriod((id) => {
      this.models.cycle.deletePeriod(id);
      this._renderAll();
      this.views.toast.show('Ciclo removido do histórico');
    });

    // 7. Navegação mensal no Calendário
    this.views.calendar.bindMonthChange((offset) => {
      const curYear = this.calendarDate.getFullYear() < 2000 ? new Date().getFullYear() : this.calendarDate.getFullYear();
      this.calendarDate = new Date(curYear, this.calendarDate.getMonth() + offset, 1);
      this._renderCalendar();
    });

    // 8. Bottom Sheet de Sintomas (com Rotina e Medicamentos Fixos)
    this.views.logSheet.bindOpen((targetDate) => {
      const date = targetDate || parseLocalDate(this.selectedDateIso) || new Date();
      const existingLog = this.models.cycle.getDailyLog(date);
      const routineDefaults = this.models.cycle.getDailyDefaults();
      this.views.logSheet.populate(existingLog, routineDefaults);
    });

    this.views.logSheet.bindSave((logData, targetDate, pinDefaults) => {
      const date = targetDate || new Date();
      this.models.cycle.saveDailyLog(date, logData);

      // Se a usuária pediu para fixar como padrão diário
      if (pinDefaults) {
        this.models.cycle.setDailyDefaults({
          contraceptive: logData.contraception?.value || this.models.cycle.getDailyDefaults().contraceptive,
          waterGlasses: logData.waterGlasses || 0,
          habits: (logData.lifestyleHabits || []).map((h) => h.value),
          pinDefaults: true
        });
      }

      // Se registrou fluxo real menstrual em dia fora do período, atualiza o histórico
      if (this.models.cycle.isNewPeriodStart(logData, date)) {
        this.models.cycle.togglePeriodDay(date, logData.flow.value);
      }

      this._renderAll();
      this.views.toast.show(
        pinDefaults
          ? 'Registro e rotina padrão salvos com sucesso! 📌💗'
          : 'Registro salvo com sucesso! 💗'
      );
    });

    // 9. Configurações de Perfil (Condições de Saúde e Rotina)
    this.views.profile.bindSaveConditions((conditions) => {
      this.models.user.updateProfile({ healthConditions: conditions });
      this.models.cycle.setDailyDefaults({ conditions });
      this._renderAll();
      this.views.toast.show('Condições de saúde atualizadas 🩺');
    });

    this.views.profile.bindChangeContraceptive(() => {
      if (this.views.onboarding) {
        this.views.onboarding.show();
        this.views.onboarding.goToStep(4);
      }
    });

    this.views.profile.bindAutoPreFillToggle((isEnabled) => {
      this.models.cycle.setDailyDefaults({ pinDefaults: isEnabled });
      this.views.toast.show(
        isEnabled ? 'Pré-preenchimento rápido ativado ⚡' : 'Pré-preenchimento rápido desativado'
      );
    });

    this.views.profile.bindRestartOnboarding(() => {
      if (this.views.onboarding) {
        this.views.onboarding.setInitialValues(this.models.user.getProfile());
        this.views.onboarding.show();
      }
    });

    this.views.profile.bindSoonButtons((message) => {
      this.views.toast.show(message);
    });

    this.views.profile.bindThemeToggle((newTheme) => {
      this.models.cycle.setThemePreference(newTheme);
      this.views.profile.applyTheme(newTheme);
    });

    // 10. Mudança de abas e animação de estatísticas
    this.views.navigation.bindTabChange((tabName) => {
      if (tabName === 'insights') {
        requestAnimationFrame(() => this.views.insights.animateBars());
      } else if (tabName === 'calendar') {
        this._renderCalendar();
      }
    });

    // 11. FAB Microfone
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.views.toast.show('Assistente Lov AI por voz: em integração na Fase 3 🎙️✨');
      });
    }
  }
}
