/**
 * View: NavigationView
 * Gerencia a navegação entre telas, tanto via botões do bottom nav quanto via gestos de toque (touch swipe) na tela.
 */
export class NavigationView {
  constructor() {
    this.nav = document.getElementById('nav');
    this.screensContainer = document.querySelector('.screens');
    this.screens = Array.from(document.querySelectorAll('.screen'));
    this.navButtons = Array.from(document.querySelectorAll('#nav button[data-tab]'));
    this.chips = document.getElementById('chips');

    this.tabOrder = ['today', 'calendar', 'insights', 'learn', 'profile'];
    this.activeTabIndex = 0;

    this._setupChips();
    this._setupTouchSwipe();
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

  /**
   * Navegação tátil por gestos de arrasto (Swipe) nativos para iPhone
   */
  _setupTouchSwipe() {
    if (!this.screensContainer) return;

    let startX = 0;
    let startY = 0;
    let isHorizontalSwipe = false;

    this.screensContainer.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isHorizontalSwipe = false;
    }, { passive: true });

    this.screensContainer.addEventListener('touchmove', (e) => {
      if (!e.touches.length) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;

      // Se o movimento for predominantemente horizontal e maior que 15px
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 15) {
        isHorizontalSwipe = true;
      }
    }, { passive: true });

    this.screensContainer.addEventListener('touchend', (e) => {
      if (!isHorizontalSwipe) return;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - startX;

      // Limiar de swipe: pelo menos 50px de deslocamento
      if (Math.abs(diffX) > 50) {
        if (diffX < 0) {
          // Swipe para esquerda -> Próxima aba
          this.nextTab();
        } else {
          // Swipe para direita -> Aba anterior
          this.prevTab();
        }
      }
    }, { passive: true });
  }

  nextTab() {
    if (this.activeTabIndex < this.tabOrder.length - 1) {
      const nextTabName = this.tabOrder[this.activeTabIndex + 1];
      this.setActiveTab(nextTabName);
      if (this._onTabChange) this._onTabChange(nextTabName);
    }
  }

  prevTab() {
    if (this.activeTabIndex > 0) {
      const prevTabName = this.tabOrder[this.activeTabIndex - 1];
      this.setActiveTab(prevTabName);
      if (this._onTabChange) this._onTabChange(prevTabName);
    }
  }

  bindTabChange(handler) {
    this._onTabChange = handler;

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
    const newIndex = this.tabOrder.indexOf(tabName);
    if (newIndex !== -1) {
      this.activeTabIndex = newIndex;
    }

    this.screens.forEach(s => {
      s.classList.toggle('active', s.id === `screen-${tabName}`);
    });

    this.navButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
  }
}
