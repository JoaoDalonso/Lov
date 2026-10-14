/**
 * Model: CycleModel
 * Regras de negócio do ciclo menstrual: previsão, fases, histórico de menstruações e registros diários.
 * Não conhece DOM nem interface (Clean Architecture / MVC).
 */
import { addDays, daysBetween, startOfDay, toLocalISODate, parseLocalDate, isSameDay } from '../utils/dateUtils.js';
import { readJson, writeJson, readText, writeText } from '../utils/storage.js';
import { PHASE_CONTENT, CONDITION_TIPS } from './phaseContent.js';

const STORAGE_KEYS = {
  cycle: 'lov_cycle_v2',
  logs: 'lov_daily_logs',
  theme: 'lov_theme',
  periods: 'lov_periods_history',
  defaults: 'lov_daily_defaults'
};

const LIMITS = {
  cycleLength: { min: 21, max: 45, fallback: 28 },
  periodLength: { min: 2, max: 10, fallback: 5 },
  plausibleMeasuredCycle: { min: 15, max: 60 }
};

const LUTEAL_PHASE_DAYS = 14;
const FERTILE_DAYS_BEFORE_OVULATION = 5;
const FERTILE_DAYS_AFTER_OVULATION = 1;
const HISTORY_SIZE = 6;
const BLEEDING_FLOWS = ['light', 'medium', 'heavy'];

const PHASE = {
  MENSTRUAL: 'menstrual',
  FOLLICULAR: 'follicular',
  FERTILE: 'fertile',
  OVULATION: 'ovulation',
  LUTEAL: 'luteal'
};

const PHASE_LABEL = {
  [PHASE.MENSTRUAL]: 'Menstruação',
  [PHASE.FOLLICULAR]: 'Folicular',
  [PHASE.FERTILE]: 'Fértil',
  [PHASE.OVULATION]: 'Ovulação',
  [PHASE.LUTEAL]: 'Lútea'
};

const clamp = (value, { min, max }) => Math.max(min, Math.min(max, value));
const toInt = (value, fallback) => (Number.isFinite(parseInt(value, 10)) ? parseInt(value, 10) : fallback);
const average = (values) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);

export class CycleModel {
  constructor() {
    this.config = readJson(STORAGE_KEYS.cycle, null) || this._buildDefaultConfig();
    this.logs = readJson(STORAGE_KEYS.logs, {});
    this.periods = readJson(STORAGE_KEYS.periods, null) || this._buildDefaultPeriods();
    this.defaults = readJson(STORAGE_KEYS.defaults, this._buildDefaultRoutine());

    this._sanitizeData();
  }

  _sanitizeData() {
    // Corrige qualquer data legada/corrompida no localStorage (ex: 1906)
    const currentYear = new Date().getFullYear();

    if (this.config) {
      const parsedStart = parseLocalDate(this.config.lastPeriodStartDate);
      if (!parsedStart || parsedStart.getFullYear() < 2000) {
        this.config.lastPeriodStartDate = toLocalISODate(addDays(new Date(), -1));
        this._persistConfig();
      }
    }

    if (Array.isArray(this.periods)) {
      let changed = false;
      this.periods = this.periods.filter((p) => {
        const start = parseLocalDate(p.startDate);
        return start && start.getFullYear() >= 2000;
      });
      if (!this.periods.length) {
        this.periods = this._buildDefaultPeriods();
        changed = true;
      }
      if (changed) this._persistPeriods();
    }
  }

  /* ------------------------------ configuração ------------------------------ */

  _buildDefaultConfig() {
    return {
      lastPeriodStartDate: toLocalISODate(addDays(new Date(), -1)),
      cycleLength: LIMITS.cycleLength.fallback,
      periodLength: LIMITS.periodLength.fallback,
      isCycleLengthUnknown: false,
      contraceptiveMethod: 'none',
      measuredCycleLengths: []
    };
  }

  _buildDefaultPeriods() {
    const start = parseLocalDate(this.config.lastPeriodStartDate) || addDays(new Date(), -1);
    const end = addDays(start, this.config.periodLength - 1);
    return [
      {
        id: `p_${Date.now()}`,
        startDate: toLocalISODate(start),
        endDate: toLocalISODate(end),
        periodLength: this.config.periodLength
      }
    ];
  }

  _buildDefaultRoutine() {
    return {
      contraceptive: 'none',
      conditions: [],
      routineMedications: [],
      waterGlasses: 0,
      pinDefaults: false
    };
  }

  _persistConfig() {
    writeJson(STORAGE_KEYS.cycle, this.config);
  }

