/**
 * View: LogSheetView
 * Controla a Bottom Sheet completa de registro diário:
 * Fluxo, Cólicas/Dores, Muco Cervical, Temperatura Basal (TBC), Humor, Atividade Sexual e Estilo de Vida.
 */
export class LogSheetView {
  constructor() {
    this.sheet = document.getElementById('sheet');
    this.scrim = document.getElementById('scrim');
    this.openBtn = document.getElementById('openLog');
    this.saveBtn = document.getElementById('saveLog');
    this.closeBtn = document.getElementById('closeLogSheet');
    this.toastEl = document.getElementById('toast');
    this.micBtn = document.getElementById('micBtn');

    // Estado local da sheet
    this.currentTbc = 36.5;
    this.waterGlasses = 6;

    this._setupListeners();
    this._setupTbcControls();
    this._setupWaterTracker();
    this._setupCategoryChips();
  }

  _setupListeners() {
    if (this.openBtn) {
      this.openBtn.onclick = () => this.toggle(true);
    }
    if (this.closeBtn) {
      this.closeBtn.onclick = () => this.toggle(false);
    }
    if (this.scrim) {
      this.scrim.onclick = () => this.toggle(false);
    }

    if (this.sheet) {
      this.sheet.addEventListener('click', (e) => {
        const opt = e.target.closest('.opt');
        if (!opt) return;

        const groupName = opt.parentElement.dataset.group;
        // Grupos de seleção única (fluxo, muco, estresse, pílula)
        const singleSelectGroups = ['flow', 'mucus', 'stress', 'contraception'];

        if (singleSelectGroups.includes(groupName)) {
          const isAlreadyOn = opt.classList.contains('on');
          opt.parentElement.querySelectorAll('.opt').forEach(sibling => {
            sibling.classList.remove('on');
          });
          if (!isAlreadyOn) {
            opt.classList.add('on');
          }
        } else {
          // Seleção múltipla (dores, humor, sexo, sono, hábitos)
          opt.classList.toggle('on');
        }
      });
    }
  }

  _setupCategoryChips() {
    const chipsContainer = document.getElementById('sheetCatChips');
    if (!chipsContainer) return;

    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.sheet-chip');
      if (!chip) return;

      chipsContainer.querySelectorAll('.sheet-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const targetId = chip.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  _setupTbcControls() {
    const minusBtn = document.getElementById('btnTbcMinus');
    const plusBtn = document.getElementById('btnTbcPlus');
    const slider = document.getElementById('sliderTbc');
    const display = document.getElementById('displayTbc');

    const updateTbc = (newVal) => {
      this.currentTbc = Math.round(Math.max(35.5, Math.min(38.0, newVal)) * 10) / 10;
      if (display) display.textContent = `${this.currentTbc.toFixed(1)} °C`;
      if (slider) slider.value = this.currentTbc;
    };

    if (minusBtn) {
      minusBtn.onclick = () => updateTbc(this.currentTbc - 0.1);
    }
    if (plusBtn) {
      plusBtn.onclick = () => updateTbc(this.currentTbc + 0.1);
    }
    if (slider) {
      slider.addEventListener('input', (e) => updateTbc(parseFloat(e.target.value)));
    }
  }

  _setupWaterTracker() {
    const container = document.getElementById('waterGlassesContainer');
    const label = document.getElementById('displayWaterLabel');
    if (!container) return;

    const renderGlasses = (count) => {
      this.waterGlasses = count;
      const glasses = container.querySelectorAll('.water-glass');
      glasses.forEach((g, idx) => {
        g.classList.toggle('filled', idx < count);
      });
      const ml = count * 250;
      if (label) {
        label.textContent = `${count} copos (${(ml / 1000).toFixed(1)}L)`;
      }
    };

    container.addEventListener('click', (e) => {
      const glass = e.target.closest('.water-glass');
      if (!glass) return;
      const idx = parseInt(glass.dataset.idx, 10);
      renderGlasses(idx);
    });

    renderGlasses(this.waterGlasses);
  }

  bindSave(handler) {
    if (this.saveBtn) {
      this.saveBtn.onclick = () => {
        // Coleta detalhada dos dados categorizados
        const getSelectedInGroup = (groupName) => {
          const container = this.sheet.querySelector(`[data-group="${groupName}"]`);
          if (!container) return [];
          return Array.from(container.querySelectorAll('.opt.on')).map(el => ({
            value: el.dataset.val || el.textContent.trim(),
            label: el.textContent.trim()
          }));
        };

        const logData = {
          flow: getSelectedInGroup('flow')[0] || null,
          pain: getSelectedInGroup('pain'),
          mucus: getSelectedInGroup('mucus')[0] || null,
          bbt: this.currentTbc,
          mood: getSelectedInGroup('mood'),
          sex: getSelectedInGroup('sex'),
          contraception: getSelectedInGroup('contraception')[0] || null,
          sleep: getSelectedInGroup('sleep'),
          stress: getSelectedInGroup('stress')[0] || null,
          lifestyleHabits: getSelectedInGroup('lifestyle_habits'),
          waterGlasses: this.waterGlasses
        };

        handler(logData);
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
