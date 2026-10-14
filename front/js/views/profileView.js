/**
 * View: ProfileView
 * Controla os elementos da tela de perfil, informações do usuário e tema.
 */
export class ProfileView {
  constructor() {
    this.themeSwitch = document.getElementById('themeSwitch');
    this.topAvatar = document.getElementById('topAvatar');
    this.userGreeting = document.getElementById('userGreeting');
    this.profileAvatar = document.getElementById('profileAvatar');
    this.profileName = document.getElementById('profileName');
    this.profileHandle = document.getElementById('profileHandle');
    this.restartOnboardingBtn = document.getElementById('btnRestartOnboarding');
  }

  renderUserProfile(profile) {
    if (this.userGreeting) {
      this.userGreeting.textContent = `Olá, ${profile.name} 🌸`;
    }
    if (this.topAvatar) {
      this.topAvatar.textContent = profile.initials || 'AJ';
    }
    if (this.profileAvatar) {
      this.profileAvatar.textContent = profile.initials || 'AJ';
    }
    if (this.profileName) {
      this.profileName.textContent = profile.name;
    }
    if (this.profileHandle) {
      this.profileHandle.textContent = profile.handle;
    }
  }

  bindThemeToggle(handler) {
    if (!this.themeSwitch) return;
    this.themeSwitch.addEventListener('click', () => {
      const isDark = !this.themeSwitch.classList.contains('on');
      handler(isDark ? 'dark' : 'light');
    });
  }

  applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    if (this.themeSwitch) {
      this.themeSwitch.classList.toggle('on', isDark);
      this.themeSwitch.setAttribute('aria-checked', String(isDark));
    }
  }

  bindRestartOnboarding(handler) {
    if (this.restartOnboardingBtn) {
      this.restartOnboardingBtn.addEventListener('click', () => handler());
    }
  }

  bindSoonButtons(handler) {
    document.querySelectorAll('[data-soon]').forEach((btn) => {
      btn.addEventListener('click', () => {
        handler(btn.dataset.soon);
      });
    });
  }
}
