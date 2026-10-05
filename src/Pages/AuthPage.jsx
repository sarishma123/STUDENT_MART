import { useState } from 'react';
import { ArrowLeft, KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';
import { isStrongPassword, PASSWORD_REQUIREMENTS } from '../passwordPolicy';

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>&"']/g, (char) => {
    const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' };
    return map[char];
  });
}

export default function AuthPage({
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  initialMode = 'login',
  resetToken = '',
}) {
  const [mode, setMode] = useState(initialMode);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState('');

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

    if (!isStrongPassword(password)) {
      setRegError(PASSWORD_REQUIREMENTS);
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

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    const email = sanitizeInput(forgotEmail.trim());
    if (!validateEmail(email)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    const result = await onForgotPassword(email);
    if (result.success) {
      setForgotMessage(result.message);
    } else {
      setForgotError(result.error || 'Could not send reset email.');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');

    const password = sanitizeInput(resetPassword);
    const confirm = sanitizeInput(resetConfirm);
    if (!isStrongPassword(password)) {
      setResetError(PASSWORD_REQUIREMENTS);
      return;
    }
    if (password !== confirm) {
      setResetError('Passwords do not match.');
      return;
    }

    const result = await onResetPassword(resetToken, password);
    if (result.success) {
      setLoginError(result.message || 'Password updated. You can now sign in.');
      setMode('login');
      setResetPassword('');
      setResetConfirm('');
    } else {
      setResetError(result.error || 'Could not reset your password.');
    }
  };

  const switchToLogin = () => {
    setMode('login');
    setLoginError('');
    setForgotError('');
    setForgotMessage('');
  };

  const switchToRegister = () => {
    setMode('register');
    setRegError('');
  };

  const switchToForgot = () => {
    setMode('forgot');
    setForgotError('');
    setForgotMessage('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {mode === 'login' && '👋 Welcome Back!'}
          {mode === 'register' && '✨ Join Campus Community'}
          {mode === 'forgot' && 'Reset Your Password'}
          {mode === 'reset' && 'Choose a New Password'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to find affordable study materials'
            : mode === 'register'
              ? 'Share and sell your old notes, books, and study materials'
              : 'Keep your StudentMart account secure'}
        </p>

        {mode !== 'forgot' && mode !== 'reset' && <div className="auth-tabs">
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
        </div>}

        {mode !== 'forgot' && mode !== 'reset' && <div className="auth-slider">
          <div className="auth-slider__inner" style={{ transform: mode === 'register' ? 'translateX(-50%)' : 'translateX(0)' }}>
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

              {mode === 'login' && <button type="button" className="auth-link" onClick={switchToForgot}>
                Forgot your password?
              </button>}

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
                  placeholder="9+ chars, upper/lowercase, number, symbol"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="field"
                  required
                  minLength={9}
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
                  minLength={9}
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
        </div>}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="auth-form auth-form--standalone">
            <p className="auth-helper">Enter your email and we will send you a one-hour password reset link.</p>
            <label className="field-group">
              Email
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="field" required autoComplete="email" />
            </label>
            {forgotError && <p className="auth-error">{forgotError}</p>}
            {forgotMessage && <p className="auth-success">{forgotMessage}</p>}
            <button type="submit" className="btn btn-primary btn-block"><Mail size={18} /> Send Reset Link</button>
            <button type="button" className="auth-link" onClick={switchToLogin}><ArrowLeft size={15} /> Back to sign in</button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset} className="auth-form auth-form--standalone">
            <p className="auth-helper">Choose a new password for your StudentMart account.</p>
            <label className="field-group">
              New Password
              <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="field" required minLength={9} autoComplete="new-password" />
            </label>
            <label className="field-group">
              Confirm Password
              <input type="password" value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} className="field" required minLength={9} autoComplete="new-password" />
            </label>
            {resetError && <p className="auth-error">{resetError}</p>}
            <button type="submit" className="btn btn-primary btn-block"><KeyRound size={18} /> Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
