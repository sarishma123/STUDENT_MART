import { LogIn, LogOut, Menu, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function Header({
  currentUser,
  setCurrentPage,
  handleLogout,
  onLoginClick,
  onBuySellClick,
  isLoggedIn,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const goTo = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <button className="site-brand" type="button" onClick={() => setCurrentPage('home')}>
        <span className="site-brand__name">Student Mart</span>
      </button>

      <button type="button" className="site-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle menu">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={`site-nav ${menuOpen ? 'site-nav--open' : ''}`}>
        <button onClick={() => goTo('home')} className="site-nav__link">
          Home
        </button>
        <button onClick={() => goTo('browse')} className="site-nav__link">
          Browse
        </button>
        <button onClick={() => { onBuySellClick(); setMenuOpen(false); }} className="site-nav__link">
          Buy/Sell
        </button>
        {isLoggedIn && (
          <>
            {currentUser?.role === 'admin' && (
              <button onClick={() => goTo('admin')} className="site-nav__link">
                Admin
              </button>
            )}
            <button onClick={() => goTo('dashboard')} className="site-nav__link">
              Dashboard
            </button>
            <button onClick={() => goTo('profile')} className="site-nav__link">
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
