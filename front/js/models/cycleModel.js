/**
 * Model: CycleModel
 * Regras de negócio do ciclo menstrual: previsão, fases, histórico e registros diários.
 * Não conhece DOM nem interface.
 */
import { addDays, daysBetween, startOfDay, toLocalISODate, parseLocalDate, isSameDay } from '../utils/dateUtils.js';
import { readJson, writeJson, readText, writeText } from '../utils/storage.js';
import { PHASE_CONTENT } from './phaseContent.js';

const STORAGE_KEYS = {
  cycle: 'lov_cycle_v2',
  logs: 'lov_daily_logs',
  theme: 'lov_theme'
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
const average = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;

export class CycleModel {
  constructor() {
    this.config = readJson(STORAGE_KEYS.cycle, null) || this._buildDefaultConfig();
    this.logs = readJson(STORAGE_KEYS.logs, {});
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

  _persistConfig() {
    writeJson(STORAGE_KEYS.cycle, this.config);
  }

  /** Define o ciclo a partir do onboarding. */
  setupInitialCycle({ startDateStr, cycleLength, periodLength, isUnknownCycle = false, contraceptive = 'none' }) {
    const today = startOfDay();
    let startDate = parseLocalDate(startDateStr);
    if (!startDate || startDate > today) startDate = today;

    this.config = {
      lastPeriodStartDate: toLocalISODate(startDate),
      cycleLength: isUnknownCycle
        ? LIMITS.cycleLength.fallback
        : clamp(toInt(cycleLength, LIMITS.cycleLength.fallback), LIMITS.cycleLength),
      periodLength: clamp(toInt(periodLength, LIMITS.periodLength.fallback), LIMITS.periodLength),
      isCycleLengthUnknown: Boolean(isUnknownCycle),
      contraceptiveMethod: contraceptive,
      measuredCycleLengths: []
    };
    this._persistConfig();
    return this.getCycleInfo();
  }

  /**
   * Registra o início de uma nova menstruação e recalibra a duração média do ciclo
   * com base nos ciclos medidos (aprendizado automático).
   */
  registerPeriodStart(date = new Date()) {
    const newStart = startOfDay(date);
    const previousStart = parseLocalDate(this.config.lastPeriodStartDate);
    const measured = previousStart ? daysBetween(previousStart, newStart) : 0;

    if (measured > 0) {
      const { min, max } = LIMITS.plausibleMeasuredCycle;
      if (measured >= min && measured <= max) {
        this.config.measuredCycleLengths = [...this.config.measuredCycleLengths, measured].slice(-HISTORY_SIZE);
      }
    }

    this.config.lastPeriodStartDate = toLocalISODate(newStart);
    this.config.cycleLength = this._resolveCycleLength();
    this._persistConfig();
    return this.getCycleInfo();
  }

  /** Usa a média medida quando há dados suficientes; senão, o valor informado. */
  _resolveCycleLength() {
    const lengths = this.config.measuredCycleLengths;
    const minSamples = this.config.isCycleLengthUnknown ? 1 : 3;
    if (lengths.length < minSamples) return this.config.cycleLength;
    return clamp(Math.round(average(lengths)), LIMITS.cycleLength);
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

  /** Posição do ciclo para uma data: dia (1..n) e índice do ciclo (0 = ciclo registrado). */
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

    return {
      todayCycleDay: cycleDay,
      cycleLength,
      periodLength,
      ovulationDay: this._ovulationDay(),
      fertileRange: this._fertileRange(),
      phase,
      phaseLabel: PHASE_LABEL[phase],
      isPeriodDay: phase === PHASE.MENSTRUAL,
      daysUntilNextPeriod: cycleLength - cycleDay + 1,
      isCycleLengthUnknown: this.config.isCycleLengthUnknown,
      contraceptiveMethod: this.config.contraceptiveMethod,
      lastPeriodStartDate: this.config.lastPeriodStartDate
    };
  }

  /**
   * Classificação visual de um dia do calendário.
   * @returns {'period'|'predicted'|'ovulation'|'fertile'|null}
   */
  getDayType(date) {
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

  /** Dias da semana atual (domingo a sábado) já classificados. */
  getWeek(reference = new Date()) {
    const sunday = addDays(reference, -reference.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(sunday, index);
      return {
        date,
        dayNumber: date.getDate(),
        type: this.getDayType(date),
        isToday: isSameDay(date, reference)
      };
    });
  }

  /** Grade de um mês: deslocamento do 1º dia e dias classificados. */
  getMonth(year, month) {
    const totalDays = new Date(year, month + 1, 0).getDate();
    return {
      leadingBlanks: new Date(year, month, 1).getDay(),
      days: Array.from({ length: totalDays }, (_, index) => {
        const date = new Date(year, month, index + 1);
        return {
          dayNumber: index + 1,
          type: this.getDayType(date),
          isToday: isSameDay(date, new Date())
        };
      })
    };
  }

  getPhaseCards(info = this.getCycleInfo()) {
    return PHASE_CONTENT[info.phase].map((card, index) =>
      index === 1 && info.phase === PHASE.MENSTRUAL
        ? { ...card, title: `Dia ${info.todayCycleDay} do ciclo` }
        : card
    );
  }

  /* --------------------------------- insights -------------------------------- */

  getStats() {
    const lengths = this.config.measuredCycleLengths;
    return {
      cycleLength: this.config.cycleLength,
      periodLength: this.config.periodLength,
      ovulationDay: this._ovulationDay(),
      regularity: this._regularityPercent(lengths),
      trackedCycles: lengths.length
    };
  }

  /** 100% = ciclos idênticos; cai ~10 pontos por dia de desvio padrão. */
  _regularityPercent(lengths) {
    if (lengths.length < 2) return null;
    const mean = average(lengths);
    const deviation = Math.sqrt(average(lengths.map((l) => (l - mean) ** 2)));
    return Math.round(clamp(100 - deviation * 10, { min: 0, max: 100 }));
  }

  /** Sintomas mais registrados (dores e humor), em % dos dias com registro. */
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

  /** Sangramento de verdade (não spotting) fora da janela prevista sugere um novo ciclo. */
  isNewPeriodStart(logData, date = new Date()) {
    const flow = logData.flow?.value;
    return BLEEDING_FLOWS.includes(flow) && !this.getCycleInfo(date).isPeriodDay;
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
