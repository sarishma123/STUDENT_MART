import ProductCard from '../component/productcard';
import {
  BookOpen,
  Calculator,
  FlaskConical,
  GraduationCap,
  Laptop,
  PiggyBank,
  PenLine,
  Recycle,
  ShieldCheck,
  Users,
} from 'lucide-react';

const categories = [
  { label: 'Notes', icon: BookOpen },
  { label: 'Textbooks', icon: BookOpen },
  { label: 'Calculators', icon: Calculator },
  { label: 'Lab Equipment', icon: FlaskConical },
  { label: 'Stationery', icon: PenLine },
  { label: 'Electronics', icon: Laptop },
];

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
        <div className="hero-mark" aria-hidden="true">
          <GraduationCap size={24} strokeWidth={1.8} />
        </div>
        <h1 className="hero-title">
          On-Campus Mart
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
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Campus marketplace</p>
            <h2 className="section-title">Recently listed</h2>
          </div>
          <span className="section-note">Fresh finds from fellow students</span>
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
      </section>

      <section className="section-surface section-surface--tinted">
        <div>
          <p className="eyebrow eyebrow--center">Why students use it</p>
          <h2 className="section-title section-title--center">Useful things, passed forward</h2>
          <div className="feature-grid">
            {[
              { title: 'Save money', desc: 'Find textbooks and notes at student-friendly prices', icon: PiggyBank },
              { title: 'Help juniors', desc: 'Pass useful materials to the next semester', icon: Users },
              { title: 'Use less', desc: 'Keep good study materials in circulation', icon: Recycle },
              { title: 'Trade locally', desc: 'Connect with students in your college', icon: ShieldCheck },
            ].map(({ title, desc, icon: Icon }) => (
              <div key={title} className="feature-card">
                <Icon className="feature-card__icon" size={20} strokeWidth={1.8} />
                <h3 className="feature-title">
                  {title}
                </h3>
                <p className="muted feature-copy">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-surface">
        <p className="eyebrow">Browse by need</p>
        <h2 className="section-title">Popular categories</h2>
        <div className="category-grid">
          {categories.map(({ label, icon: Icon }) => (
            <button key={label} className="chip-button">
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
