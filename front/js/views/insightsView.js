/**
 * View: InsightsView
 * Estatísticas do ciclo e barras de sintomas mais frequentes.
 */
export class InsightsView {
  constructor() {
    this.barsContainer = document.getElementById('bars');
    this.stats = {
      cycle: document.getElementById('statCycle'),
      period: document.getElementById('statPeriod'),
      regularity: document.getElementById('statRegularity'),
      regularityUnit: document.getElementById('statRegularityUnit'),
      ovulation: document.getElementById('statOvulation')
    };
  }

  renderStats({ cycleLength, periodLength, ovulationDay, regularity }) {
    this.stats.cycle.textContent = cycleLength;
    this.stats.period.textContent = periodLength;
    this.stats.ovulation.textContent = ovulationDay;

    const hasRegularity = regularity !== null;
    this.stats.regularity.textContent = hasRegularity ? regularity : '—';
    this.stats.regularityUnit.textContent = hasRegularity ? '%' : '';
  }

  renderSymptoms(symptoms) {
    if (!symptoms.length) {
      this.barsContainer.innerHTML = `
        <p class="empty-state">Registre como você se sente no dia a dia e seus sintomas mais frequentes aparecem aqui. 🌸</p>`;
      return;
    }

    this.barsContainer.innerHTML = symptoms
      .map(
        ({ name, percent }) => `
          <div class="bar-row">
            <span>${name}</span>
            <div class="track"><div class="fill" data-width="${percent}"></div></div>
            <span>${percent}%</span>
          </div>`
      )
      .join('');
  }

  animateBars() {
    this.barsContainer.querySelectorAll('.fill').forEach((fill) => {
      fill.style.width = '0';
      requestAnimationFrame(() => {
        fill.style.width = `${fill.dataset.width}%`;
      });
    });
  }
}
