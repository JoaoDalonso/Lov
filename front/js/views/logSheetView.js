/**
 * View: LogSheetView
 * Bottom Sheet de registro diário de sintomas, humor, muco e estilo de vida.
 * Suporta edição de qualquer data do calendário e fixação de rotina/medicamento padrão.
 */
import { toLocalISODate, parseLocalDate } from '../utils/dateUtils.js';

const SINGLE_SELECT_GROUPS = ['flow', 'mucus', 'stress', 'contraception'];
const DEFAULT_TBC = 36.5;

export class LogSheetView {
  constructor() {
    this.sheet = document.getElementById('sheet');
    this.scrim = document.getElementById('scrim');
    this.openBtn = document.getElementById('openLog');
    this.saveBtn = document.getElementById('saveLog');
    this.closeBtn = document.getElementById('closeLogSheet');
    this.sheetContent = this.sheet ? this.sheet.querySelector('.sheet-content') : null;
    this.targetDateBadge = document.getElementById('sheetTargetDate');
    this.sheetHeaderTitle = document.getElementById('sheetHeaderTitle');
    this.checkPinDefaults = document.getElementById('checkPinDefaults');

    this.currentDate = new Date();
    this.currentTbc = DEFAULT_TBC;
    this.hasModifiedTbc = false;
    this.waterGlasses = 0;

    this._setupListeners();
    this._setupTbcControls();
    this._setupWaterTracker();
    this._setupCategoryChips();
  }