  _persistPeriods() {
    writeJson(STORAGE_KEYS.periods, this.periods);
  }

  _persistDefaults() {
    writeJson(STORAGE_KEYS.defaults, this.defaults);
  }

  /** Define o ciclo a partir do onboarding. */
  setupInitialCycle({ startDateStr, cycleLength, periodLength, isUnknownCycle = false, contraceptive = 'none' }) {
    const today = startOfDay();
    let startDate = parseLocalDate(startDateStr);
    if (!startDate || startDate > today) startDate = today;

    const pLength = clamp(toInt(periodLength, LIMITS.periodLength.fallback), LIMITS.periodLength);
    const cLength = isUnknownCycle
      ? LIMITS.cycleLength.fallback
      : clamp(toInt(cycleLength, LIMITS.cycleLength.fallback), LIMITS.cycleLength);

    this.config = {
      lastPeriodStartDate: toLocalISODate(startDate),
      cycleLength: cLength,
      periodLength: pLength,
      isCycleLengthUnknown: Boolean(isUnknownCycle),
      contraceptiveMethod: contraceptive,
      measuredCycleLengths: []
    };

    // Cria o primeiro registro no histórico
    const endDate = addDays(startDate, pLength - 1);
    this.periods = [
      {
        id: `p_${Date.now()}`,
        startDate: toLocalISODate(startDate),
        endDate: toLocalISODate(endDate),
        periodLength: pLength
      }
    ];

    if (contraceptive && contraceptive !== 'none') {
      this.defaults.contraceptive = contraceptive;
      this._persistDefaults();
    }

    this._persistConfig();
    this._persistPeriods();
    return this.getCycleInfo();
  }

  /* ---------------------- gerenciamento de histórico ---------------------- */

