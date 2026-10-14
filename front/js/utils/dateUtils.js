/**
 * Utilitários de data.
 * Sempre trabalham no fuso LOCAL do usuário (evita o bug de UTC do toISOString/new Date('YYYY-MM-DD')).
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, amount) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/** Diferença em dias de calendário (to - from), imune a horário de verão. */
export function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

/** Date -> 'YYYY-MM-DD' no fuso local. */
export function toLocalISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 'YYYY-MM-DD' -> Date à meia-noite local. Retorna null se inválida. */
export function parseLocalDate(isoDate) {
  if (typeof isoDate !== 'string') return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function isSameDay(a, b) {
  return daysBetween(a, b) === 0;
}
