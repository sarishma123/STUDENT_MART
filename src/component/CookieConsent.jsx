import { useState, useEffect } from 'react';

const KEY = 'student_mart_cookie_consent';

export default function CookieConsent() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(KEY);
    setShown(!consent);
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, JSON.stringify({ essential: true, at: new Date().toISOString() }));
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie consent">
      <div className="cookie-banner__body">
        <p className="cookie-banner__text">
          Student Mart uses cookies to keep you signed in and protect form submissions. These cookies are
          strictly necessary and are not used for tracking or advertising. By continuing to use the app, you
          accept our use of cookies.
        </p>
        <div className="cookie-banner__actions">
          <button type="button" className="btn btn-secondary" onClick={accept}>
            Learn more
          </button>
          <button type="button" className="btn btn-primary" onClick={accept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