  getPeriods() {
    // Retorna ordenado do mais recente para o mais antigo
    return [...this.periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  /** Adiciona um ciclo passado ao histórico e recalibra médias */
  addPeriod(startDateStr, endDateStr) {
    const start = parseLocalDate(startDateStr);
    const end = parseLocalDate(endDateStr) || start;
    if (!start) return false;

    const pLength = Math.max(1, daysBetween(start, end) + 1);
    const newPeriod = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      startDate: toLocalISODate(start),
      endDate: toLocalISODate(end),
      periodLength: clamp(pLength, LIMITS.periodLength)
    };

    this.periods.push(newPeriod);
    this._recalculateFromPeriods();
    return newPeriod;
  }

  /** Edita um período existente */
  updatePeriod(id, startDateStr, endDateStr) {
    const period = this.periods.find((p) => p.id === id);
    if (!period) return false;

    const start = parseLocalDate(startDateStr);
    const end = parseLocalDate(endDateStr) || start;
    if (!start) return false;

    period.startDate = toLocalISODate(start);
    period.endDate = toLocalISODate(end);
    period.periodLength = clamp(Math.max(1, daysBetween(start, end) + 1), LIMITS.periodLength);

    this._recalculateFromPeriods();
    return period;
  }

  /** Remove um período do histórico */
  deletePeriod(id) {
    this.periods = this.periods.filter((p) => p.id !== id);
    if (!this.periods.length) {
      this.periods = this._buildDefaultPeriods();
    }
    this._recalculateFromPeriods();
    return true;
  }

  /** Recalcula durações médias e regularidade com base em todos os ciclos registrados */
  _recalculateFromPeriods() {
    // Ordena do mais antigo para o mais recente para calcular intervalos
    const sortedAsc = [...this.periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
    
    // O mais recente vira a data de referência atual
    const mostRecent = sortedAsc[sortedAsc.length - 1];
    this.config.lastPeriodStartDate = mostRecent.startDate;

    // Calcula durações de menstruação
    const periodLengths = sortedAsc.map((p) => p.periodLength).filter(Boolean);
    if (periodLengths.length) {
      this.config.periodLength = clamp(Math.round(average(periodLengths)), LIMITS.periodLength);
    }

    // Calcula intervalos entre inícios de ciclos sucessivos
    const cycleIntervals = [];
    for (let i = 0; i < sortedAsc.length - 1; i++) {
      const s1 = parseLocalDate(sortedAsc[i].startDate);
      const s2 = parseLocalDate(sortedAsc[i + 1].startDate);
      const days = daysBetween(s1, s2);
      if (days >= LIMITS.plausibleMeasuredCycle.min && days <= LIMITS.plausibleMeasuredCycle.max) {
        cycleIntervals.push(days);
      }
    }

    this.config.measuredCycleLengths = cycleIntervals.slice(-HISTORY_SIZE);
    if (cycleIntervals.length >= 1) {
      this.config.cycleLength = clamp(Math.round(average(cycleIntervals)), LIMITS.cycleLength);
    }

    this._persistConfig();
    this._persistPeriods();
  }

  /** Checa se uma data específica é dia de menstruação no histórico ou nos logs */
  isPeriodOnDate(date) {
    const iso = toLocalISODate(date);

    // 1. Checa nos períodos registrados
    for (const p of this.periods) {
      if (iso >= p.startDate && iso <= p.endDate) {
        return true;
      }
    }

    // 2. Checa nos logs diários
    const log = this.logs[iso];
    if (log?.flow && BLEEDING_FLOWS.includes(log.flow.value)) {
      return true;
    }

    return false;
  }

  /** Alterna menstruação num dia específico (adiciona ou remove com 1 clique) */
  togglePeriodDay(date, flowValue = 'medium') {
    const iso = toLocalISODate(date);
    const isCurrentlyPeriod = this.isPeriodOnDate(date);

    if (isCurrentlyPeriod) {
      // Desmarcar menstruação
      // 1. Remove do log
      if (this.logs[iso]) {
        delete this.logs[iso].flow;
        writeJson(STORAGE_KEYS.logs, this.logs);
      }

      // 2. Ajusta nos períodos existentes
      this.periods.forEach((p) => {
        if (iso === p.startDate && iso === p.endDate) {
          p._delete = true;
        } else if (iso === p.startDate) {
          p.startDate = toLocalISODate(addDays(parseLocalDate(p.startDate), 1));
          p.periodLength = Math.max(1, p.periodLength - 1);
        } else if (iso === p.endDate) {
          p.endDate = toLocalISODate(addDays(parseLocalDate(p.endDate), -1));
          p.periodLength = Math.max(1, p.periodLength - 1);
        }
      });
      this.periods = this.periods.filter((p) => !p._delete);
    } else {
      // Marcar menstruação
      // 1. Adiciona no log
      this.saveDailyLog(date, {
        flow: { value: flowValue, label: flowValue === 'heavy' ? 'Intenso' : flowValue === 'light' ? 'Leve' : 'Moderado' }
      });

      // 2. Tenta expandir período existente adjacente ou cria novo
      let merged = false;
      const targetDate = parseLocalDate(iso);
      for (const p of this.periods) {
        const pStart = parseLocalDate(p.startDate);
        const pEnd = parseLocalDate(p.endDate);
        if (daysBetween(targetDate, pStart) === 1) {
          p.startDate = iso;
          p.periodLength = daysBetween(targetDate, pEnd) + 1;
          merged = true;
          break;
        } else if (daysBetween(pEnd, targetDate) === 1) {
          p.endDate = iso;
          p.periodLength = daysBetween(pStart, targetDate) + 1;
          merged = true;
          break;
        }
      }

      if (!merged) {
        this.periods.push({
          id: `p_${Date.now()}`,
          startDate: iso,
          endDate: iso,
          periodLength: 1
        });
      }
    }

    this._recalculateFromPeriods();
    return this.isPeriodOnDate(date);
  }

  /** Retorna todos os dados de status de um dia específico (para o Drawer do Calendário) */
  getDayDetail(date) {
    const iso = toLocalISODate(date);
    const isPeriod = this.isPeriodOnDate(date);
    const dayType = this.getDayType(date);
    const log = this.getEffectiveLog(date);
    const { cycleDay } = this._locateInCycle(date);
    const phase = this._phaseOfCycleDay(cycleDay);

    return {
      date,
      iso,
      cycleDay,
      phase,
      phaseLabel: isPeriod ? 'Menstruação' : PHASE_LABEL[phase],
      isPeriod,
      dayType,
      log,
      isToday: isSameDay(date, new Date())
    };
  }

  /* --------------------------- rotina e dados fixos --------------------------- */

  getDailyDefaults() {
    return { ...this.defaults };
  }

  setDailyDefaults(newDefaults) {
    this.defaults = { ...this.defaults, ...newDefaults };
    this._persistDefaults();
    return this.defaults;
  }

  /**
   * Retorna o log de uma data. Se o dia não tem log gravado e o usuário tem padrões fixos,
   * retorna os dados pré-preenchidos para economizar o tempo da usuária!
   */
  getEffectiveLog(date) {
    const key = toLocalISODate(date);
    const existing = this.logs[key];
    if (existing) return existing;

    // Se não há log mas há defaults cadastrados
    if (this.defaults && (this.defaults.contraceptive !== 'none' || this.defaults.conditions?.length)) {
      return {
        _isPreFilled: true,
        contraception: this.defaults.contraceptive && this.defaults.contraceptive !== 'none'
          ? { value: this.defaults.contraceptive, label: this._formatContraceptive(this.defaults.contraceptive) }
          : null,
        waterGlasses: this.defaults.waterGlasses || 0,
        lifestyleHabits: (this.defaults.habits || []).map((h) => ({ value: h, label: h }))
      };
    }

    return null;
  }

  _formatContraceptive(value) {
    const map = {
      'pill': 'Pílula anticoncepcional',
      'pill-taken': 'Pílula tomada no horário',
      'iud': 'DIU / Implante',
      'condom': 'Preservativo'
    };
    return map[value] || value;
  }

  /* -------------------------------- cálculos -------------------------------- */

  _ovulationDay() {
    const { cycleLength, periodLength } = this.config;
    return Math.max(periodLength + 1, cycleLength - LUTEAL_PHASE_DAYS);
  }

  _fertileRange() {
    const { cycleLength, periodLength } = this.config;
    const ovulation = this._ovulationDay();
    return [
      Math.max(periodLength + 1, ovulation - FERTILE_DAYS_BEFORE_OVULATION),
      Math.min(cycleLength, ovulation + FERTILE_DAYS_AFTER_OVULATION)
    ];
  }

  _locateInCycle(date) {
    const start = parseLocalDate(this.config.lastPeriodStartDate);
    const offset = daysBetween(start, date);
    const { cycleLength } = this.config;
    return {
      cycleDay: ((offset % cycleLength) + cycleLength) % cycleLength + 1,
      cycleIndex: Math.floor(offset / cycleLength)
    };
  }

  _phaseOfCycleDay(cycleDay) {
    const [fertileStart, fertileEnd] = this._fertileRange();
    if (cycleDay <= this.config.periodLength) return PHASE.MENSTRUAL;
    if (cycleDay === this._ovulationDay()) return PHASE.OVULATION;
    if (cycleDay >= fertileStart && cycleDay <= fertileEnd) return PHASE.FERTILE;
    if (cycleDay < fertileStart) return PHASE.FOLLICULAR;
    return PHASE.LUTEAL;
  }

  getCycleInfo(date = new Date()) {
    const { cycleDay } = this._locateInCycle(date);
    const phase = this._phaseOfCycleDay(cycleDay);
    const { cycleLength, periodLength } = this.config;
    const isPeriodDay = this.isPeriodOnDate(date) || phase === PHASE.MENSTRUAL;

    return {
      todayCycleDay: cycleDay,
      cycleLength,
      periodLength,
      ovulationDay: this._ovulationDay(),
      fertileRange: this._fertileRange(),
      phase: isPeriodDay ? PHASE.MENSTRUAL : phase,
      phaseLabel: isPeriodDay ? 'Menstruação' : PHASE_LABEL[phase],
      isPeriodDay,
      daysUntilNextPeriod: Math.max(1, cycleLength - cycleDay + 1),
      isCycleLengthUnknown: this.config.isCycleLengthUnknown,
      contraceptiveMethod: this.config.contraceptiveMethod,
      lastPeriodStartDate: this.config.lastPeriodStartDate
    };
  }

  getDayType(date) {
    if (this.isPeriodOnDate(date)) {
      return daysBetween(new Date(), date) > 0 ? 'predicted' : 'period';
    }

    const start = parseLocalDate(this.config.lastPeriodStartDate);
    if (daysBetween(start, date) < 0) return null;

    const { cycleDay } = this._locateInCycle(date);
    const phase = this._phaseOfCycleDay(cycleDay);
    const isFuture = daysBetween(new Date(), date) > 0;

    if (phase === PHASE.MENSTRUAL) return isFuture ? 'predicted' : 'period';
    if (phase === PHASE.OVULATION) return 'ovulation';
    if (phase === PHASE.FERTILE) return 'fertile';
    return null;
  }

  getWeek(reference = new Date()) {
    const sunday = addDays(reference, -reference.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(sunday, index);
      return {
        date,
        iso: toLocalISODate(date),
        dayNumber: date.getDate(),
        type: this.getDayType(date),
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, reference)
      };
    });
  }

