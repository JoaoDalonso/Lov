/**
 * Model: UserModel
 * Gerencia os dados do perfil do usuário e status de primeiro acesso/onboarding no padrão MVC.
 */
export class UserModel {
  constructor() {
    this.storageKey = 'lov_user_profile';
    this.profile = this._loadProfile();
  }

  _loadProfile() {
    const saved = localStorage.getItem(this.storageKey) || localStorage.getItem('lume_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler perfil do localStorage:', e);
      }
    }
    return {
      name: 'Ana Julia',
      handle: '@anajulia',
      initials: 'AJ',
      email: '',
      goal: 'track', // 'track' | 'pregnancy' | 'prevent' | 'body'
      remindersEnabled: true,
      isAuthenticated: false,
      isFirstAccess: true
    };
  }

  getProfile() {
    return { ...this.profile };
  }

  isFirstAccess() {
    return !!this.profile.isFirstAccess;
  }

  updateProfile(data) {
    this.profile = { ...this.profile, ...data };
    this._save();
    return this.getProfile();
  }

  completeOnboarding({ name, email, goal, remindersEnabled, isAuthenticated = false }) {
    const cleanName = (name && name.trim()) || 'Ana Julia';
    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || 'AJ';

    const handle = `@${cleanName.toLowerCase().replace(/\s+/g, '')}`;

    this.profile = {
      ...this.profile,
      name: cleanName,
      handle,
      initials,
      email: email || '',
      goal: goal || 'track',
      remindersEnabled: remindersEnabled !== undefined ? remindersEnabled : true,
      isAuthenticated,
      isFirstAccess: false
    };

    this._save();
    return this.getProfile();
  }

  resetOnboarding() {
    this.profile.isFirstAccess = true;
    this._save();
    return this.getProfile();
  }

  _save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
  }
}
