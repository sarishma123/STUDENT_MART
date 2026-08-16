import { useState } from 'react';

export default function EditProductPage({ product, onUpdate, setCurrentPage }) {
  const [formData, setFormData] = useState(product);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    alert(' Product updated!');
    setCurrentPage('dashboard');
  };

  return (
    <div className="page page--narrow">
      <h1 className="section-title">✏️ Edit Your Item</h1>

      <form onSubmit={handleSubmit} className="form-card form-stack">
        <label className="field-group">
          Title
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="field"
          />
        </label>

        <label className="field-group">
          Description
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="field field--textarea"
          />
        </label>

        <label className="field-group">
          Price (₹)
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="field"
          />
        </label>

        <div className="field-actions">
          <button type="button" onClick={() => setCurrentPage('dashboard')} className="btn btn-secondary btn-block">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-block">
             Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