  getMonth(year, month, selectedDate = null) {
    const totalDays = new Date(year, month + 1, 0).getDate();
    return {
      leadingBlanks: new Date(year, month, 1).getDay(),
      days: Array.from({ length: totalDays }, (_, index) => {
        const date = new Date(year, month, index + 1);
        return {
          date,
          iso: toLocalISODate(date),
          dayNumber: index + 1,
          type: this.getDayType(date),
          isToday: isSameDay(date, new Date()),
          isSelected: selectedDate ? isSameDay(date, selectedDate) : false
        };
      })
    };
  }

  getPhaseCards(info = this.getCycleInfo()) {
    const baseCards = [...(PHASE_CONTENT[info.phase] || PHASE_CONTENT.menstrual)];

    // 1. Destaque do dia exato no primeiro card menstrual
    const enrichedCards = baseCards.map((card, index) =>
      index === 0 && info.phase === PHASE.MENSTRUAL
        ? { ...card, title: `${info.todayCycleDay}º dia da menstruação` }
        : card
    );

    // 2. Card interativo de rotina / Pílula se o método estiver configurado
    const defaults = this.getDailyDefaults();
    const todayLog = this.getDailyLog(new Date()) || {};
    if (defaults && defaults.contraceptive && defaults.contraceptive !== 'none') {
      const isPill = String(defaults.contraceptive).includes('pill');
      const alreadyTaken = Boolean(
        todayLog.contraceptive?.taken ||
        todayLog.pillTaken ||
        (Array.isArray(todayLog.medications) && todayLog.medications.some((m) => m.id === 'pill'))
      );

      enrichedCards.splice(1, 0, {
        tone: 'violet',
        tag: 'Rotina Fixa',
        icon: isPill ? '💊' : '🩺',
        title: isPill ? 'Lembrete da Pílula Diária' : 'Método Contraceptivo',
        text: alreadyTaken
          ? 'Você já registrou a tomada de hoje! Excelente adesão para sua proteção e saúde.'
          : (isPill ? 'Horário habitual das 21:00. Tomou sua dose de hoje?' : 'Método habitual ativo e monitorado nas previsões.'),
        action: alreadyTaken
          ? null
          : { type: 'take-pill', label: 'Marcar pílula como tomada ✨' }
      });
    }

    // 3. Cards personalizados para as condições de saúde cadastradas pela usuária (SOP, Endometriose, etc.)
    if (defaults && Array.isArray(defaults.conditions)) {
      defaults.conditions.forEach((condKey) => {
        if (CONDITION_TIPS[condKey]) {
          enrichedCards.push(CONDITION_TIPS[condKey]);
        }
      });
    }

    return enrichedCards;
  }

