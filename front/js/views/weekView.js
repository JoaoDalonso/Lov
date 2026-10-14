/**
 * View: WeekView
 * Data de hoje e faixa interativa da semana atual (dias clicáveis para registro/inspeção).
 */
const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export class WeekView {
  constructor() {
    this.container = document.getElementById('week');
    this.dateLabel = document.getElementById('todayDate');
    this._onDaySelect = null;
    this._setupDayClicks();
  }

  _setupDayClicks() {
    if (!this.container) return;
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('button.d');
      if (!btn || !this._onDaySelect) return;
      const dateIso = btn.dataset.date;
      if (dateIso) {
        this._onDaySelect(dateIso);
      }
    });
  }

  bindDaySelect(handler) {
    this._onDaySelect = handler;
  }

  render(weekDays, referenceDate = new Date()) {
    if (this.dateLabel) {
      this.dateLabel.textContent = referenceDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }

    if (!this.container) return;

    this.container.innerHTML = weekDays
      .map(({ date, iso, dayNumber, type, isToday, isSelected }, index) => {
        const classes = [
          'd',
          type === 'period' ? 'period' : '',
          isToday ? 'today' : '',
          isSelected ? 'selected' : ''
        ]
          .filter(Boolean)
          .join(' ');

        return `<button class="${classes}" data-date="${iso}" type="button" aria-label="Dia ${dayNumber}">
          ${WEEKDAY_INITIALS[index]}<b>${dayNumber}</b>
        </button>`;
      })
      .join('');
  }
}
