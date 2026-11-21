import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { IconInbox, IconPlus } from './AdminIcons';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/articles/')
      .then(r => setArticles(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await api.delete(`/articles/${id}/`);
      setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      alert('Impossible de supprimer.');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <>
      <div className="page-header page-header--actions">
        <div>
          <h1>Articles</h1>
          <p>Gérez les articles publiés sur Bookfolio.</p>
        </div>
        <Link to="/admin/articles/new" className="btn btn-primary">
          <IconPlus size={16} /> Nouvel article
        </Link>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div className="empty-state"><p>Chargement…</p></div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconInbox size={26} /></div>
            <p>Aucun article pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Catégorie</th>
                <th>Publié le</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id}>
                  <td>{a.title || '—'}</td>
                  <td className="muted">{a.author?.username || '—'}</td>
                  <td className="muted">{a.category_name || '—'}</td>
                  <td className="muted">{formatDate(a.published_at)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link
                      to={`/admin/articles/${a.id}/edit`}
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: 6 }}
                    >
                      Modifier
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(a.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminArticles;