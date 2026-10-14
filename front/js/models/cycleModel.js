/**
 * Model: CycleModel
 * Responsável pelas regras de negócio do ciclo menstrual, cálculos e persistência.
 */
export class CycleModel {
  constructor() {
    this.storageKey = 'lume_cycle_data';
    this.logsKey = 'lume_daily_logs';
    this.themeKey = 'lume_theme';

    this.defaultCycle = {
      length: 28,
      period: 5,
      ovulation: 14,
      fertile: [10, 15],
      todayCycleDay: 5,
      lastPeriodStartDate: this._getCalculatedStartDate(5)
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
    const saved = localStorage.getItem(this.storageKey);
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
    const saved = localStorage.getItem(this.logsKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler logs do localStorage:', e);
      }
    }
    return {};
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
      daysRemaining
    };
  }

  saveDailyLog(dateStr, logData) {
    this.logs[dateStr] = {
      ...logData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.logsKey, JSON.stringify(this.logs));
    return this.logs[dateStr];
  }

  getDailyLog(dateStr) {
    return this.logs[dateStr] || null;
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
      { name: 'Dor de cabeça', percent: 40 },
      { name: 'Acne', percent: 31 }
    ];
  }
}
