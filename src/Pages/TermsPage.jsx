import { ArrowLeft } from 'lucide-react';

export default function TermsPage({ setCurrentPage }) {
  return (
    <div className="page page--medium">
      <button type="button" className="back-link" onClick={() => setCurrentPage('home')}>
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="section-title">Terms of Service</h1>
      <p className="muted mb-lg">Last updated: November 19, 2026</p>

      <div className="form-card form-stack">
        <h2 className="section-title section-title--compact">1. Acceptance of terms</h2>
        <p className="muted mb-md">
          By accessing or using Student Mart ("the app"), you agree to these terms. If you do not agree, do
          not use the app.
        </p>

        <h2 className="section-title section-title--compact">2. Who can use the app</h2>
        <p className="muted mb-md">
          The app is intended for college students. You must be at least 13 years old to register. If you are
          under 18, you should have a parent or guardian's consent before using the app. We do not knowingly
          collect data from children under 13.
        </p>

        <h2 className="section-title section-title--compact">3. Accounts</h2>
        <p className="muted mb-md">
          You must provide accurate, current information when you register. You are responsible for keeping
          your password secure and for all activity under your account. Notify us immediately if you suspect
          unauthorized access.
        </p>

        <h2 className="section-title section-title--compact">4. Listings and transactions</h2>
        <p className="muted mb-md">
          You may list items for sale at the price you choose. The displayed price is final — there are no
          hidden fees. All transactions are between buyers and sellers directly; the app facilitates the
          connection only and is not a party to the sale.
        </p>

        <h2 className="section-title section-title--compact">5. Prohibited content</h2>
        <p className="muted mb-md">
          Do not list illegal items, counterfeit goods, prohibited substances, or anything that violates
          someone else's rights. Do not post spam, scams, or inappropriate content. We may remove listings and
          suspend accounts that violate these rules.
        </p>

        <h2 className="section-title section-title--compact">6. Reports and moderation</h2>
        <p className="muted mb-md">
          Any user can report a listing. Reported listings are reviewed and may be removed. You cannot report
          your own listing.
        </p>

        <h2 className="section-title section-title--compact">7. Termination</h2>
        <p className="muted mb-md">
          We may suspend or terminate your account at any time, without notice, for violation of these terms.
        </p>

        <h2 className="section-title section-title--compact">8. Disclaimer</h2>
        <p className="muted mb-md">
          The app is provided "as is" without warranties of any kind. We do not guarantee the quality,
          condition, or availability of any item. Buyers and sellers are responsible for inspecting items and
          completing transactions safely, preferably in a public place on campus.
        </p>

        <h2 className="section-title section-title--compact">9. Changes to these terms</h2>
        <p className="muted mb-md">
          We may update these terms from time to time. Continued use of the app after changes are posted
          means you accept the updated terms.
        </p>

        <h2 className="section-title section-title--compact">10. Contact us</h2>
        <p className="muted mb-md">
          Student Mart — Student community marketplace<br />
          Email: support@studentmart.local<br />
          Address: Campus community, Student Mart project<br />
          For account deletion, privacy questions, or support, email us or use the Data Deletion page.
        </p>

        <p className="muted mt-lg">
          These templates are provided as a starting point. Please review them with a qualified person before
          relying on them for a real deployment.
        </p>
      </div>
    </div>
  );
}
