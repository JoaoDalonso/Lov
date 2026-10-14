/**
 * View: PhaseCardsView
 * Cards "Para você, hoje" conforme a fase atual.
 */
export class PhaseCardsView {
  constructor() {
    this.container = document.getElementById('phaseCards');
  }

  render(cards) {
    this.container.innerHTML = cards
      .map(
        ({ tone, icon, title, text }) => `
          <article class="card ${tone}">
            <div class="ico" aria-hidden="true">${icon}</div>
            <h3>${title}</h3>
            <p>${text}</p>
          </article>`
      )
      .join('');
  }
}
