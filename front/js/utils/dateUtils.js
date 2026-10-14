/**
 * Utilitários de data.
 * Sempre trabalham no fuso LOCAL do usuário (referência Brasília / UTC-3).
 * Evita o bug de UTC do toISOString e o comportamento legado de 2 dígitos do JavaScript.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date = new Date()) {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(date, amount) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/** Diferença em dias de calendário (to - from), imune a horário de verão. */
export function daysBetween(from, to) {
  const d1 = from instanceof Date ? from : parseLocalDate(from) || new Date();
  const d2 = to instanceof Date ? to : parseLocalDate(to) || new Date();
  return Math.round((startOfDay(d2) - startOfDay(d1)) / MS_PER_DAY);
}

/** Date -> 'YYYY-MM-DD' no fuso local. Garante ano moderno >= 2000. */
export function toLocalISODate(date = new Date()) {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  let year = d.getFullYear();
  if (year < 100) year += 2000;
  if (year < 2000) year = new Date().getFullYear();

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 
 * 'YYYY-MM-DD' ou 'DD-MM-YYYY' ou 'DD/MM/YYYY' -> Date local à meia-noite.
 * Protegido contra anos legados < 2000 (ex: 1906). Retorna null se inválido.
 */
export function parseLocalDate(isoDate) {
  if (!isoDate) return null;
  if (isoDate instanceof Date) {
    if (isNaN(isoDate.getTime())) return null;
    let y = isoDate.getFullYear();
    if (y < 2000) isoDate.setFullYear(new Date().getFullYear());
    return startOfDay(isoDate);
  }
  if (typeof isoDate !== 'string') return null;

  const parts = isoDate.includes('/') ? isoDate.split('/') : isoDate.split('-');
  if (parts.length !== 3) return null;

  const [p1, p2, p3] = parts.map((n) => parseInt(n, 10));
  if (isNaN(p1) || isNaN(p2) || isNaN(p3)) return null;

  let year, month, day;
  if (p1 > 1000) {
    // Formato padrão ISO: YYYY-MM-DD
    year = p1;
    month = p2;
    day = p3;
  } else if (p3 > 1000) {
    // Formato brasileiro comum: DD-MM-YYYY ou DD/MM/YYYY
    day = p1;
    month = p2;
    year = p3;
  } else {
    // Fallback para anos de 2 dígitos (ex: 26 -> 2026)
    year = p1 > 31 ? p1 : p3;
    month = p2;
    day = p1 > 31 ? p3 : p1;
  }

  // Sanitização estrita de ano (evita bug de 1906 / 2 dígitos)
  if (year < 100) year += 2000;
  if (year < 2000) year = new Date().getFullYear();

  const d = new Date(year, month - 1, day);
  d.setFullYear(year);
  return d;
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return daysBetween(a, b) === 0;
}

