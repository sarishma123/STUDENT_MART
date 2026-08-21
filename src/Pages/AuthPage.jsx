import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>&"']/g, (char) => {
    const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' };
    return map[char];
  });
}

export default function AuthPage({ onLogin, onRegister, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const email = sanitizeInput(loginEmail.trim());
    const password = sanitizeInput(loginPassword);

    if (!email || !password) {
      setLoginError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    const result = await onLogin(email, password);
    if (!result.success) {
      setLoginError(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    const name = sanitizeInput(regName.trim());
    const email = sanitizeInput(regEmail.trim());
    const password = sanitizeInput(regPassword);
    const confirm = sanitizeInput(regConfirm);

    if (!name || !email || !password || !confirm) {
      setRegError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (name.length < 2) {
      setRegError('Name must be at least 2 characters.');
      return;
    }

    if (password.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      setRegError('Passwords do not match.');
      return;
    }

    const result = await onRegister(name, email, password);
    if (!result.success) {
      setRegError(result.error || 'Registration failed');
    }
  };

  const switchToLogin = () => {
    setMode('login');
    setLoginError('');
  };

  const switchToRegister = () => {
    setMode('register');
    setRegError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {mode === 'login' ? '👋 Welcome Back!' : '✨ Join Campus Community'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to find affordable study materials'
            : 'Share and sell your old notes, books, and study materials'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={switchToLogin}
          >
            <LogIn size={16} />
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
            onClick={switchToRegister}
          >
            <UserPlus size={16} />
            Create Account
          </button>
          <div className="auth-tab-indicator" style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(100%)' }} />
        </div>

        <div className="auth-slider">
          <div className="auth-slider__inner" style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(-50%)' }}>
            <form onSubmit={handleLogin} className="auth-form">
              <label className="field-group">
                Email
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="field"
                  required
                  autoComplete="off"
                />
              </label>

              <label className="field-group">
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="field"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              {loginError && <p className="auth-error">{loginError}</p>}

              <button type="submit" className="btn btn-primary btn-block">
                <LogIn size={18} />
                Sign In
              </button>
            </form>

            <form onSubmit={handleRegister} className="auth-form">
              <label className="field-group">
                Full Name
                <input
                  type="text"
                  placeholder="Your name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="field"
                  required
                  minLength={2}
                  autoComplete="off"
                />
              </label>

              <label className="field-group">
                Email
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="field"
                  required
                  autoComplete="off"
                />
              </label>

              <label className="field-group">
                Password
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="field"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              <label className="field-group">
                Confirm Password
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  className="field"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              {regError && <p className="auth-error">{regError}</p>}

              <button type="submit" className="btn btn-primary btn-block">
                <UserPlus size={18} />
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
