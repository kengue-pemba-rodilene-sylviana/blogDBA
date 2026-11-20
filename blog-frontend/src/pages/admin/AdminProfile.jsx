import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

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

      {/* Carte récap */}
      <div style={{
        background: '#fff',
        border: '1px solid #e7e5e4',
        borderRadius: 10,
        padding: 24,
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        maxWidth: 640,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#7c2d12', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1c1917' }}>
            {user?.first_name || user?.last_name
              ? `${user.first_name} ${user.last_name}`.trim()
              : user?.username}
          </h2>
          <p style={{ margin: '4px 0 8px', fontSize: 13.5, color: '#78716c' }}>
            @{user?.username} · {user?.email}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              background: user?.is_superuser ? '#7c2d12' : '#78716c',
              color: '#fff', padding: '2px 8px',
              borderRadius: 10, fontSize: 11, fontWeight: 500,
            }}>
              {user?.is_superuser ? 'Administrateur' : 'Membre'}
            </span>
            <span style={{ fontSize: 12, color: '#78716c' }}>
              Membre depuis {formatDate(user?.date_joined)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Lien changement de mot de passe */}
      <div style={{
        marginTop: 40, paddingTop: 24,
        borderTop: '1px solid #e7e5e4',
        maxWidth: 640,
      }}>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#78716c' }}>
          Pour des raisons de sécurité, votre mot de passe ne peut pas être modifié depuis cette page.
        </p>
        <Link
          to="/admin/password"
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
           Changer mon mot de passe
        </Link>
      </div>
    </>
  );
};

export default AdminProfile;