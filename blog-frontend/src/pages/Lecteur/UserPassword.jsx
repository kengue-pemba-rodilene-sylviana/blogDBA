import { useState } from 'react';
import api from '../../api/axios';
import { IconAlert, IconCheck } from './LecIcons';

const UserPassword = () => {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
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
      setError('Impossible de modifier le mot de passe.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="lec-hero">
        <p className="lec-hero-eyebrow">Sécurité</p>
        <h1>Mot de passe</h1>
        <p>Changez votre mot de passe en toute sécurité.</p>
      </section>

      {success && <div className="lec-alert success"><IconCheck size={18} /> {success}</div>}
      {error && <div className="lec-alert error"><IconAlert size={18} /> {error}</div>}

      <form onSubmit={handleSubmit} className="lec-form" style={{ maxWidth: 520 }}>
        <div className="lec-field">
          <label htmlFor="old_password">Mot de passe actuel</label>
          <input
            id="old_password" name="old_password" type="password"
            className="lec-input"
            autoComplete="current-password"
            required
            value={form.old_password}
            onChange={handleChange}
          />
        </div>

        <div className="lec-field">
          <label htmlFor="new_password">Nouveau mot de passe</label>
          <input
            id="new_password" name="new_password" type="password"
            className="lec-input"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.new_password}
            onChange={handleChange}
          />
          <p className="lec-field-hint">8 caractères minimum.</p>
        </div>

        <div className="lec-field">
          <label htmlFor="confirm_password">Confirmer le mot de passe</label>
          <input
            id="confirm_password" name="confirm_password" type="password"
            className="lec-input"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.confirm_password}
            onChange={handleChange}
          />
        </div>

        <div className="lec-form-actions">
          <button type="submit" className="lec-btn lec-btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Modifier le mot de passe'}
          </button>
        </div>
      </form>
    </>
  );
};

export default UserPassword;