import ProductCard from '../component/productcard';

export default function HomePage({
  products,
  wishlist,
  onToggleWishlist,
  onViewDetails,
  onLoginClick,
}) {
  return (
    <div className="page page--wide">
      <section className="hero-section">
        <h1 className="hero-title">Find what you need. Sell what you don't.</h1>
        <p className="hero-copy">
          Buy and sell used books, notes and everyday essentials with fellow students.
        </p>

        <div className="hero-actions">
          <button onClick={onLoginClick} className="btn btn-primary">
            Browse Items
          </button>
          <button onClick={onLoginClick} className="btn btn-secondary">
            Sell Now
          </button>
        </div>
      </section>

      <section className="section-surface">
        <h2 className="section-title">Recently Posted</h2>
        <div className="product-grid">
          {products.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={() => onToggleWishlist(product.id)}
              onViewDetails={() => onViewDetails(product.id)}
            />
          ))}
        </div>
      </section>

      <section className="section-surface section-surface--tinted">
        <h2 className="section-title section-title--center">Why On-Campus Mart?</h2>
        <div className="feature-grid">
          {[
            { title: 'Save Money', desc: 'Buy at 50-70% off retail' },
            { title: 'Help Others', desc: 'Sell to junior students' },
            { title: 'Be Green', desc: 'Reduce paper waste' },
            { title: 'Safe & Easy', desc: 'Connect with campus students' },
          ].map((item) => (
            <div key={item.title} className="feature-card">
              <h3 className="feature-title">{item.title}</h3>
              <p className="muted feature-copy">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-surface">
        <h2 className="section-title">Popular Categories</h2>
        <div className="category-grid">
          {['Notes', 'Textbooks', 'Calculators', 'Lab Equipment', 'Stationery', 'Electronics'].map(
            (cat) => (
              <button key={cat} className="chip-button">{cat}</button>
            )
          )}
        </div>
      </section>
    </div>
  );
}
