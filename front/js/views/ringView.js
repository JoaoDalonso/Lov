/**
 * View: RingView
 * Desenha o anel do ciclo (SVG) e os textos centrais.
 */
const SVG_SIZE = 260;
const CENTER = SVG_SIZE / 2;
const RADIUS = 112;
const GAP_DEGREES = 5;

const polarToCartesian = (radius, degrees) => {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
};

const describeArc = (radius, fromDegrees, toDegrees) => {
  const [x1, y1] = polarToCartesian(radius, fromDegrees);
  const [x2, y2] = polarToCartesian(radius, toDegrees);
  const largeArc = toDegrees - fromDegrees > 180 ? 1 : 0;
  return `M${x1} ${y1} A${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
};

const pluralizeDays = (count) => `${count} ${count === 1 ? 'dia' : 'dias'}`;

export class RingView {
  constructor() {
    this.svg = document.getElementById('ring');
    this.phaseLabel = document.getElementById('ringPhase');
    this.dayLabel = document.getElementById('ringBig');
    this.subLabel = document.getElementById('ringSub');
  }

  render(info) {
    this.svg.innerHTML = this._buildSvg(info);
    this.phaseLabel.textContent = info.phaseLabel;
    this.dayLabel.textContent = `${info.todayCycleDay}º dia`;
    this.subLabel.textContent = `Próximo período em ${pluralizeDays(info.daysUntilNextPeriod)}`;
  }

  _buildSvg(info) {
    const degreesPerDay = 360 / info.cycleLength;
    const [fertileStart, fertileEnd] = info.fertileRange;

    // [primeiro dia, último dia, cor] — fases vazias são ignoradas
    const phases = [
      [1, info.periodLength, 'var(--c-period)'],
      [info.periodLength + 1, fertileStart - 1, 'var(--c-follicular)'],
      [fertileStart, fertileEnd, 'var(--c-fertile)'],
      [fertileEnd + 1, info.cycleLength, 'var(--c-luteal)']
    ];

    const arcs = phases
      .filter(([firstDay, lastDay]) => lastDay >= firstDay)
      .map(([firstDay, lastDay, color]) => {
        const from = (firstDay - 1) * degreesPerDay + GAP_DEGREES / 2;
        const to = lastDay * degreesPerDay - GAP_DEGREES / 2;
        return to > from ? `<path class="arc" stroke="${color}" d="${describeArc(RADIUS, from, to)}"/>` : '';
      })
      .join('');

    const [markerX, markerY] = polarToCartesian(RADIUS, (info.todayCycleDay - 0.5) * degreesPerDay);

    return `
      <circle class="track" cx="${CENTER}" cy="${CENTER}" r="${RADIUS}"/>
      ${arcs}
      <circle class="marker-pulse" cx="${markerX}" cy="${markerY}" r="12"/>
      <circle class="marker" cx="${markerX}" cy="${markerY}" r="11"/>`;
  }
}
