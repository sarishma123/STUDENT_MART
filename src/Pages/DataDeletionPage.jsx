import { useState } from 'react';
import { api } from '../api';

export default function DataDeletionPage() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/deletion.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getCsrfToken(),
        },
        body: JSON.stringify({ type: 'delete-account' }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Deletion request failed.');
        return;
      }
      setMessage(data.message || 'Your account and data have been scheduled for deletion.');
    } catch (err) {
      setError(err.message || 'Could not complete the deletion request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--narrow">
      <h1 className="section-title">Delete Your Account &amp; Data</h1>
      <p className="muted mb-lg">
        This permanently removes your account, listings, purchases, and wishlist data. This action cannot be
        undone. Sold listings remain as purchase records for the buyer.
      </p>

      <form onSubmit={handleDelete} className="form-card form-stack">
        <label className="field-group">
          I understand this cannot be undone
          <input
            type="checkbox"
            className="field"
            style={{ width: 'auto', display: 'inline-block', minWidth: 'auto' }}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <div className="field-actions">
          <button type="button" className="btn btn-secondary btn-block">
            Cancel
          </button>
          <button type="submit" className="btn btn-danger btn-block" disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete my account'}
          </button>
        </div>
      </form>
    </div>
  );
}

async function getCsrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find((value) => value.startsWith('student_mart_csrf='));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
}
