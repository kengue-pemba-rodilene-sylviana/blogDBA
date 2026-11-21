import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { IconAlert, IconCheck } from './LecIcons';

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

  const initial = (user?.username || user?.email || '?').charAt(0).toUpperCase();
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  return (
    <>
      <section className="lec-hero">
        <p className="lec-hero-eyebrow">Identité</p>
        <h1>Mon profil</h1>
        <p>Vos informations personnelles sur Bookfolio.</p>
      </section>

      {success && <div className="lec-alert success"><IconCheck size={18} /> {success}</div>}
      {error && <div className="lec-alert error"><IconAlert size={18} /> {error}</div>}

      {/* Carte récap */}
      <div className="lec-identity">
        <span className="lec-avatar">{initial}</span>
        <div className="lec-identity-info">
          <h2>{fullName || user?.username}</h2>
          <p>@{user?.username} · {user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lec-form">
        <h3 className="lec-form-section-title">Informations personnelles</h3>

        <div className="lec-field-row">
          <div className="lec-field">
            <label htmlFor="first_name">Prénom</label>
            <input
              id="first_name" name="first_name" type="text"
              className="lec-input"
              placeholder="Votre prénom"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="lec-field">
            <label htmlFor="last_name">Nom</label>
            <input
              id="last_name" name="last_name" type="text"
              className="lec-input"
              placeholder="Votre nom"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="lec-field">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username" name="username" type="text"
            className="lec-input"
            value={form.username}
            onChange={handleChange}
            required
          />
          <p className="lec-field-hint">Utilisé pour vous connecter.</p>
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