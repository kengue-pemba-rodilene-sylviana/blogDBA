import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.patch('/auth/me/', form);
      if (setUser) setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Profil mis à jour avec succès.');
    } catch (err) {
      setError("Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="lec-hero">
        <p className="lec-hero-eyebrow">Identité</p>
        <h1>Mon profil</h1>
        <p>Vos informations personnelles sur Bookfolio.</p>
      </section>

      {success && <div className="lec-alert success">✓ {success}</div>}
      {error && <div className="lec-alert error">⚠ {error}</div>}

      <form onSubmit={handleSubmit} className="lec-form">
        <div className="lec-field">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username" name="username" type="text"
            className="lec-input"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="lec-field">
          <label htmlFor="email">Adresse email</label>
          <input
            id="email" name="email" type="email"
            className="lec-input"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="lec-field">
          <label htmlFor="first_name">Prénom</label>
          <input
            id="first_name" name="first_name" type="text"
            className="lec-input"
            value={form.first_name}
            onChange={handleChange}
          />
        </div>

        <div className="lec-field">
          <label htmlFor="last_name">Nom</label>
          <input
            id="last_name" name="last_name" type="text"
            className="lec-input"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        <div className="lec-form-actions">
          <button type="submit" className="lec-btn lec-btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </>
  );
};

export default UserProfile;