/**
 * Model: CycleModel
 * Gerencia as regras de negócio biológicas, cálculos de previsão e registro detalhado de sintomas.
 */
export class CycleModel {
  constructor() {
    this.storageKey = 'lov_cycle_data';
    this.logsKey = 'lov_daily_logs';
    this.themeKey = 'lov_theme';

    this.defaultCycle = {
      length: 28,
      period: 5,
      ovulation: 14,
      fertile: [10, 15],
      todayCycleDay: 2,
      isCycleLengthUnknown: false,
      lastPeriodStartDate: this._getCalculatedStartDate(2),
      contraceptiveMethod: 'none' // 'pill' | 'iud' | 'condom' | 'none'
    };

    this.cycle = this._loadCycle();
    this.logs = this._loadLogs();
  }

  _getCalculatedStartDate(cycleDay) {
    const d = new Date();
    d.setDate(d.getDate() - (cycleDay - 1));
    return d.toISOString().split('T')[0];
  }

  _loadCycle() {
    const saved = localStorage.getItem(this.storageKey) || localStorage.getItem('lume_cycle_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler ciclo do localStorage:', e);
      }
    }
    return { ...this.defaultCycle };
  }

  _loadLogs() {
    const saved = localStorage.getItem(this.logsKey) || localStorage.getItem('lume_daily_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler logs do localStorage:', e);
      }
    }
    return {};
  }

  _saveCycle() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cycle));
  }

  /**
   * Configuração inicial a partir do Onboarding ou ajuste de perfil
   */
  setupInitialCycle({
    startDateStr,
    cycleLength = 28,
    periodLength = 5,
    isUnknownCycle = false,
    contraceptive = 'none'
  }) {
    const cleanCycleLength = isUnknownCycle ? 28 : Math.max(21, Math.min(45, parseInt(cycleLength, 10) || 28));
    const cleanPeriodLength = Math.max(2, Math.min(10, parseInt(periodLength, 10) || 5));

    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime()) || startDate > todayZero) {
      startDate = new Date(todayZero);
    }
    const startZero = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    const diffMs = todayZero.getTime() - startZero.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    const todayCycleDay = (diffDays % cleanCycleLength) + 1;
    const ovulation = Math.max(cleanPeriodLength + 1, cleanCycleLength - 14);
    const fertileStart = Math.max(cleanPeriodLength + 1, ovulation - 5);
    const fertileEnd = Math.min(cleanCycleLength, ovulation + 1);

    this.cycle = {
      length: cleanCycleLength,
      period: cleanPeriodLength,
      ovulation,
      fertile: [fertileStart, fertileEnd],
      todayCycleDay,
      isCycleLengthUnknown: isUnknownCycle,
      contraceptiveMethod: contraceptive,
      lastPeriodStartDate: startDate.toISOString().split('T')[0]
    };

    this._saveCycle();
    return this.getCycleInfo();
  }

  getCycleInfo() {
    const today = this.cycle.todayCycleDay;
    const daysRemaining = this.cycle.length - today + 1;
    let phase = 'Lútea';
    let phaseColor = 'var(--c-luteal)';

    if (today <= this.cycle.period) {
      phase = 'Menstruação';
      phaseColor = 'var(--c-period)';
    } else if (today < this.cycle.fertile[0]) {
      phase = 'Folicular';
      phaseColor = 'var(--c-follicular)';
    } else if (today <= this.cycle.fertile[1]) {
      phase = today === this.cycle.ovulation ? 'Ovulação' : 'Fértil';
      phaseColor = 'var(--c-fertile)';
    }

    return {
      todayCycleDay: today,
      cycleLength: this.cycle.length,
      periodLength: this.cycle.period,
      ovulationDay: this.cycle.ovulation,
      fertileRange: this.cycle.fertile,
      phase,
      phaseColor,
      daysRemaining,
      isCycleLengthUnknown: this.cycle.isCycleLengthUnknown,
      contraceptiveMethod: this.cycle.contraceptiveMethod,
      lastPeriodStartDate: this.cycle.lastPeriodStartDate
    };
  }

  /**
   * Salva o registro completo diário de sintomas físicos, humor, TBC, muco e estilo de vida
   */
  saveDailyLog(dateStr, logData) {
    const current = this.logs[dateStr] || {};
    this.logs[dateStr] = {
      ...current,
      ...logData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.logsKey, JSON.stringify(this.logs));
    return this.logs[dateStr];
  }

  getDailyLog(dateStr) {
    return this.logs[dateStr] || {
      flow: null,
      pain: [],
      cervicalMucus: null,
      bbt: 36.5,
      mood: [],
      sex: [],
      contraception: [],
      lifestyle: {
        sleepHours: 8,
        waterGlasses: 6,
        exercise: null,
        stress: 'medium'
      }
    };
  }

  getThemePreference() {
    return localStorage.getItem(this.themeKey) || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  setThemePreference(theme) {
    localStorage.setItem(this.themeKey, theme);
  }

  getSymptomFrequencies() {
    return [
      { name: 'Cólica', percent: 82 },
      { name: 'Cansaço', percent: 68 },
      { name: 'Inchaço', percent: 55 },
      { name: 'Sensibilidade nos seios', percent: 48 },
      { name: 'Dor de cabeça', percent: 40 },
      { name: 'Acne', percent: 31 }
    ];
  }
}
