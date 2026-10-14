/**
 * View: WeekView
 * Data de hoje e faixa da semana atual.
 */
const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export class WeekView {
  constructor() {
    this.container = document.getElementById('week');
    this.dateLabel = document.getElementById('todayDate');
  }

  render(weekDays, today = new Date()) {
    this.dateLabel.textContent = today.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    this.container.innerHTML = weekDays
      .map(({ dayNumber, type, isToday }, index) => {
        const classes = ['d', type === 'period' ? 'period' : '', isToday ? 'today' : ''].filter(Boolean).join(' ');
        return `<div class="${classes}">${WEEKDAY_INITIALS[index]}<b>${dayNumber}</b></div>`;
      })
      .join('');
  }
}
