/**
 * View: NavigationView
 * Gerencia a navegação entre as telas do app mobile.
 */
export class NavigationView {
  constructor() {
    this.nav = document.getElementById('nav');
    this.screens = Array.from(document.querySelectorAll('.screen'));
    this.navButtons = Array.from(document.querySelectorAll('#nav button[data-tab]'));
    this.chips = document.getElementById('chips');

    this._setupChips();
  }

  _setupChips() {
    if (this.chips) {
      this.chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        this.chips.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === chip));
      });
    }
  }

  bindTabChange(handler) {
    if (this.nav) {
      this.nav.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-tab]');
        if (btn) {
          const tabName = btn.dataset.tab;
          this.setActiveTab(tabName);
          handler(tabName);
        }
      });
    }
  }

  setActiveTab(tabName) {
    this.screens.forEach(s => {
      s.classList.toggle('active', s.id === `screen-${tabName}`);
    });

    this.navButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
  }
}
