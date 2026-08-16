import { LogIn, LogOut, Plus } from 'lucide-react';

export default function Header({
  currentUser,
  setCurrentPage,
  handleLogout,
  onLoginClick,
  onBuySellClick,
  isLoggedIn,
}) {
  return (
    <header className="site-header">
      <button className="site-brand" type="button" onClick={() => setCurrentPage('home')}>
        <span className="site-brand__mark">🎓</span>
        <span className="site-brand__name">On-Campus Mart</span>
      </button>

      <nav className="site-nav">
        <button onClick={() => setCurrentPage('home')} className="site-nav__link">
          Home
        </button>
        <button onClick={() => setCurrentPage('browse')} className="site-nav__link">
          Browse
        </button>
        <button onClick={onBuySellClick} className="site-nav__link">
          Buy/Sell
        </button>
        {isLoggedIn && (
          <>
            <button onClick={() => setCurrentPage('dashboard')} className="site-nav__link">
              Dashboard
            </button>
            <button onClick={() => setCurrentPage('profile')} className="site-nav__link">
              {currentUser?.name || 'Profile'}
            </button>
          </>
        )}
      </nav>

      <div className="site-header__actions">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => setCurrentPage('add-product')}
              className="site-nav__cta"
            >
              <Plus size={16} /> Post item
            </button>

            <button onClick={handleLogout} className="site-nav__icon-button" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className="site-nav__cta">
            <LogIn size={16} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
