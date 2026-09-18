import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarRail } from './components/domain/SidebarRail.js';
import { BottomNav } from './components/domain/BottomNav.js';
import { HomeScreen } from './pages/HomeScreen.js';
import { ProgressScreen } from './pages/ProgressScreen.js';
import { MentorChatPage } from './pages/MentorChatPage.js';
import { CalendarScreen } from './pages/CalendarScreen.js';
import { UploadPage } from './pages/UploadPage.js';
import { ProfileScreen } from './pages/ProfileScreen.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { RoadmapLibraryPage } from './pages/RoadmapLibraryPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignupPage } from './pages/SignupPage.js';
import { EscalationAlertBanner } from './components/reminders/EscalationAlertBanner.js';
import { VerificationModal } from './components/verification/VerificationModal.js';
import { RoutineReminderPopup } from './components/routines/RoutineReminderPopup.js';
import { routineReminderService } from './services/routineReminderService.js';
import { useAppStore } from './store/useAppStore.js';
import { getCurrentUser, AuthUser } from './services/authService.js';

const AppShell: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());

  useEffect(() => {
    const syncAuth = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('mentor_auth_changed', syncAuth);
    return () => window.removeEventListener('mentor_auth_changed', syncAuth);
  }, []);

  // Tier 1: Unauthenticated -> Only Login and Signup routes
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-app text-primary-text font-sans">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // Tier 2: Authenticated but Onboarding incomplete -> Fixed Onboarding sequence only
  if (!currentUser.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-app text-primary-text font-sans">
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
    );
  }

  // Tier 3: Authenticated and Onboarding completed -> Full Application
  return (
    <div className="min-h-screen bg-app dark:bg-background-dark text-primary-text dark:text-gray-100 flex font-sans transition-colors selection:bg-lavender selection:text-primary">
      {/* Left Desktop Sidebar Rail (>= 768px) */}
      <SidebarRail />

      {/* Main Application Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <EscalationAlertBanner />

        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/mentor" element={<MentorChatPage />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/library" element={<RoadmapLibraryPage />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation (< 768px) */}
        <BottomNav />
      </div>

      {/* Global Task Verification Modal */}
      <VerificationModal />

      {/* Global Routine Reminder Pop-up */}
      <RoutineReminderPopup />
    </div>
  );
};

export const App: React.FC = () => {
  const { handleReminderReceived, loadDashboard, theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    loadDashboard();
    routineReminderService.start();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/reminders/stream');

      eventSource.addEventListener('reminder', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          handleReminderReceived(payload);
          loadDashboard();
        } catch (err) {
          console.error('Error parsing reminder SSE payload:', err);
        }
      });
    } catch (err) {
      console.warn('SSE stream fallback:', err);
    }

    return () => {
      routineReminderService.stop();
      if (eventSource) eventSource.close();
    };
  }, [handleReminderReceived, loadDashboard]);

  return (
    <Router>
      <AppShell />
    </Router>
  );
};

export default App;
