/**
 * View: CalendarView
 * Grade mensal interativa, painel do dia selecionado e histórico completo de menstruações.
 */
import { parseLocalDate, toLocalISODate } from '../utils/dateUtils.js';

const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const PHASE_BADGES = {
  menstrual: '🩸 Menstruação',
  follicular: '🌿 Fase Folicular',
  fertile: '🥚 Janela Fértil',
  ovulation: '✨ Provável Ovulação',
  luteal: '🌙 Fase Lútea'
};

export class CalendarView {
  constructor() {
    this.title = document.getElementById('calTitle');
    this.grid = document.getElementById('calGrid');
    this.prevButton = document.getElementById('calPrev');
    this.nextButton = document.getElementById('calNext');

    // Painel do dia selecionado
    this.dayDetailPanel = document.getElementById('calDayDetail');
    this.selectedDayBadge = document.getElementById('selectedDayBadge');
    this.selectedDayTitle = document.getElementById('selectedDayTitle');
    this.selectedDaySub = document.getElementById('selectedDaySub');
    this.btnToggleDayPeriod = document.getElementById('btnToggleDayPeriod');
    this.btnTogglePeriodText = document.getElementById('btnTogglePeriodText');
    this.btnOpenDayLog = document.getElementById('btnOpenDayLog');
    this.selectedDaySummary = document.getElementById('selectedDaySummary');

    // Histórico de períodos
    this.historyList = document.getElementById('periodHistoryList');
    this.btnAddPeriodBtn = document.getElementById('btnAddPeriodBtn');

    // Modal de adicionar/editar período
    this.periodModal = document.getElementById('periodModal');
    this.closePeriodModalBtn = document.getElementById('closePeriodModal');
    this.periodModalTitle = document.getElementById('periodModalTitle');
    this.periodEditId = document.getElementById('periodEditId');
    this.periodStartDateInput = document.getElementById('periodStartDateInput');
    this.periodEndDateInput = document.getElementById('periodEndDateInput');
    this.btnSavePeriod = document.getElementById('btnSavePeriod');
    this.btnDeletePeriod = document.getElementById('btnDeletePeriod');

    this.currentSelectedIso = toLocalISODate(new Date());

    this._setupGridClicks();
    this._setupModalListeners();
  }

  _setupGridClicks() {
    if (!this.grid) return;
    this.grid.addEventListener('click', (e) => {
      const dayBtn = e.target.closest('button.day');
      if (!dayBtn || !this._onDaySelect) return;
      const iso = dayBtn.dataset.date;
      if (iso) {
        this.currentSelectedIso = iso;
        this._onDaySelect(iso);
      }
    });
  }

  _setupModalListeners() {
    if (this.closePeriodModalBtn) {
      this.closePeriodModalBtn.addEventListener('click', () => this.closePeriodModal());
    }
    if (this.periodModal) {
      this.periodModal.addEventListener('click', (e) => {
        if (e.target === this.periodModal) this.closePeriodModal();
      });
    }
  }

  bindMonthChange(handler) {
    if (this.prevButton) this.prevButton.onclick = () => handler(-1);
    if (this.nextButton) this.nextButton.onclick = () => handler(1);
  }

  bindDaySelect(handler) {
    this._onDaySelect = handler;
  }

  bindToggleDayPeriod(handler) {
    if (this.btnToggleDayPeriod) {
      this.btnToggleDayPeriod.addEventListener('click', () => {
        handler(this.currentSelectedIso);
      });
    }
  }

  bindOpenDayLog(handler) {
    if (this.btnOpenDayLog) {
      this.btnOpenDayLog.addEventListener('click', () => {
        handler(this.currentSelectedIso);
      });
    }
  }

  bindAddPeriod(handler) {
    if (this.btnAddPeriodBtn) {
      this.btnAddPeriodBtn.addEventListener('click', () => {
        handler();
      });
    }
  }

  bindSavePeriod(handler) {
    if (this.btnSavePeriod) {
      this.btnSavePeriod.addEventListener('click', () => {
        const id = this.periodEditId?.value || null;
        const startDate = this.periodStartDateInput?.value;
        const endDate = this.periodEndDateInput?.value || startDate;
        if (startDate) {
          handler({ id, startDate, endDate });
          this.closePeriodModal();
        }
      });
    }
  }

  bindDeletePeriod(handler) {
    if (this.btnDeletePeriod) {
      this.btnDeletePeriod.addEventListener('click', () => {
        const id = this.periodEditId?.value;
        if (id) {
          handler(id);
          this.closePeriodModal();
        }
      });
    }
  }

  openPeriodModal(period = null) {
    if (!this.periodModal) return;
    this.periodModal.classList.add('show');
    this.periodModal.setAttribute('aria-hidden', 'false');

    if (period) {
      if (this.periodModalTitle) this.periodModalTitle.textContent = 'Editar menstruação';
      if (this.periodEditId) this.periodEditId.value = period.id;
      if (this.periodStartDateInput) this.periodStartDateInput.value = period.startDate;
      if (this.periodEndDateInput) this.periodEndDateInput.value = period.endDate;
      if (this.btnDeletePeriod) this.btnDeletePeriod.style.display = 'inline-flex';
    } else {
      if (this.periodModalTitle) this.periodModalTitle.textContent = 'Adicionar menstruação';
      if (this.periodEditId) this.periodEditId.value = '';
      if (this.periodStartDateInput) this.periodStartDateInput.value = this.currentSelectedIso;
      if (this.periodEndDateInput) this.periodEndDateInput.value = this.currentSelectedIso;
      if (this.btnDeletePeriod) this.btnDeletePeriod.style.display = 'none';
    }
  }

