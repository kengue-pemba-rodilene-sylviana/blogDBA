import { useState } from 'react';
import api from '../../api/axios';
import { IconAlert, IconCheck } from './AdminIcons';

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

      {success && <div className="alert alert-success"><IconCheck size={18} /> {success}</div>}
      {error && <div className="alert alert-error"><IconAlert size={18} /> {error}</div>}

      <form onSubmit={handleSubmit} className="form-card form-card--narrow">
        <div className="form-group">
          <label htmlFor="old_password">Mot de passe actuel</label>
          <input
            id="old_password" name="old_password" type="password"
            className="form-input" required
            autoComplete="current-password"
            value={form.old_password}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="new_password">Nouveau mot de passe</label>
          <input
            id="new_password" name="new_password" type="password"
            className="form-input" required minLength={8}
            autoComplete="new-password"
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
            autoComplete="new-password"
            value={form.confirm_password}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Modifier le mot de passe'}
          </button>
        </div>
      </form>
    </>
  );
};

export default AdminPassword;