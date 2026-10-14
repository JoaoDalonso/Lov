/**
 * View: LogSheetView
 * Controla a gaveta inferior (bottom sheet) de registro diário de sintomas, humor e fluxo.
 */
export class LogSheetView {
  constructor() {
    this.sheet = document.getElementById('sheet');
    this.scrim = document.getElementById('scrim');
    this.openBtn = document.getElementById('openLog');
    this.saveBtn = document.getElementById('saveLog');
    this.toastEl = document.getElementById('toast');
    this.micBtn = document.getElementById('micBtn');

    this._setupListeners();
  }

  _setupListeners() {
    if (this.openBtn) {
      this.openBtn.onclick = () => this.toggle(true);
    }
    if (this.scrim) {
      this.scrim.onclick = () => this.toggle(false);
    }
    if (this.sheet) {
      this.sheet.addEventListener('click', (e) => {
        const opt = e.target.closest('.opt');
        if (!opt) return;

        // Se for grupo de fluxo (seleção única)
        if (opt.parentElement.dataset.group === 'flow') {
          const siblings = opt.parentElement.querySelectorAll('.opt');
          siblings.forEach(sibling => {
            if (sibling !== opt) sibling.classList.remove('on');
          });
        }
        opt.classList.toggle('on');
      });
    }
  }

  bindSave(handler) {
    if (this.saveBtn) {
      this.saveBtn.onclick = () => {
        const selected = Array.from(this.sheet.querySelectorAll('.opt.on')).map(el => el.textContent.trim());
        handler(selected);
        this.toggle(false);
      };
    }

    if (this.micBtn) {
      this.micBtn.onclick = () => {
        this.showToast('Assistente de voz: em integração na Fase 3 🎙️✨');
      };
    }
  }

  toggle(isOpen) {
    if (!this.sheet || !this.scrim) return;
    this.sheet.classList.toggle('show', isOpen);
    this.scrim.classList.toggle('show', isOpen);
    this.sheet.setAttribute('aria-hidden', String(!isOpen));
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2400);
  }
}