  closePeriodModal() {
    if (!this.periodModal) return;
    this.periodModal.classList.remove('show');
    this.periodModal.setAttribute('aria-hidden', 'true');
  }

  render(monthDate, { leadingBlanks, days }, dayDetail = null, periodsHistory = []) {
    // 1. Título do mês (fuso local de Brasília e ano atualizado)
    if (this.title) {
      const year = monthDate.getFullYear() < 2000 ? new Date().getFullYear() : monthDate.getFullYear();
      const safeMonthDate = new Date(year, monthDate.getMonth(), 1);
      const rawMonth = safeMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      this.title.textContent = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
    }

    // 2. Grade de dias
    const headers = WEEKDAY_INITIALS.map((initial) => `<div class="dow">${initial}</div>`).join('');
    const blanks = '<div class="day empty" aria-hidden="true"></div>'.repeat(leadingBlanks);
    const cells = days
      .map(({ iso, dayNumber, type, isToday, isSelected }) => {
        const classes = [
          'day',
          type || '',
          isToday ? 'today' : '',
          isSelected ? 'selected' : ''
        ]
          .filter(Boolean)
          .join(' ');

        return `<button class="${classes}" data-date="${iso}" type="button" aria-label="Dia ${dayNumber}">${dayNumber}</button>`;
      })
      .join('');

    if (this.grid) {
      this.grid.innerHTML = headers + blanks + cells;
    }

    // 3. Painel do dia selecionado
    if (dayDetail) {
      this.currentSelectedIso = dayDetail.iso;
      this._renderDayDetail(dayDetail);
    }

    // 4. Histórico de períodos
    if (periodsHistory) {
      this._renderPeriodsHistory(periodsHistory);
    }
  }

  _renderDayDetail({ date, iso, cycleDay, phase, phaseLabel, isPeriod, log, isToday }) {
    if (!this.dayDetailPanel) return;

    if (this.selectedDayTitle) {
      this.selectedDayTitle.textContent = date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        weekday: 'short'
      });
    }

    if (this.selectedDaySub) {
      this.selectedDaySub.textContent = isToday ? `Hoje · ${cycleDay}º dia do ciclo` : `${cycleDay}º dia do ciclo`;
    }

    if (this.selectedDayBadge) {
      this.selectedDayBadge.textContent = isPeriod ? '🩸 Menstruação' : (PHASE_BADGES[phase] || phaseLabel);
      this.selectedDayBadge.className = `day-detail-badge ${isPeriod ? 'period' : phase}`;
    }

    if (this.btnToggleDayPeriod && this.btnTogglePeriodText) {
      if (isPeriod) {
        this.btnTogglePeriodText.textContent = 'Remover menstruação';
        this.btnToggleDayPeriod.classList.add('is-active-period');
      } else {
        this.btnTogglePeriodText.textContent = 'Marcar menstruação';
        this.btnToggleDayPeriod.classList.remove('is-active-period');
      }
    }

    if (this.selectedDaySummary) {
      const summaryItems = [];
      if (log?.flow) summaryItems.push(`Fluxo: ${log.flow.label}`);
      if (log?.pain?.length) summaryItems.push(`Dores: ${log.pain.map((p) => p.label).join(', ')}`);
      if (log?.mood?.length) summaryItems.push(`Humor: ${log.mood.map((m) => m.label).join(', ')}`);
      if (log?.mucus) summaryItems.push(`Muco: ${log.mucus.label}`);
      if (log?.contraception) summaryItems.push(`Remédio: ${log.contraception.label}`);
      if (log?.waterGlasses) summaryItems.push(`Água: ${log.waterGlasses} copos`);

      if (summaryItems.length) {
        this.selectedDaySummary.innerHTML = `
          <div class="day-symptoms-chips">
            ${summaryItems.map((s) => `<span class="symptom-tag">${s}</span>`).join('')}
          </div>`;
      } else {
        this.selectedDaySummary.innerHTML = `<p class="empty-hint">Nenhum sintoma adicional registrado neste dia.</p>`;
      }
    }
  }

  _renderPeriodsHistory(periods) {
    if (!this.historyList) return;

    if (!periods.length) {
      this.historyList.innerHTML = `<p class="empty-state">Nenhum ciclo anterior cadastrado ainda. Use o botão acima para adicionar!</p>`;
      return;
    }

    this.historyList.innerHTML = periods
      .map((p, idx) => {
        const start = parseLocalDate(p.startDate);
        const end = parseLocalDate(p.endDate);
        const startFormatted = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        const endFormatted = end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        const isCurrent = idx === 0;

        return `
          <div class="period-history-item panel">
            <div class="period-item-info">
              <span class="period-tag ${isCurrent ? 'current' : ''}">${isCurrent ? 'Ciclo Atual' : `Ciclo ${periods.length - idx}`}</span>
              <h4>${startFormatted} – ${endFormatted}</h4>
              <p>${p.periodLength} ${p.periodLength === 1 ? 'dia' : 'dias'} de sangramento</p>
            </div>
            <button class="btn-icon-edit" data-edit-period="${p.id}" aria-label="Editar ciclo">✏️</button>
          </div>`;
      })
      .join('');

    // Adiciona listener de edição aos botões
    this.historyList.querySelectorAll('[data-edit-period]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.editPeriod;
        const period = periods.find((p) => p.id === id);
        if (period) {
          this.openPeriodModal(period);
        }
      });
    });
  }
}