  _setupListeners() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => {
        this.openForDate(new Date());
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.toggle(false));
    }

    if (this.scrim) {
      this.scrim.addEventListener('click', () => this.toggle(false));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.sheet?.classList.contains('show')) {
        this.toggle(false);
      }
    });

    if (this.sheet) {
      this.sheet.addEventListener('click', (e) => {
        const opt = e.target.closest('.opt');
        if (!opt) return;

        const groupContainer = opt.closest('[data-group]');
        if (!groupContainer) return;
        const groupName = groupContainer.dataset.group;

        if (SINGLE_SELECT_GROUPS.includes(groupName)) {
          const isAlreadyOn = opt.classList.contains('on');
          groupContainer.querySelectorAll('.opt').forEach((sibling) => {
            sibling.classList.remove('on');
          });
          if (!isAlreadyOn) {
            opt.classList.add('on');
          }
        } else {
          opt.classList.toggle('on');
        }
      });
    }
  }

  _setupCategoryChips() {
    const chipsContainer = document.getElementById('sheetCatChips');
    if (!chipsContainer || !this.sheetContent) return;

    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.sheet-chip');
      if (!chip) return;

      chipsContainer.querySelectorAll('.sheet-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const targetId = chip.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        const targetOffset = targetSection.offsetTop - this.sheetContent.offsetTop;
        this.sheetContent.scrollTo({ top: Math.max(0, targetOffset - 10), behavior: 'smooth' });
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
      this.hasModifiedTbc = true;
      if (display) display.textContent = `${this.currentTbc.toFixed(1)} °C`;
      if (slider) slider.value = this.currentTbc;
    };

    if (minusBtn) {
      minusBtn.addEventListener('click', () => updateTbc(this.currentTbc - 0.1));
    }
    if (plusBtn) {
      plusBtn.addEventListener('click', () => updateTbc(this.currentTbc + 0.1));
    }
    if (slider) {
      slider.addEventListener('input', (e) => updateTbc(parseFloat(e.target.value)));
    }
  }

  _setupWaterTracker() {
    const container = document.getElementById('waterGlassesContainer');
    const label = document.getElementById('displayWaterLabel');
    if (!container) return;

    this._renderGlasses = (count) => {
      this.waterGlasses = count;
      const glasses = container.querySelectorAll('.water-glass');
      glasses.forEach((g, idx) => {
        g.classList.toggle('filled', idx < count);
      });
      const ml = count * 250;
      if (label) {
        label.textContent = count === 0 ? 'Toque nos copos para marcar' : `${count} copos (${(ml / 1000).toFixed(1)}L)`;
      }
    };

    container.addEventListener('click', (e) => {
      const glass = e.target.closest('.water-glass');
      if (!glass) return;
      const idx = parseInt(glass.dataset.idx, 10);
      const newCount = this.waterGlasses === idx ? idx - 1 : idx;
      this._renderGlasses(Math.max(0, newCount));
    });

    this._renderGlasses(0);
  }

  openForDate(date) {
    const targetDate = typeof date === 'string' ? parseLocalDate(date) : date;
    this.currentDate = targetDate || new Date();

    if (this.targetDateBadge) {
      const isToday = toLocalISODate(this.currentDate) === toLocalISODate(new Date());
      const formatted = this.currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
      this.targetDateBadge.textContent = isToday ? `Hoje · ${formatted}` : formatted;
    }

    if (this._onOpen) {
      this._onOpen(this.currentDate);
    }
    this.toggle(true);
  }

  bindOpen(handler) {
    this._onOpen = handler;
  }

  bindSave(handler) {
    if (!this.saveBtn) return;
    this.saveBtn.addEventListener('click', () => {
      const getSelected = (groupName) => {
        const container = this.sheet.querySelector(`[data-group="${groupName}"]`);
        if (!container) return [];
        return Array.from(container.querySelectorAll('.opt.on')).map((el) => {
          const clone = el.cloneNode(true);
          clone.querySelectorAll('span').forEach((s) => s.remove());
          return {
            value: el.dataset.val || clone.textContent.trim(),
            label: clone.textContent.trim() || el.dataset.val
          };
        });
      };

      const logData = {
        flow: getSelected('flow')[0] || null,
        pain: getSelected('pain'),
        mucus: getSelected('mucus')[0] || null,
        bbt: this.hasModifiedTbc ? this.currentTbc : null,
        mood: getSelected('mood'),
        sex: getSelected('sex'),
        contraception: getSelected('contraception')[0] || null,
        sleep: getSelected('sleep'),
        stress: getSelected('stress')[0] || null,
        lifestyleHabits: getSelected('lifestyle_habits'),
        waterGlasses: this.waterGlasses
      };

      const pinDefaults = Boolean(this.checkPinDefaults?.checked);
      handler(logData, this.currentDate, pinDefaults);
      this.toggle(false);
    });
  }

  populate(logData, defaults = null) {
    if (this.sheet) {
      this.sheet.querySelectorAll('.opt').forEach((opt) => opt.classList.remove('on'));
    }

    const dataToUse = logData || (defaults?.pinDefaults ? defaults : null);

    if (this.checkPinDefaults) {
      this.checkPinDefaults.checked = Boolean(defaults?.pinDefaults);
    }

    if (!dataToUse) {
      this.hasModifiedTbc = false;
      this.currentTbc = DEFAULT_TBC;
      const display = document.getElementById('displayTbc');
      const slider = document.getElementById('sliderTbc');
      if (display) display.textContent = `${DEFAULT_TBC.toFixed(1)} °C`;
      if (slider) slider.value = DEFAULT_TBC;
      if (this._renderGlasses) this._renderGlasses(0);
      return;
    }

    const restoreGroup = (groupName, items) => {
      if (!items) return;
      const list = Array.isArray(items) ? items : [items];
      const values = list.map((i) => (typeof i === 'object' ? i.value : i));
      const groupEl = this.sheet.querySelector(`[data-group="${groupName}"]`);
      if (!groupEl) return;
      groupEl.querySelectorAll('.opt').forEach((opt) => {
        if (values.includes(opt.dataset.val)) {
          opt.classList.add('on');
        }
      });
    };

    restoreGroup('flow', dataToUse.flow);
    restoreGroup('pain', dataToUse.pain);
    restoreGroup('mucus', dataToUse.mucus);
    restoreGroup('mood', dataToUse.mood);
    restoreGroup('sex', dataToUse.sex);
    restoreGroup('contraception', dataToUse.contraception || defaults?.contraceptive);
    restoreGroup('sleep', dataToUse.sleep);
    restoreGroup('stress', dataToUse.stress);
    restoreGroup('lifestyle_habits', dataToUse.lifestyleHabits || defaults?.habits);

    if (dataToUse.bbt !== null && dataToUse.bbt !== undefined) {
      this.currentTbc = dataToUse.bbt;
      this.hasModifiedTbc = true;
      const display = document.getElementById('displayTbc');
      const slider = document.getElementById('sliderTbc');
      if (display) display.textContent = `${this.currentTbc.toFixed(1)} °C`;
      if (slider) slider.value = this.currentTbc;
    }

    if (this._renderGlasses) {
      this._renderGlasses(dataToUse.waterGlasses || defaults?.waterGlasses || 0);
    }
  }

  toggle(isOpen) {
    if (!this.sheet || !this.scrim) return;
    this.sheet.classList.toggle('show', isOpen);
    this.scrim.classList.toggle('show', isOpen);
    this.sheet.setAttribute('aria-hidden', String(!isOpen));
    this.sheet.inert = !isOpen;

    if (isOpen && this.sheetContent) {
      this.sheetContent.scrollTop = 0;
    }
  }
}
