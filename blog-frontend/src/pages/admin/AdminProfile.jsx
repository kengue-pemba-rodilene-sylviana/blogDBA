import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { IconAlert, IconCheck, IconLock } from './AdminIcons';

const AdminProfile = () => {
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
      const data = err.response?.data;
      let msg = 'Impossible de mettre à jour le profil.';
      if (data && typeof data === 'object') {
        const k = Object.keys(data)[0];
        const v = data[k];
        msg = `${k} : ${Array.isArray(v) ? v[0] : v}`;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const initial = (user?.username || '?').charAt(0).toUpperCase();

  return (
    <>
      <div className="page-header">
        <h1>Mon profil</h1>
        <p>Gérez vos informations personnelles et vos identifiants.</p>
      </div>

      {success && <div className="alert alert-success"><IconCheck size={18} /> {success}</div>}
      {error && <div className="alert alert-error"><IconAlert size={18} /> {error}</div>}

      {/* Carte récap */}
      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-info">
          <h2>
            {user?.first_name || user?.last_name
              ? `${user.first_name} ${user.last_name}`.trim()
              : user?.username}
          </h2>
          <p>@{user?.username} · {user?.email}</p>
          <div className="profile-meta">
            <span className={`pill ${user?.is_superuser ? 'pill-primary' : 'pill-muted'}`}>
              {user?.is_superuser ? 'Administrateur' : 'Membre'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Membre depuis {formatDate(user?.date_joined)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="first_name">Prénom</label>
            <input
              id="first_name" name="first_name" type="text"
              className="form-input"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Prénom"
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Nom</label>
            <input
              id="last_name" name="last_name" type="text"
              className="form-input"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Nom"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username" name="username" type="text"
            className="form-input"
            value={form.username}
            onChange={handleChange}
            required
          />
          <p className="form-hint">Utilisé pour vous connecter.</p>
        </div>

        <div className="form-group">
          <label htmlFor="email">Adresse email</label>
          <input
            id="email" name="email" type="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
            required
          />
          <p className="form-hint">Utilisée pour la connexion et les notifications.</p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Lien changement de mot de passe */}
      <div className="profile-footer">
        <p>
          Pour des raisons de sécurité, votre mot de passe ne peut pas être modifié depuis cette page.
        </p>
        <Link to="/admin/password" className="btn btn-secondary">
          <IconLock size={16} /> Changer mon mot de passe
        </Link>
      </div>
    </>
  );
};

export default AdminProfile;