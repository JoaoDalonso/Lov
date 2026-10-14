/**
 * Ponto de entrada (Main Entry Point)
 * Inicialização da arquitetura MVC do Lov com Clean Code.
 */
import { CycleModel } from './models/cycleModel.js';
import { UserModel } from './models/userModel.js';
import { RingView } from './views/ringView.js';
import { WeekView } from './views/weekView.js';
import { PhaseCardsView } from './views/phaseCardsView.js';
import { CalendarView } from './views/calendarView.js';
import { InsightsView } from './views/insightsView.js';
import { LearnView } from './views/learnView.js';
import { LogSheetView } from './views/logSheetView.js';
import { NavigationView } from './views/navigationView.js';
import { ProfileView } from './views/profileView.js';
import { OnboardingView } from './views/onboardingView.js';
import { ToastView } from './views/toastView.js';
import { AppController } from './controllers/appController.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Models
  const models = {
    cycle: new CycleModel(),
    user: new UserModel()
  };

  // 2. Views
  const views = {
    ring: new RingView(),
    week: new WeekView(),
    phaseCards: new PhaseCardsView(),
    calendar: new CalendarView(),
    insights: new InsightsView(),
    learn: new LearnView(),
    logSheet: new LogSheetView(),
    navigation: new NavigationView(),
    profile: new ProfileView(),
    onboarding: new OnboardingView(),
    toast: new ToastView()
  };

  // 3. Controller
  const controller = new AppController(models, views);
  controller.init();
});
