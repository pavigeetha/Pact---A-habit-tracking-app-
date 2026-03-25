import { useState } from 'react';
import { useSupabaseActions, useToast } from '../context/GameContext';
import { Users, Plus, KeyRound, Copy, Check, ArrowRight, Loader, AlertCircle } from 'lucide-react';

export default function GroupSetup() {
  const { createGroup, joinGroup } = useSupabaseActions();
  const addToast = useToast();
  const [mode, setMode] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [created, setCreated] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const group = await createGroup(groupName || 'My Pact');
      setNewCode(group.invite_code);
      setCreated(true);
      addToast('🏰 Group created!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (joinCode.trim().length < 4) return;
    setError('');
    setLoading(true);
    try {
      await joinGroup(joinCode.trim().toUpperCase());
      addToast('🎉 Joined the group!', 'success');
    } catch (err) {
      setError(err.message || 'Invalid code or failed to join.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(newCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ErrorBanner = () => error ? (
    <div style={{
      background: 'rgba(252, 165, 165, 0.15)',
      border: '1px solid rgba(248, 113, 113, 0.3)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      marginBottom: 16,
      fontSize: '0.85rem',
      color: 'var(--accent-red-deep)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <AlertCircle size={16} />
      {error}
    </div>
  ) : null;

  if (created) {
    return (
      <div className="group-setup-page">
        <div className="group-setup-card">
          <div className="group-created-icon">🎉</div>
          <h2 className="group-setup-title">Pact Created!</h2>
          <p className="group-setup-subtitle">Share this code with friends to join your group:</p>
          <div className="group-code-display">
            <span className="group-code-text">{newCode}</span>
            <button className="btn btn-sm btn-outline" onClick={handleCopy}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>
            Your friends can enter this code in "Join a Pact" to team up!
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="group-setup-page">
        <div className="group-setup-card">
          <div className="group-setup-icon">🏰</div>
          <h2 className="group-setup-title">Create a Pact</h2>
          <p className="group-setup-subtitle">Name your group and invite friends with a code.</p>
          <ErrorBanner />
          <form onSubmit={handleCreate} className="group-form">
            <div className="login-field">
              <label>Group Name</label>
              <input
                type="text"
                className="login-input"
                placeholder="e.g. Iron Wolves"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                id="group-name-input"
              />
            </div>
            <button type="submit" className="btn btn-pink btn-lg w-full" id="group-create-btn" disabled={loading}>
              {loading ? <><Loader size={18} className="spin-icon" /> Creating...</> : <><Plus size={18} /> Create Group</>}
            </button>
          </form>
          <button className="login-switch-btn" onClick={() => { setMode(null); setError(''); }} style={{ marginTop: 12 }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="group-setup-page">
        <div className="group-setup-card">
          <div className="group-setup-icon">🔑</div>
          <h2 className="group-setup-title">Join a Pact</h2>
          <p className="group-setup-subtitle">Enter the code shared by your friend.</p>
          <ErrorBanner />
          <form onSubmit={handleJoin} className="group-form">
            <div className="login-field">
              <label>Group Code</label>
              <input
                type="text"
                className="login-input group-code-input"
                placeholder="e.g. WOLF42"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                id="group-join-input"
              />
            </div>
            <button
              type="submit"
              className="btn btn-pink btn-lg w-full"
              disabled={joinCode.trim().length < 4 || loading}
              id="group-join-btn"
            >
              {loading ? <><Loader size={18} className="spin-icon" /> Joining...</> : <><KeyRound size={18} /> Join Group</>}
            </button>
          </form>
          <button className="login-switch-btn" onClick={() => { setMode(null); setError(''); }} style={{ marginTop: 12 }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-setup-page">
      <div className="group-setup-card">
        <div className="login-logo">🌸</div>
        <h2 className="group-setup-title">Get Started</h2>
        <p className="group-setup-subtitle">Create a new Pact or join an existing one.</p>
        <div className="group-options">
          <button className="group-option-card" onClick={() => setMode('create')} id="group-create-option">
            <div className="group-option-icon" style={{ background: 'rgba(244, 114, 182, 0.15)' }}>
              <Plus size={24} style={{ color: 'var(--accent-pink)' }} />
            </div>
            <h3>Create a Pact</h3>
            <p>Start a new group and invite friends with a code</p>
          </button>
          <button className="group-option-card" onClick={() => setMode('join')} id="group-join-option">
            <div className="group-option-icon" style={{ background: 'rgba(167, 139, 250, 0.15)' }}>
              <Users size={24} style={{ color: 'var(--accent-purple)' }} />
            </div>
            <h3>Join a Pact</h3>
            <p>Enter a code to join your friend's group</p>
          </button>
        </div>
      </div>
    </div>
  );
}
