import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import BaseHealth from './components/BaseHealth';
import AnimatedBase from './components/AnimatedBase';
import FloatingCharacters from './components/FloatingCharacters';
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
import { Bell, Home, Landmark, User } from 'lucide-react';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedClubId, setSelectedClubId] = useState(null);

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

  return (
    <>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="flex items-center gap-16">
          <div className="app-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveView('dashboard')}>
            ⚔️ PACT
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
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-green))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            onClick={() => setActiveView('profile')}
          >
            AR
          </div>
        </div>
      </header>

      {/* ── Views ── */}
      {activeView === 'dashboard' && (
        <>
          <FloatingCharacters />
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
        </>
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

      <ToastContainer />
      <MobileNav />
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
