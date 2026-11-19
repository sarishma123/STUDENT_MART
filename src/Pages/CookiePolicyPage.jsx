import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage({ setCurrentPage }) {
  return (
    <div className="page page--medium">
      <button type="button" className="back-link" onClick={() => setCurrentPage('home')}>
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="section-title">Cookie Policy</h1>
      <p className="muted mb-lg">Last updated: November 19, 2026</p>

      <div className="form-card form-stack">
        <h2 className="section-title section-title--compact">1. What cookies we use</h2>
        <p className="muted mb-md">
          Student Mart uses two strictly necessary cookies:
        </p>
        <ul className="muted mb-md">
          <li>
            <strong>Session cookie</strong> — keeps you signed in as you move between pages. It is deleted
            when you close your browser.
          </li>
          <li>
            <strong>CSRF cookie</strong> (`student_mart_csrf`) — protects form submissions (login, register,
            posting items) from cross-site request forgery attacks. It is not used for tracking.
          </li>
        </ul>

        <h2 className="section-title section-title--compact">2. Analytics and advertising</h2>
        <p className="muted mb-md">
          We do not use analytics cookies, advertising cookies, or third-party tracking cookies. No third
          party can track you across sites through Student Mart.
        </p>

        <h2 className="section-title section-title--compact">3. Your choices</h2>
        <p className="muted mb-md">
          Because these cookies are strictly necessary for the app to work, they cannot be turned off while
          using the app. You can clear cookies at any time through your browser settings, which will sign you
          out and require you to sign in again.
        </p>

        <h2 className="section-title section-title--compact">4. More information</h2>
        <p className="muted mb-md">
          See our Privacy Policy for how we handle personal information, or contact support@studentmart.local
          with questions.
        </p>
      </div>
    </div>
  );
}
