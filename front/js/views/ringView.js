/**
 * View: RingView
 * Renderiza o anel gráfico do ciclo menstrual e textos do centro.
 */
export class RingView {
  constructor() {
    this.svg = document.getElementById('ring');
    this.bigText = document.getElementById('ringBig');
    this.subText = document.getElementById('ringSub');
    this.label = document.querySelector('.ring-center .label');
  }

  _polarToCartesian(cx, cy, r, deg) {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  _arcPath(r, fromDeg, toDeg) {
    const [x1, y1] = this._polarToCartesian(130, 130, r, fromDeg);
    const [x2, y2] = this._polarToCartesian(130, 130, r, toDeg);
    return `M${x1} ${y1} A${r} ${r} 0 ${toDeg - fromDeg > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  }

  render(cycleInfo) {
    if (!this.svg) return;

    const r = 112;
    const per = 360 / cycleInfo.cycleLength;
    const gap = 5;

    const phases = [
      [1, cycleInfo.periodLength, 'var(--c-period)'],
      [cycleInfo.periodLength + 1, cycleInfo.fertileRange[0] - 1, 'var(--c-follicular)'],
      [cycleInfo.fertileRange[0], cycleInfo.fertileRange[1], 'var(--c-fertile)'],
      [cycleInfo.fertileRange[1] + 1, cycleInfo.cycleLength, 'var(--c-luteal)']
    ];

    let html = `<circle cx="130" cy="130" r="${r}" fill="none" stroke="var(--line)" stroke-width="16"/>`;
    phases.forEach(([start, end, color]) => {
      const fromAngle = (start - 1) * per + gap / 2;
      const toAngle = end * per - gap / 2;
      html += `<path class="arc" stroke="${color}" d="${this._arcPath(r, fromAngle, toAngle)}"/>`;
    });

    const [mx, my] = this._polarToCartesian(130, 130, r, (cycleInfo.todayCycleDay - 0.5) * per);
    html += `
      <circle class="marker-pulse" cx="${mx}" cy="${my}" r="12"/>
      <circle class="marker" cx="${mx}" cy="${my}" r="11"/>
    `;

    this.svg.innerHTML = html;

    if (this.label) this.label.textContent = cycleInfo.phase;
    if (this.bigText) this.bigText.textContent = `${cycleInfo.todayCycleDay}º dia`;
    if (this.subText) this.subText.textContent = `Próximo período em ${cycleInfo.daysRemaining} dias`;
  }
}
