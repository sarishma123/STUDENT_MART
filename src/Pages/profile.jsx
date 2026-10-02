import { KeyRound, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage({
  currentUser,
  onLogout,
  onGoToDashboard,
  onChangePassword,
  userProductCount = 0,
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const result = await onChangePassword(currentPassword, newPassword);
    if (!result.success) {
      setPasswordError(result.error || 'Could not change password.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage(result.message || 'Password changed successfully.');
  };

  return (
    <div className="page page--medium">
      <h1 className="section-title">👤 My Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">👤</div>
        <h2 className="profile-name">{currentUser?.name}</h2>
        <p className="profile-mail muted mb-sm">{currentUser?.email}</p>
        <p className="profile-meta">
          Member since {currentUser?.joinDate}
        </p>
        <p className="profile-meta mt-sm">
          Active listings: {userProductCount}
        </p>

        <button onClick={onGoToDashboard} className="btn btn-secondary mt-lg">
          <LayoutDashboard size={16} />
          Open Dashboard
        </button>
      </div>

      <div className="profile-card profile-card--left mt-lg">
        <h3 className="profile-section-title">⚙️ Account Settings</h3>

        <button
          type="button"
          className="profile-setting"
          onClick={() => {
            setShowPasswordForm(!showPasswordForm);
            setPasswordError('');
            setPasswordMessage('');
          }}
        >
          <KeyRound size={16} />
          Change Password
        </button>

        {showPasswordForm && (
          <form className="profile-password-form" onSubmit={handlePasswordChange}>
            <label className="field-group">
              Current Password
              <input type="password" className="field" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" />
            </label>
            <label className="field-group">
              New Password
              <input type="password" className="field" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={6} autoComplete="new-password" />
            </label>
            <label className="field-group">
              Confirm New Password
              <input type="password" className="field" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={6} autoComplete="new-password" />
            </label>
            {passwordError && <p className="auth-error">{passwordError}</p>}
            {passwordMessage && <p className="auth-success">{passwordMessage}</p>}
            <button type="submit" className="btn btn-primary btn-block">Update Password</button>
          </form>
        )}
        <button className="profile-setting mb-md">
           Help & Support
        </button>

        <button onClick={onLogout} className="btn btn-danger btn-block">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
