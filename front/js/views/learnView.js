/**
 * View: LearnView
 * Filtro de artigos por categoria.
 */
export class LearnView {
  constructor() {
    this.chips = document.getElementById('chips');
    this.articles = Array.from(document.querySelectorAll('#articles .article'));
    this._bindFilter();
  }

  _bindFilter() {
    this.chips.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;

      this.chips.querySelectorAll('.chip').forEach((other) => {
        const isActive = other === chip;
        other.classList.toggle('on', isActive);
        other.setAttribute('aria-pressed', String(isActive));
      });
      this._filter(chip.dataset.filter);
    });
  }

  _filter(category) {
    this.articles.forEach((article) => {
      article.hidden = category !== 'all' && article.dataset.category !== category;
    });
  }
}
