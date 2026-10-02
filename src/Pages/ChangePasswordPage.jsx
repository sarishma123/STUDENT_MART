import { ArrowLeft, KeyRound } from 'lucide-react';
import { useState } from 'react';

export default function ChangePasswordPage({ onChangePassword, onBack }) {
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
    <div className="page page--narrow">
      <button type="button" className="back-link" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to profile
      </button>

      <div className="form-card change-password-card">
        <div className="change-password-icon">
          <KeyRound size={25} />
        </div>
        <h1 className="section-title section-title--center">Change Password</h1>
        <p className="muted text-center mb-lg">Use your current password to choose a new one.</p>

        <form className="profile-password-form" onSubmit={handlePasswordChange}>
          <label className="field-group">
            Current Password
            <input
              type="password"
              className="field"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <label className="field-group">
            New Password
            <input
              type="password"
              className="field"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label className="field-group">
            Confirm New Password
            <input
              type="password"
              className="field"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          {passwordError && <p className="auth-error">{passwordError}</p>}
          {passwordMessage && <p className="auth-success">{passwordMessage}</p>}
          <button type="submit" className="btn btn-primary btn-block">Update Password</button>
        </form>
      </div>
    </div>
  );
}
