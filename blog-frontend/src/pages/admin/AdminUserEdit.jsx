import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { IconAlert, IconCheck } from './AdminIcons';

const AdminUserEdit = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'reader',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMe = Number(id) === currentUser?.id;

  useEffect(() => {
    api.get(`/admin/users/${id}/`)
      .then((r) => {
        const u = r.data;
        setForm({
          username: u.username || '',
          email: u.email || '',
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          role: u.is_superuser || u.role === 'admin' ? 'admin' : 'reader',
          is_active: u.is_active !== false,
        });
      })
      .catch(() => setError("Impossible de charger cet utilisateur."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await api.patch(`/admin/users/${id}/`, form);
      setSuccess('Utilisateur mis à jour avec succès.');
      setTimeout(() => navigate('/admin/users'), 800);
    } catch (err) {
      const data = err.response?.data;
      let msg = "Erreur lors de l'enregistrement.";
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

  if (loading) return <div className="page-header"><p>Chargement…</p></div>;

  return (
    <>
      <div className="page-header">
        <h1>Modifier l'utilisateur #{id}</h1>
        <p>Modifiez ses informations, son rôle ou son statut.</p>
      </div>

      {isMe && (
        <div className="alert alert-warning">
          <IconAlert size={18} /> Vous modifiez votre propre compte. Vous ne pouvez pas changer votre rôle ni vous désactiver.
        </div>
      )}
      {success && <div className="alert alert-success"><IconCheck size={18} /> {success}</div>}
      {error && <div className="alert alert-error"><IconAlert size={18} /> {error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="first_name">Prénom</label>
            <input
              id="first_name" name="first_name" type="text"
              className="form-input"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Nom</label>
            <input
              id="last_name" name="last_name" type="text"
              className="form-input"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username" name="username" type="text"
              className="form-input"
              value={form.username}
              onChange={handleChange}
              required
            />
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
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="role">Rôle</label>
          <select
            id="role" name="role"
            className="form-select"
            value={form.role}
            onChange={handleChange}
            disabled={isMe}
          >
            <option value="reader">Lecteur</option>
            <option value="admin">Administrateur</option>
          </select>
          <p className="form-hint">
            {isMe ? "Vous ne pouvez pas modifier votre propre rôle." : "Un administrateur peut gérer les articles, commentaires et utilisateurs."}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="is_active" className="form-check">
            <input
              id="is_active" name="is_active" type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
              disabled={isMe}
            />
            Compte actif
          </label>
          <p className="form-hint">
            Un compte désactivé ne peut plus se connecter.
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
          <Link to="/admin/users" className="btn btn-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </>
  );
};

export default AdminUserEdit;