import ProductCard from '../component/productcard';

export default function HomePage({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  wishlist,
  onToggleWishlist,
  onViewDetails,
  onLoginClick,
}) {
  return (
    <div className="page page--wide">
      <section className="home-intro">
        <div>
          <p className="eyebrow">Student-to-student marketplace</p>
          <h1 className="home-title">Useful things, fair prices.</h1>
          <p className="home-copy">
            Find books, notes, and everyday campus essentials from people at your college.
          </p>
        </div>
        <button onClick={onLoginClick} className="btn btn-primary">Sell an Item</button>
      </section>

      <section className="marketplace-tools" aria-label="Find an item">
        <label className="home-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search books, notes, calculators..."
            aria-label="Search listings"
          />
        </label>
        <div className="category-filters" aria-label="Filter by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-filter ${selectedCategory === category ? 'category-filter--active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="home-listings">
        <div className="section-heading-row">
          <div>
            <h2 className="section-title">Recently posted</h2>
            <p className="muted section-subtitle">{products.length} items available</p>
          </div>
          <button type="button" className="text-button" onClick={() => onSelectCategory('All')}>
            Clear filters
          </button>
        </div>
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
        {products.length === 0 && <p className="empty-state">No items match your search. Try another term or category.</p>}
      </section>

      <section className="sell-strip">
        <div>
          <h2 className="sell-strip__title">Have something a student could use?</h2>
          <p className="muted">List it in a minute and pass it on to someone nearby.</p>
        </div>
        <button onClick={onLoginClick} className="btn btn-secondary">Sell an Item</button>
      </section>
    </div>
  );
}