  /* --------------------------------- insights -------------------------------- */

  getStats() {
    const lengths = this.config.measuredCycleLengths;
    return {
      cycleLength: this.config.cycleLength,
      periodLength: this.config.periodLength,
      ovulationDay: this._ovulationDay(),
      regularity: this._regularityPercent(lengths),
      trackedCycles: this.periods.length
    };
  }

  _regularityPercent(lengths) {
    if (lengths.length < 2) return null;
    const mean = average(lengths);
    const deviation = Math.sqrt(average(lengths.map((l) => (l - mean) ** 2)));
    return Math.round(clamp(100 - deviation * 10, { min: 0, max: 100 }));
  }

  getSymptomFrequencies(limit = 6) {
    const entries = Object.values(this.logs);
    if (!entries.length) return [];

    const counts = new Map();
    entries.forEach((log) => {
      [...(log.pain || []), ...(log.mood || [])].forEach(({ label }) => {
        counts.set(label, (counts.get(label) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .map(([name, count]) => ({ name, percent: Math.round((count / entries.length) * 100) }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, limit);
  }

  /* ---------------------------- registros diários ---------------------------- */

  saveDailyLog(date, logData) {
    const key = toLocalISODate(date);
    this.logs[key] = { ...this.logs[key], ...logData, updatedAt: new Date().toISOString() };
    writeJson(STORAGE_KEYS.logs, this.logs);
    return this.logs[key];
  }

  getDailyLog(date) {
    return this.logs[toLocalISODate(date)] || null;
  }

  isNewPeriodStart(logData, date = new Date()) {
    const flow = logData.flow?.value;
    return BLEEDING_FLOWS.includes(flow) && !this.isPeriodOnDate(date);
  }

  /* ---------------------------------- tema ---------------------------------- */

  getThemePreference() {
    const stored = readText(STORAGE_KEYS.theme);
    if (stored) return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setThemePreference(theme) {
    writeText(STORAGE_KEYS.theme, theme);
  }
}
