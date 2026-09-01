import { Search } from 'lucide-react';
import ProductCard from "../components/ProductCard";;

export default function BrowsePage({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  wishlist,
  onToggleWishlist,
  onViewDetails,
}) {
  return (
    <div className="page page--wide">
      <h1 className="section-title">
         Browse All Items
      </h1>

      <div className="browse-layout">
        <aside className="browse-sidebar">
          <div className="mb-lg">
            <label className="field-group">Search</label>
            <div className="search-box">
              <Search size={18} color="#999" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div>
            <label className="field-group"> Category</label>
            <div className="category-list">
              {categories.map((cat) => (
                <label key={cat} className="category-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => onSelectCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <div className="browse-count">
            Found {products.length} items
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <p className="muted">No items found. Try adjusting your search!</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={() => onToggleWishlist(product.id)}
                  onViewDetails={() => onViewDetails(product.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
