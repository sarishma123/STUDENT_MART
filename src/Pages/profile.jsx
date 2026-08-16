import { LayoutDashboard, LogOut } from 'lucide-react';

export default function ProfilePage({
  currentUser,
  onLogout,
  onGoToDashboard,
  userProductCount = 0,
}) {
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

        <button className="profile-setting"> Change Password</button>
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
