import { Edit2, Plus, Trash2 } from 'lucide-react';

export default function DashboardPage({
  userProducts,
  purchasedItems,
  currentUser,
  onDeleteProduct,
  onEdit,
  setCurrentPage,
}) {
  const soldListingsCount = userProducts.filter((item) => item.isSold).length;
  const activeListingsCount = userProducts.length - soldListingsCount;
  const myPurchasedItems = purchasedItems.filter((item) => item.soldToId === currentUser?.id);

  return (
    <div className="page page--medium">
      <div className="dashboard-header">
        <h1 className="section-title"> My Dashboard</h1>
        <button onClick={() => setCurrentPage('add-product')} className="btn btn-primary">
          <Plus size={16} />
          Post New
        </button>
      </div>

      <div className="dashboard-stats">
        {[
          { label: 'Total Posts', value: userProducts.length },
          { label: 'Active', value: activeListingsCount },
          { label: 'Sold', value: soldListingsCount },
          { label: 'Purchased', value: myPurchasedItems.length },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="muted mb-sm text-sm">
              {stat.icon} {stat.label}
            </p>
            <p className="text-primary text-strong text-xl m-0">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel__header">
          <h2 className="section-title section-title--compact">
            My Listings ({userProducts.length})
          </h2>
        </div>

        {userProducts.length === 0 ? (
          <div className="empty-state">
            <p>No items posted yet. Start selling to help others!</p>
            <button onClick={() => setCurrentPage('add-product')} className="btn btn-primary">
              Post Your First Item
            </button>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Category</th>
                <th>Status</th>
                <th className="dashboard-table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userProducts.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td className="text-primary text-strong">₹{item.price}</td>
                  <td className="muted">{item.category}</td>
                  <td>
                    <span className={`status-pill ${item.isSold ? 'status-pill--sold' : 'status-pill--active'}`}>
                      {item.isSold ? 'Sold' : 'Active'}
                    </span>
                  </td>
                  <td className="dashboard-table__actions">
                    <button onClick={() => onEdit(item.id)} className="icon-button" aria-label="Edit item">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(item.id)}
                      className="icon-button icon-button--danger"
                      aria-label="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dashboard-panel mt-lg">
        <div className="dashboard-panel__header">
          <h2 className="section-title section-title--compact">
            My Purchases ({myPurchasedItems.length})
          </h2>
        </div>

        {myPurchasedItems.length === 0 ? (
          <div className="empty-state">
            <p>You have not purchased any items yet.</p>
            <button onClick={() => setCurrentPage('browse')} className="btn btn-primary">
              Browse Items
            </button>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Seller</th>
                <th>Purchased</th>
              </tr>
            </thead>
            <tbody>
              {myPurchasedItems.map((item) => (
                <tr key={`purchase-${item.id}`}>
                  <td>{item.title}</td>
                  <td className="text-primary text-strong">₹{item.price}</td>
                  <td className="muted">{item.seller}</td>
                  <td className="muted">{item.soldAt || 'Recently'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
