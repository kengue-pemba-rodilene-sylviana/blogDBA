import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users/')
      .then(r => setUsers(r.data))
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    const label = u.username || u.email || `l'utilisateur #${u.id}`;
    if (!window.confirm(`Supprimer définitivement ${label} ? Cette action est irréversible.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${u.id}/`);
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Impossible de supprimer cet utilisateur.';
      alert(msg);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const filtered = search.trim()
    ? users.filter(u =>
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <>
      <div className="page-header">
        <h1>Utilisateurs</h1>
        <p>Gérez les comptes inscrits sur Bookfolio ({users.length} au total).</p>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#b91c1c', padding: '10px 14px',
          borderRadius: 6, fontSize: 13, marginBottom: 20,
        }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: 360 }}
        />
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div className="empty-state"><p>Chargement…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Utilisateur</th>
                <th>Email</th>
                <th style={{ width: 100 }}>Rôle</th>
                <th style={{ width: 90 }}>Articles</th>
                <th style={{ width: 110 }}>Commentaires</th>
                <th style={{ width: 140 }}>Inscrit le</th>
                <th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isMe = u.id === currentUser?.id;
                const isAdmin = u.is_superuser || u.role === 'admin';
                return (
                  <tr key={u.id}>
                    <td className="muted">{u.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="stat-icon" style={{ width: 28, height: 28, fontSize: 12 }}>
                          {(u.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span>
                          {u.username}
                          {isMe && (
                            <span style={{
                              marginLeft: 6, fontSize: 11,
                              color: '#7c2d12', fontWeight: 500,
                            }}>
                              (vous)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <span style={{
                        fontSize: 11.5,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: isAdmin ? '#7c2d12' : '#f5f5f4',
                        color: isAdmin ? '#fff' : '#78716c',
                        fontWeight: 500,
                      }}>
                        {isAdmin ? 'Admin' : 'Lecteur'}
                      </span>
                    </td>
                    <td className="muted">{u.article_count}</td>
                    <td className="muted">{u.comment_count}</td>
                    <td className="muted">{formatDate(u.date_joined)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link
                        to={`/admin/users/${u.id}/edit`}
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: 6, textDecoration: 'none' }}
                      >
                        Modifier
                      </Link>
                      {!isMe && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u)}
                          title="Supprimer cet utilisateur"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminUsers;