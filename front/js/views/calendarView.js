/**
 * View: CalendarView
 * Renderiza a grade mensal. O mês exibido é estado do Controller.
 */
const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export class CalendarView {
  constructor() {
    this.title = document.getElementById('calTitle');
    this.grid = document.getElementById('calGrid');
    this.prevButton = document.getElementById('calPrev');
    this.nextButton = document.getElementById('calNext');
  }

  /** @param {(monthOffset: number) => void} handler -1 (anterior) ou +1 (próximo) */
  bindMonthChange(handler) {
    this.prevButton.onclick = () => handler(-1);
    this.nextButton.onclick = () => handler(1);
  }

  render(monthDate, { leadingBlanks, days }) {
    this.title.textContent = monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const headers = WEEKDAY_INITIALS.map((initial) => `<div class="dow">${initial}</div>`).join('');
    const blanks = '<div class="day empty" aria-hidden="true"></div>'.repeat(leadingBlanks);
    const cells = days
      .map(({ dayNumber, type, isToday }) => {
        const classes = ['day', type || '', isToday ? 'today' : ''].filter(Boolean).join(' ');
        return `<div class="${classes}">${dayNumber}</div>`;
      })
      .join('');

    this.grid.innerHTML = headers + blanks + cells;
  }
}
