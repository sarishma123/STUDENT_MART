export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onViewDetails,
}) {
  return (
    <article className={`product-card ${product.isSold ? 'product-card--sold' : ''}`} onClick={onViewDetails}>
      <div className="product-card__media">
        <span aria-hidden="true">{product.image}</span>

        {product.isSold && <span className="product-card__sold-tag">Sold</span>}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className="product-card__wishlist"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">
          {product.title}
        </h3>

        <p className="product-card__meta">
          {product.seller} • {product.posted}
        </p>

        <div className="product-card__footer">
          <span className="product-card__price">
            ₹{product.price}
          </span>
          <span className="product-card__badge">
            {product.condition}
          </span>
        </div>
      </div>
    </article>
  );
}
