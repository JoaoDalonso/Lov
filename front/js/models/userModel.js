/**
 * Model: UserModel
 * Gerencia os dados do perfil do usuário na arquitetura MVC.
 */
export class UserModel {
  constructor() {
    this.storageKey = 'lume_user_profile';
    this.profile = this._loadProfile();
  }

  _loadProfile() {
    const saved = localStorage.getItem(this.storageKey);
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
      initials: 'AJ'
    };
  }

  getProfile() {
    return { ...this.profile };
  }

  updateProfile(data) {
    this.profile = { ...this.profile, ...data };
    localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    return this.getProfile();
  }
}
