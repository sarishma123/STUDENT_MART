import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage({ setCurrentPage }) {
  return (
    <div className="page page--medium">
      <button type="button" className="back-link" onClick={() => setCurrentPage('home')}>
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="section-title">Privacy Policy</h1>
      <p className="muted mb-lg">Last updated: November 19, 2026</p>

      <div className="form-card form-stack">
        <h2 className="section-title section-title--compact">1. What information we collect</h2>
        <p className="muted mb-md">
          Student Mart collects only the information you give us directly: your name, email address, and
          password when you register. We also collect listings you post (title, description, price, condition,
          category, photo) and your purchase/wishlist activity. Your campus is stored in your account but is
          not collected during registration.
        </p>

        <h2 className="section-title section-title--compact">2. How we use your information</h2>
        <p className="muted mb-md">
          We use your information to run the marketplace: to let you sign in, post and manage listings, buy
          items, save wishlist items, and recover your password. Your email is used only for account-related
          messages (welcome email, password reset) and never shared with other students.
        </p>

        <h2 className="section-title section-title--compact">3. Sharing and disclosure</h2>
        <p className="muted mb-md">
          We do not sell your personal information. Seller contact details are shared only with the recorded
          buyer after a purchase is completed. We do not share your data with advertisers or third parties.
        </p>

        <h2 className="section-title section-title--compact">4. Cookies</h2>
        <p className="muted mb-md">
          We use a session cookie to keep you signed in and a CSRF cookie to protect form submissions. These
          are strictly necessary for the app to work and are not used for tracking or advertising. You can
          manage cookie preferences using the cookie banner on your first visit.
        </p>

        <h2 className="section-title section-title--compact">5. Data retention and deletion</h2>
        <p className="muted mb-md">
          Your account and listings are kept while your account is active. You can request deletion of your
          account and all associated data at any time from the Data Deletion page. Listings you sold remain
          as purchase records for the buyer.
        </p>

        <h2 className="section-title section-title--compact">6. Your rights</h2>
        <p className="muted mb-md">
          You may access, correct, or delete your personal information, or withdraw consent, by contacting us
          using the details on our Terms page or using the Data Deletion page.
        </p>

        <h2 className="section-title section-title--compact">7. Security</h2>
        <p className="muted mb-md">
          Passwords are hashed before storage. Sessions use HttpOnly, SameSite cookies. No method of
          transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </p>

        <p className="muted mt-lg">
          Questions? Contact us through the business details listed on the Terms of Service page.
        </p>
      </div>
    </div>
  );
}
