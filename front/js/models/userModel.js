/**
 * Model: UserModel
 * Perfil do usuário, condições de saúde e preferências de rotina.
 */
import { readJson, writeJson } from '../utils/storage.js';

const STORAGE_KEY = 'lov_user_profile';
const DEFAULT_NAME = 'Ana Julia';

const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const buildInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export class UserModel {
  constructor() {
    this.profile = readJson(STORAGE_KEY, null) || this._buildDefaultProfile();
  }

  _buildDefaultProfile() {
    return {
      name: DEFAULT_NAME,
      handle: `@${slugify(DEFAULT_NAME)}`,
      initials: buildInitials(DEFAULT_NAME),
      email: '',
      goal: 'track',
      remindersEnabled: true,
      healthConditions: [],
      routineMedications: [],
      isAuthenticated: false,
      isFirstAccess: true
    };
  }

  getProfile() {
    return {
      healthConditions: [],
      routineMedications: [],
      ...this.profile
    };
  }

  isFirstAccess() {
    return Boolean(this.profile.isFirstAccess);
  }

  updateProfile(data) {
    this.profile = { ...this.profile, ...data };
    writeJson(STORAGE_KEY, this.profile);
    return this.getProfile();
  }

  completeOnboarding({ name, goal, remindersEnabled }) {
    const cleanName = name?.trim() || DEFAULT_NAME;
    return this.updateProfile({
      name: cleanName,
      handle: `@${slugify(cleanName) || 'lov'}`,
      initials: buildInitials(cleanName) || 'AJ',
      goal: goal || 'track',
      remindersEnabled: remindersEnabled ?? true,
      isFirstAccess: false
    });
  }
}
