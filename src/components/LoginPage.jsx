import { useState } from 'react';
import { useSupabaseActions } from '../context/GameContext';
import { LogIn, UserPlus, Sparkles, AlertCircle, Loader } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp, enableDemo } = useSupabaseActions();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await signUp(email, password, name || 'Adventurer');
        setSignUpSuccess(true);
      } else {
        await signIn(email, password);
        // Auth state listener in GameContext will handle the rest
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (signUpSuccess) {
    return (
      <div className="login-page">
        <div className="login-decorations">
          <div className="login-petal lp-1" />
          <div className="login-petal lp-2" />
          <div className="login-petal lp-3" />
        </div>
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">📧</div>
            <h1 className="login-title">Check Your Email!</h1>
            <p className="login-subtitle" style={{ marginTop: 12 }}>
              We've sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in!
            </p>
          </div>
          <button
            className="btn btn-pink btn-lg w-full"
            onClick={() => { setSignUpSuccess(false); setIsSignUp(false); }}
          >
            <LogIn size={18} /> Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-decorations">
        <div className="login-petal lp-1" />
        <div className="login-petal lp-2" />
        <div className="login-petal lp-3" />
        <div className="login-petal lp-4" />
        <div className="login-petal lp-5" />
        <div className="login-petal lp-6" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🌸</div>
          <h1 className="login-title">PACT</h1>
          <p className="login-subtitle">
            {isSignUp ? 'Create your account & join the adventure' : 'Welcome back, adventurer!'}
          </p>
        </div>

        {error && (
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
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="login-field">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="Your adventurer name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="login-input"
                id="login-name"
              />
            </div>
          )}

          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
              id="login-email"
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
              id="login-password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-pink btn-lg w-full login-submit"
            id="login-btn"
            disabled={loading}
          >
            {loading ? (
              <><Loader size={18} className="spin-icon" /> {isSignUp ? 'Creating...' : 'Signing in...'}</>
            ) : (
              isSignUp ? <><UserPlus size={18} /> Create Account</> : <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        <div className="login-switch">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="login-switch-btn">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className="login-demo">
          <button
            onClick={() => enableDemo('Alex Rivera')}
            className="btn btn-outline btn-sm"
            id="login-demo-btn"
          >
            <Sparkles size={14} /> Continue as Demo
          </button>
        </div>
      </div>
    </div>
  );
}
