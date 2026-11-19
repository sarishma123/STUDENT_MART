import { ArrowLeft } from 'lucide-react';

export default function RefundPage({ setCurrentPage }) {
  return (
    <div className="page page--medium">
      <button type="button" className="back-link" onClick={() => setCurrentPage('home')}>
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="section-title">Refund Policy</h1>
      <p className="muted mb-lg">Last updated: November 19, 2026</p>

      <div className="form-card form-stack">
        <h2 className="section-title section-title--compact">1. No platform fees</h2>
        <p className="muted mb-md">
          Student Mart does not charge any commission, listing fee, or transaction fee. The price shown on a
          listing is the final price — there are no hidden fees.
        </p>

        <h2 className="section-title section-title--compact">2. Sales are between buyer and seller</h2>
        <p className="muted mb-md">
          Student Mart is a connection platform, not a seller. All sales are made directly between students.
          Refunds, returns, and disputes are handled between the buyer and the seller. The app does not
          process payments and cannot issue refunds.
        </p>

        <h2 className="section-title section-title--compact">3. Before you buy</h2>
        <p className="muted mb-md">
          We recommend you inspect the item and confirm the condition, price, and meeting location with the
          seller before completing a purchase. Meet in a public place on campus and bring a friend if possible.
        </p>

        <h2 className="section-title section-title--compact">4. If something goes wrong</h2>
        <p className="muted mb-md">
          If a listing is misrepresented, spam, or a suspected scam, you can report it from the product detail
          page. We will review the report and may remove the listing. For a refund, please resolve it directly
          with the seller.
        </p>

        <h2 className="section-title section-title--compact">5. Contact</h2>
        <p className="muted mb-md">
          Questions about a specific purchase should be directed to the seller using the contact details shown
          after a purchase is recorded. General questions can be sent to support@studentmart.local.
        </p>
      </div>
    </div>
  );
}
