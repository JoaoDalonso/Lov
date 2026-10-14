/**
 * View: NavigationView
 * Gerencia a navegação entre as telas do app Lov, tanto pelo Bottom Navigation
 * quanto por gestos de swipe (arrasto lateral) otimizados para iOS Safari.
 */
export class NavigationView {
  constructor() {
    this.nav = document.getElementById('nav');
    this.screensContainer = document.querySelector('.screens');
    this.screens = Array.from(document.querySelectorAll('.screen'));
    this.navButtons = Array.from(document.querySelectorAll('#nav button[data-tab]'));

    this.tabOrder = ['today', 'calendar', 'insights', 'learn', 'profile'];
    this.activeTabIndex = 0;
    this._onTabChange = null;

    this._setupTabClicks();
    this._setupTabTargetLinks();
    this._setupTouchSwipe();
    this._setupDragToScroll();
  }

  _setupTabClicks() {
    if (!this.nav) return;
    this.nav.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      const tabName = btn.dataset.tab;
      this.setActiveTab(tabName);
      if (this._onTabChange) this._onTabChange(tabName);
    });
  }

  _setupTabTargetLinks() {
    // Permite que qualquer elemento com data-tab-target (como o avatar do topo) navegue para a aba
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-tab-target]');
      if (!trigger) return;
      const targetTab = trigger.dataset.tabTarget;
      if (this.tabOrder.includes(targetTab)) {
        this.setActiveTab(targetTab);
        if (this._onTabChange) this._onTabChange(targetTab);
      }
    });
  }

  /**
   * Navegação tátil por gestos de arrasto (Swipe)
   * Ignora toques em componentes com scroll horizontal ou overlays ativos.
   */
  _setupTouchSwipe() {
    if (!this.screensContainer) return;

    let startX = 0;
    let startY = 0;
    let isHorizontalSwipe = false;
    let shouldIgnore = false;

    this.screensContainer.addEventListener(
      'touchstart',
      (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isHorizontalSwipe = false;

        // Ignora se o toque começou em carrosséis horizontais, sliders ou modais
        const target = e.target;
        shouldIgnore = Boolean(
          target.closest('.cards-row, .chips, .sheet-cat-chips, input[type=range], .sheet, .onboarding-overlay, [data-no-swipe]')
        );
      },
      { passive: true }
    );

    this.screensContainer.addEventListener(
      'touchmove',
      (e) => {
        if (shouldIgnore || !e.touches.length) return;
        const touch = e.touches[0];
        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;

        // Se o movimento for predominantemente horizontal e relevante
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 18) {
          isHorizontalSwipe = true;
        }
      },
      { passive: true }
    );

    this.screensContainer.addEventListener(
      'touchend',
      (e) => {
        if (shouldIgnore || !isHorizontalSwipe) return;
        const touch = e.changedTouches[0];
        const diffX = touch.clientX - startX;

        // Limiar de swipe: pelo menos 55px
        if (Math.abs(diffX) > 55) {
          if (diffX < 0) {
            this.nextTab();
          } else {
            this.prevTab();
          }
        }
      },
      { passive: true }
    );
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
  }

  setActiveTab(tabName) {
    const newIndex = this.tabOrder.indexOf(tabName);
    if (newIndex !== -1) {
      this.activeTabIndex = newIndex;
    }

    this.screens.forEach((s) => {
      const isActive = s.id === `screen-${tabName}`;
      s.classList.toggle('active', isActive);
      if (isActive) {
        s.scrollTop = 0;
      }
    });

    this.navButtons.forEach((b) => {
      const isActive = b.dataset.tab === tabName;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });
  }

  /**
   * Permite arrastar com o mouse para rolar verticalmente
   * simulando a rolagem tátil de um smartphone no computador/simulador.
   */
  _setupDragToScroll() {
    this.screens.forEach((screen) => {
      let isDown = false;
      let startY = 0;
      let scrollTop = 0;
      let isDragging = false;

      screen.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDown = true;
        isDragging = false;
        startY = e.pageY - screen.offsetTop;
        scrollTop = screen.scrollTop;
      });

      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        setTimeout(() => {
          isDragging = false;
        }, 50);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const y = e.pageY - screen.offsetTop;
        const walk = y - startY;

        if (Math.abs(walk) > 5) {
          isDragging = true;
        }

        if (isDragging) {
          screen.scrollTop = scrollTop - walk;
        }
      });

      // Se estava arrastando para rolar, previne cliques indesejados ao soltar o mouse
      screen.addEventListener(
        'click',
        (e) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );
    });
  }
}
