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
        <h1 className="hero-title">
          🎓 On-Campus Mart
        </h1>
        <h2 className="hero-subtitle">
          Give Your Old Notes a Second Life
        </h2>
        <p className="hero-copy">
          Find affordable study materials from seniors. Sell your old books, notes, and equipment to help fellow students. Save money. Reduce waste. Support your campus community.
        </p>

        <div className="hero-actions">
          <button onClick={onLoginClick} className="btn btn-secondary">
            Browse Items
          </button>
          <button onClick={onLoginClick} className="btn btn-ghost">
             Sell Now
          </button>
        </div>
      </section>

      <section className="section-surface">
        <h2 className="section-title"> Recently Posted</h2>
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
        <div>
          <h2 className="section-title section-title--center">✨ Why On-Campus Mart?</h2>
          <div className="feature-grid">
            {[
              { title: ' Save Money', desc: 'Buy textbooks and notes at 50-70% off retail prices' },
              { title: ' Help Juniors', desc: 'Sell your old materials to next semester students' },
              { title: ' Be Green', desc: 'Reduce paper waste and support sustainability' },
              { title: ' Easy & Safe', desc: 'Connect directly with students in your college' },
            ].map((item) => (
              <div key={item.title} className="feature-card">
                <h3 className="feature-title">
                  {item.title}
                </h3>
                <p className="muted feature-copy">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-surface">
        <h2 className="section-title"> Popular Categories</h2>
        <div className="category-grid">
          {['Notes', 'Textbooks', ' Calculators', ' Lab Equipment', ' Stationery', ' Electronics'].map(
            (cat) => (
              <button key={cat} className="chip-button">{cat}</button>
            )
          )}
        </div>
      </section>
    </div>
  );
}
