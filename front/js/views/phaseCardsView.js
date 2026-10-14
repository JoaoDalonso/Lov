/**
 * View: PhaseCardsView
 * Cards "Para você, hoje" com orientações clínicas, autocuidado, lembrete de medicação e ações diretas.
 */
export class PhaseCardsView {
  constructor() {
    this.container = document.getElementById('phaseCards');
    this._actionHandler = null;
    this._setupListeners();
  }

  _setupListeners() {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-card-action]');
      if (actionBtn && this._actionHandler) {
        e.stopPropagation();
        this._actionHandler(actionBtn.dataset.cardAction);
        return;
      }

      const card = e.target.closest('.card');
      if (card && card.dataset.defaultAction && this._actionHandler) {
        this._actionHandler(card.dataset.defaultAction);
      }
    });
  }

  bindCardAction(handler) {
    this._actionHandler = handler;
  }

  render(cards) {
    if (!this.container) return;

    this.container.innerHTML = cards
      .map(({ tone, tag, icon, title, text, action }) => {
        const tagHtml = tag ? `<span class="card-badge">${tag}</span>` : '';
        const actionHtml = action
          ? `<button class="card-action-btn" data-card-action="${action.type}" type="button">${action.label}</button>`
          : '';
        const defaultActionAttr = action ? `data-default-action="${action.type}"` : '';

        return `
          <article class="card ${tone || 'rose'}" ${defaultActionAttr}>
            <div class="card-top">
              <div class="ico" aria-hidden="true">${icon}</div>
              ${tagHtml}
            </div>
            <h3>${title}</h3>
            <p>${text}</p>
            ${actionHtml}
          </article>`;
      })
      .join('');
  }
}
