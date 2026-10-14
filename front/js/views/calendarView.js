/**
 * View: CalendarView
 * Renderiza o calendário mensal, com previsões de período, janela fértil e ovulação.
 */
export class CalendarView {
  constructor() {
    this.title = document.getElementById('calTitle');
    this.grid = document.getElementById('calGrid');
    this.prevBtn = document.getElementById('calPrev');
    this.nextBtn = document.getElementById('calNext');
    this.viewDate = new Date();
    this.viewDate.setDate(1);
  }

  bindMonthChange(handler) {
    if (this.prevBtn) {
      this.prevBtn.onclick = () => {
        this.viewDate.setMonth(this.viewDate.getMonth() - 1);
        handler(this.viewDate);
      };
    }
    if (this.nextBtn) {
      this.nextBtn.onclick = () => {
        this.viewDate.setMonth(this.viewDate.getMonth() + 1);
        handler(this.viewDate);
      };
    }
  }

  render(viewDate, cycleInfo) {
    if (!this.grid) return;

    this.viewDate = viewDate;
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const now = new Date();

    if (this.title) {
      this.title.textContent = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    const firstDayIndex = new Date(y, m, 1).getDay();
    const totalDays = new Date(y, m + 1, 0).getDate();

    const cycleStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (cycleInfo.todayCycleDay - 1));

    const dayHeaders = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
      .map(d => `<div class="dow">${d}</div>`)
      .join('');

    const emptyDays = '<div class="day empty"></div>'.repeat(firstDayIndex);

    let daysHtml = '';
    for (let d = 1; d <= totalDays; d++) {
      const currentDate = new Date(y, m, d);
      const diffDays = Math.round((currentDate - cycleStart) / 864e5);
      const cycleDay = ((diffDays % cycleInfo.cycleLength) + cycleInfo.cycleLength) % cycleInfo.cycleLength + 1;
      const cycleNumber = Math.floor(diffDays / cycleInfo.cycleLength);

      let cls = '';
      if (cycleDay <= cycleInfo.periodLength) {
        cls = cycleNumber <= 0 ? 'period' : 'predicted';
      } else if (cycleDay === cycleInfo.ovulationDay) {
        cls = 'ovulation';
      } else if (cycleDay >= cycleInfo.fertileRange[0] && cycleDay <= cycleInfo.fertileRange[1]) {
        cls = 'fertile';
      }

      const isToday = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
      const todayCls = isToday ? 'today' : '';

      daysHtml += `<div class="day ${cls} ${todayCls}">${d}</div>`;
    }

    this.grid.innerHTML = dayHeaders + emptyDays + daysHtml;
  }
}
