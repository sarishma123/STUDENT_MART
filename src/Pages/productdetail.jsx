export default function ProductDetailPage({
  product,
  wishlist,
  onToggleWishlist,
  onBuyProduct,
  onLoginToBuy,
  currentUser,
  isLoggedIn,
  setCurrentPage,
}) {
  const isOwner = isLoggedIn && currentUser?.id === product.ownerId;
  const isSold = Boolean(product.isSold);

  return (
    <div className="page page--medium">
      <button onClick={() => setCurrentPage('browse')} className="back-link">
        ← Back
      </button>

      <div className="detail-layout detail-card surface">
        <div className="detail-media">{product.image}</div>

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
              {product.contact}
            </p>
            <button
              onClick={() => {
                if (product.contact) {
                  window.location.href = `mailto:${product.contact}`;
                }
              }}
              className="btn btn-primary btn-block"
              disabled={!product.contact}
            >
              Contact Seller
            </button>
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

          <button onClick={() => setCurrentPage('browse')} className="btn btn-secondary btn-block">
            Back to Browse
          </button>
        </div>
      </div>
    </div>
  );
}
