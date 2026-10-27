import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';

export default function AdminPage({ onLoad, onDeleteProduct, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setError('');
      setData(await onLoad());
    } catch (loadError) {
      setError(loadError.message || 'Could not load the admin dashboard.');
    }
  }, [onLoad]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleDelete = useCallback(async (productId) => {
    if (!window.confirm('Remove this product from the marketplace?')) return;

    try {
      await onDeleteProduct(productId);
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message || 'Could not remove the product.');
    }
  }, [loadDashboard, onDeleteProduct]);

  if (!data) {
    return <main className="page"><p>{error || 'Loading admin dashboard...'}</p></main>;
  }

  return (
    <main className="page page--wide">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><ShieldCheck size={16} /> Administrator</p>
          <h1 className="section-title">Admin dashboard</h1>
          <p className="muted">Review marketplace activity and remove policy-violating listings.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="dashboard-grid">
        {[
          ['Users', data.stats.users],
          ['Products', data.stats.products],
          ['Active listings', data.stats.active_products],
          ['Sold listings', data.stats.sold_products],
        ].map(([label, value]) => (
          <div className="dashboard-panel" key={label}>
            <p className="muted">{label}</p>
            <strong className="dashboard-stat">{value}</strong>
          </div>
        ))}
      </div>

      <section className="dashboard-panel mt-lg">
        <h2 className="section-title section-title--compact">Recent listings</h2>
        {data.products.length === 0 ? <p className="muted">No listings yet.</p> : (
          <div className="admin-list">
            {data.products.map((product) => (
              <div className="admin-list__row" key={product.id}>
                <div>
                  <strong>{product.title}</strong>
                  <p className="muted">{product.seller} · {product.category} · {product.status}</p>
                </div>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(product.id)}>
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-panel mt-lg">
        <h2 className="section-title section-title--compact">Users</h2>
        <div className="admin-list">
          {data.users.map((user) => (
            <div className="admin-list__row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <p className="muted">{user.email} · {user.role}</p>
              </div>
              <span className="muted">{user.campus || 'No campus'}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
