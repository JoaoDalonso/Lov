/**
 * View: WeekView
 * Renderiza a barra semanal e destaque do dia atual.
 */
export class WeekView {
  constructor() {
    this.container = document.getElementById('week');
    this.todayDateLabel = document.getElementById('todayDate');
  }

  render(cycleInfo) {
    if (!this.container) return;

    const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    if (this.todayDateLabel) {
      this.todayDateLabel.textContent = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }

    const html = dayNames.map((name, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const offset = i - now.getDay();
      const currentCycleDay = cycleInfo.todayCycleDay + offset;
      
      const isPeriod = currentCycleDay >= 1 && currentCycleDay <= cycleInfo.periodLength;
      const isToday = offset === 0;

      const classes = [
        'd',
        isPeriod ? 'period' : '',
        isToday ? 'today' : ''
      ].filter(Boolean).join(' ');

      return `<div class="${classes}">${name}<b>${d.getDate()}</b></div>`;
    }).join('');

    this.container.innerHTML = html;
  }
}
