/**
 * Camada de persistência local (localStorage) com tratamento de erro centralizado.
 */
export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Falha ao ler "${key}" do localStorage:`, error);
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Falha ao gravar "${key}" no localStorage:`, error);
  }
}

export function readText(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeText(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Falha ao gravar "${key}" no localStorage:`, error);
  }
}
