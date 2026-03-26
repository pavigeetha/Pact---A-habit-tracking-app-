import { useState } from 'react';
import { GameProvider, useGameState } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './components/LoginPage';
import GroupSetup from './components/GroupSetup';
import BaseHealth from './components/BaseHealth';
import AnimatedBase from './components/AnimatedBase';
import CherryBlossomPetals from './components/FloatingCharacters';
import FloatingRewards from './components/FloatingRewards';
import HabitList from './components/HabitList';
import TeamDashboard from './components/TeamDashboard';
import Leaderboard from './components/Leaderboard';
import AttackPanel from './components/AttackPanel';
import PerformanceStats from './components/PerformanceStats';
import ActivityChart from './components/ActivityChart';
import InsightsPanel from './components/InsightsPanel';
import ToastContainer from './components/ToastContainer';
import MobileNav from './components/MobileNav';
import ClubBrowser from './components/ClubBrowser';
import ClubDashboard from './components/ClubDashboard';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import { Bell, Home, Landmark, User, Settings, Loader } from 'lucide-react';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedClubId, setSelectedClubId] = useState(null);
  const { session, loading, hasGroup, profile } = useGameState();

  const handleOpenClub = (clubId) => {
    setSelectedClubId(clubId);
    setActiveView('club-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToClubs = () => {
    setActiveView('clubs');
    setSelectedClubId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="login-page">
        <CherryBlossomPetals />
        <div style={{ textAlign: 'center' }}>
          <div className="login-logo" style={{ fontSize: '4rem' }}>🌸</div>
          <Loader size={32} className="spin-icon" style={{ color: 'var(--accent-pink)', marginTop: 16 }} />
          <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Loading your adventure...</p>
        </div>
      </div>
    );
  }

  // Show login if not logged in
  if (!session) {
    return (
      <>
        <CherryBlossomPetals />
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Show group setup if no group
  if (!hasGroup) {
    return (
      <>
        <CherryBlossomPetals />
        <GroupSetup />
        <ToastContainer />
      </>
    );
  }

  const avatarInitials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : 'ME';

  return (
    <>
      <CherryBlossomPetals />
      <FloatingRewards />

      {/* Header */}
      <header className="app-header">
        <div className="flex items-center gap-16">
          <div className="app-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveView('dashboard')}>
            🌸 PACT
          </div>

          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
              id="nav-tab-dashboard"
            >
              <Home size={14} />
              Dashboard
            </button>
            <button
              className={`nav-tab ${activeView === 'clubs' || activeView === 'club-detail' ? 'active' : ''}`}
              onClick={() => setActiveView('clubs')}
              id="nav-tab-clubs"
            >
              <Landmark size={14} />
              Clubs
            </button>
            <button
              className={`nav-tab ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveView('profile')}
              id="nav-tab-profile"
            >
              <User size={14} />
              Profile
            </button>
            <button
              className={`nav-tab ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
              id="nav-tab-settings"
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
        </div>

        <div className="app-header-right">
          <button className="btn btn-outline btn-sm" id="btn-notifications">
            <Bell size={16} />
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: '#fff',
            }}
            onClick={() => setActiveView('profile')}
          >
            {avatarInitials}
          </div>
        </div>
      </header>

      {/* Views */}
      {activeView === 'dashboard' && (
        <main className="dashboard">
          <BaseHealth />
          <HabitList />
          <div className="span-3">
            <AnimatedBase />
          </div>
          <TeamDashboard />
          <Leaderboard />
          <AttackPanel />
          <PerformanceStats />
          <ActivityChart />
          <InsightsPanel />
        </main>
      )}

      {activeView === 'clubs' && (
        <ClubBrowser onOpenClub={handleOpenClub} />
      )}

      {activeView === 'club-detail' && selectedClubId && (
        <ClubDashboard clubId={selectedClubId} onBack={handleBackToClubs} />
      )}

      {activeView === 'profile' && (
        <ProfilePage onBack={() => setActiveView('dashboard')} />
      )}

      {activeView === 'settings' && (
        <SettingsPage onBack={() => setActiveView('dashboard')} />
      )}

      <ToastContainer />
      <MobileNav />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ThemeProvider>
  );
}
