/**
 * View: InsightsView
 * Renderiza os dados analíticos e barras estatísticas de sintomas.
 */
export class InsightsView {
  constructor() {
    this.barsContainer = document.getElementById('bars');
  }

  render(symptoms) {
    if (!this.barsContainer) return;

    this.barsContainer.innerHTML = symptoms.map(s => `
      <div class="bar-row">
        <span>${s.name}</span>
        <div class="track">
          <div class="fill" data-w="${s.percent}"></div>
        </div>
        <span>${s.percent}%</span>
      </div>
    `).join('');
  }

  animateBars() {
    const fills = this.barsContainer ? this.barsContainer.querySelectorAll('.fill') : [];
    fills.forEach(f => {
      f.style.width = '0';
      requestAnimationFrame(() => {
        f.style.width = `${f.dataset.w}%`;
      });
    });
  }
}
