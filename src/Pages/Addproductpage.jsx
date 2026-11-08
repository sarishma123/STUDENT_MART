import { useState } from 'react';

export default function AddProductPage({ onAddProduct, setCurrentPage }) {
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Notes',
    description: '',
    price: '',
    condition: 'Good',
    image: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.title && formData.price) {
      await onAddProduct({ ...formData, imageFile });
    }
  };

  return (
    <div className="page page--narrow">
      <h1 className="section-title"> Post Your Item</h1>
      <p className="muted mb-lg">
        Help fellow students by sharing your study materials!
      </p>

      <form onSubmit={handleSubmit} className="form-card form-stack">
        <label className="field-group">
          Item Title *
          <input
            type="text"
            placeholder="e.g., Database Notes - Complete Guide"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="field"
            required
          />
        </label>

        <label className="field-group">
          Category *
          <select
            value={formData.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="field"
          >
            <option>Notes</option>
            <option>Textbooks</option>
            <option>Calculators</option>
            <option>Lab Equipment</option>
            <option>Stationery</option>
            <option>Electronics</option>
            <option>Hostel Essentials</option>
            <option>Other</option>
          </select>
        </label>

        <label className="field-group">
          Description
          <textarea
            placeholder="Describe the item condition, details, etc."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="field field--textarea"
          />
        </label>

        <div className="field-grid">
          <label className="field-group">
            Price (Rs.) *
            <input
              type="number"
              placeholder="0"
              value={formData.price}
              onChange={(e) => updateField('price', e.target.value)}
              className="field"
              required
            />
          </label>

          <label className="field-group">
            Condition
            <select
              value={formData.condition}
              onChange={(e) => updateField('condition', e.target.value)}
              className="field"
            >
              <option>New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Like New</option>
            </select>
          </label>
        </div>

        <label className="field-group">
          Item photo <span className="muted">(optional, JPEG, PNG, or WebP; max 5 MB)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="field"
          />
        </label>

        <div className="field-actions">
          <button type="button" onClick={() => setCurrentPage('home')} className="btn btn-secondary btn-block">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-block">
             Post Item
          </button>
        </div>
      </form>
    </div>
  );
}
