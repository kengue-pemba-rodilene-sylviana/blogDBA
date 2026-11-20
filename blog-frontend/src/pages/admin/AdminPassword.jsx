import { useState } from 'react';
import api from '../../api/axios';

const AdminPassword = () => {
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.new_password !== form.confirm_password) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/password-change/', {
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setSuccess('Mot de passe modifié avec succès.');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Impossible de modifier le mot de passe.';
      if (data && typeof data === 'object') {
        const k = Object.keys(data)[0];
        const v = data[k];
        msg = Array.isArray(v) ? v[0] : v;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Changer mon mot de passe</h1>
        <p>Choisissez un mot de passe sécurisé, différent de l'ancien.</p>
      </div>

      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          color: '#166534', padding: '10px 14px',
          borderRadius: 6, fontSize: 13, marginBottom: 20,
        }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#b91c1c', padding: '10px 14px',
          borderRadius: 6, fontSize: 13, marginBottom: 20,
        }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div className="form-group">
          <label htmlFor="old_password">Mot de passe actuel</label>
          <input
            id="old_password" name="old_password" type="password"
            className="form-input" required
            value={form.old_password}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="new_password">Nouveau mot de passe</label>
          <input
            id="new_password" name="new_password" type="password"
            className="form-input" required minLength={8}
            value={form.new_password}
            onChange={handleChange}
          />
          <p className="form-hint">8 caractères minimum.</p>
        </div>

        <div className="form-group">
          <label htmlFor="confirm_password">Confirmer le nouveau mot de passe</label>
          <input
            id="confirm_password" name="confirm_password" type="password"
            className="form-input" required minLength={8}
            value={form.confirm_password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Modifier le mot de passe'}
        </button>
      </form>
    </>
  );
};

export default AdminPassword;