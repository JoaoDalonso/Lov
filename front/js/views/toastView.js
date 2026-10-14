/**
 * View: ToastView
 * Mensagens rápidas de feedback.
 */
const VISIBLE_MS = 2400;

export class ToastView {
  constructor() {
    this.element = document.getElementById('toast');
    this.timeoutId = null;
  }

  show(message) {
    this.element.textContent = message;
    this.element.classList.add('show');
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.element.classList.remove('show'), VISIBLE_MS);
  }
}
