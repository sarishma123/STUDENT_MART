import { useState } from 'react';

export default function ProductDetailPage({
  product,
  wishlist,
  onToggleWishlist,
  onBuyProduct,
  onLoginToBuy,
  currentUser,
  isLoggedIn,
  setCurrentPage,
  onReportProduct,
}) {
  const isOwner = isLoggedIn && currentUser?.id === product.ownerId;
  const isSold = Boolean(product.isSold);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  const submitReport = async () => {
    if (!reportReason) return;
    const result = await onReportProduct(product.id, reportReason);
    setReportMessage(result.message || 'Please sign in to report this listing.');
  };

  return (
    <div className="page page--medium">
      <button onClick={() => setCurrentPage('browse')} className="back-link">
        ← Back
      </button>

      <div className="detail-layout detail-card surface">
        <div className="detail-media">
          {product.image ? (
            <img src={product.image} alt={product.title} className="detail-image" />
          ) : (
            <span className="detail-media__placeholder">No image available</span>
          )}
        </div>

        <div>
          <div className="detail-top mb-md">
            <div>
              <h1 className="detail-title">
                {product.title}
              </h1>
              <p className="detail-subtitle">
                <span className="detail-category">{product.category}</span>
                {' • '}Posted {product.posted}
              </p>
            </div>

            <button onClick={() => onToggleWishlist(product.id)} className="icon-button" aria-label="Toggle wishlist">
              {wishlist.includes(product.id) ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="detail-price-box">
            <p className="detail-meta-label">Price</p>
            <p className="detail-price-value">
              NPR{product.price}
            </p>
          </div>

          <div className="detail-meta-grid">
            <div>
              <p className="detail-meta-label">Condition</p>
              <p className="detail-meta-value">{product.condition}</p>
            </div>
            <div>
              <p className="detail-meta-label">Posted By</p>
              <p className="detail-meta-value">{product.seller}</p>
            </div>
          </div>

          <div className="detail-seller-card">
            <p className="detail-meta-label"> Contact</p>
            <p className="detail-contact-value">
              Seller contact details are shared after a purchase.
            </p>
          </div>

          {!isLoggedIn && (
            <button onClick={onLoginToBuy} className="btn btn-primary btn-block">
               Sign In to Buy
            </button>
          )}

          {isLoggedIn && !isOwner && !isSold && (
            <button onClick={() => onBuyProduct(product.id)} className="btn btn-primary btn-block">
              Buy Now
            </button>
          )}

          {isLoggedIn && isOwner && (
            <button className="btn btn-secondary btn-block" disabled>
              Your Listing
            </button>
          )}

          {isSold && (
            <button className="btn btn-secondary btn-block" disabled>
              Sold {product.soldToName ? `to ${product.soldToName}` : ''}
            </button>
          )}

          {!isOwner && !isSold && (
            <div className="report-listing">
              <label className="detail-meta-label" htmlFor="report-reason">Report this listing</label>
              <div className="report-listing__controls">
                <select
                  id="report-reason"
                  className="field"
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="scam">Suspected scam</option>
                  <option value="prohibited">Prohibited item</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="other">Other</option>
                </select>
                <button type="button" className="btn btn-secondary" disabled={!reportReason} onClick={submitReport}>
                  Submit report
                </button>
              </div>
              {reportMessage && <p className="muted text-sm mb-0">{reportMessage}</p>}
            </div>
          )}

          <button onClick={() => setCurrentPage('browse')} className="btn btn-secondary btn-block">
            Back to Browse
          </button>
        </div>
      </div>
    </div>
  );
}
