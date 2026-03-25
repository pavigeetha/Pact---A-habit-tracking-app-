import { useTheme } from '../context/ThemeContext';
import { useGameState, useSupabaseActions } from '../context/GameContext';
import { Settings as SettingsIcon, Palette, LogOut, User, ArrowLeft } from 'lucide-react';

export default function SettingsPage({ onBack }) {
  const { themeId, setTheme, THEMES } = useTheme();
  const { signOut } = useSupabaseActions();
  const { group, profile } = useGameState();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="settings-page">
      <button className="btn btn-outline btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="settings-header">
        <SettingsIcon size={24} style={{ color: 'var(--accent-pink)' }} />
        <h2>Settings</h2>
      </div>

      {/* Theme Picker */}
      <div className="card settings-section">
        <div className="section-title">
          <Palette size={14} />
          THEME
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Choose your adventure aesthetic
        </p>

        <div className="theme-picker-grid">
          {Object.values(THEMES).map(t => (
            <button
              key={t.id}
              className={`theme-option ${themeId === t.id ? 'selected' : ''}`}
              onClick={() => setTheme(t.id)}
              id={`theme-${t.id}`}
            >
              <div className="theme-option-preview" data-theme-preview={t.id}>
                <span className="theme-option-emoji">{t.emoji}</span>
              </div>
              <div className="theme-option-info">
                <span className="theme-option-name">{t.name}</span>
                <span className="theme-option-desc">{t.description}</span>
              </div>
              {themeId === t.id && (
                <div className="theme-option-active">Active</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Info */}
      <div className="card settings-section">
        <div className="section-title">
          <User size={14} />
          ACCOUNT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Name:</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {profile?.display_name || 'Adventurer'}
            </span>
          </div>
          {group && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Group:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{group.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invite Code:</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  letterSpacing: '0.15em',
                  color: 'var(--accent-pink)',
                  background: 'rgba(244, 114, 182, 0.1)',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                }}>
                  {group.invite_code}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="card settings-section">
        <button
          className="btn btn-red btn-lg"
          onClick={handleLogout}
          id="btn-logout"
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </div>
  );
}
