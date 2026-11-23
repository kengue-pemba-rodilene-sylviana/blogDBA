
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { IconInbox, IconPlus } from './AdminIcons';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get('/articles/');

      // Django REST Framework peut renvoyer une liste
      // ou un objet paginé contenant results.
      const data = response.data;
      setArticles(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erreur de chargement des articles :', error);
      alert('Impossible de charger les articles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approuver et publier cet article ?')) return;

    try {
      setProcessing(id);

      await api.post(`/articles/${id}/approve/`);

      alert('Article approuvé et publié.');
      await loadArticles();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
        'Impossible d’approuver cet article.'
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    const reviewNote = window.prompt(
      'Indique le motif du rejet de cet article :'
    );

    if (reviewNote === null) return;

    if (!reviewNote.trim()) {
      alert('Le motif du rejet est obligatoire.');
      return;
    }

    try {
      setProcessing(id);

      await api.post(`/articles/${id}/reject/`, {
        review_note: reviewNote.trim(),
      });

      alert('Article rejeté.');
      await loadArticles();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
        'Impossible de rejeter cet article.'
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cet article ?')) return;

    try {
      setProcessing(id);

      await api.delete(`/articles/${id}/`);

      setArticles((previous) =>
        previous.filter((article) => article.id !== id)
      );

      alert('Article supprimé.');
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
        'Impossible de supprimer cet article.'
      );
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';

    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusLabels = {
    draft: 'Brouillon',
    pending: 'En attente',
    published: 'Publié',
    rejected: 'Rejeté',
  };

  const filteredArticles = articles.filter((article) => {
    if (filter === 'all') return true;
    return article.status === filter;
  });

  const count = (status) =>
    articles.filter((article) => article.status === status).length;

  return (
    <>
      <div className="page-header page-header--actions">
        <div>
          <h1>Gestion des articles</h1>
          <p>Consultez, modérez et gérez les publications.</p>
        </div>

        <Link to="/admin/articles/new" className="btn btn-primary">
          <IconPlus size={16} /> Nouvel article
        </Link>
      </div>

      <div className="admin-article-stats">
        <div className="stat-card">
          <h3>Total</h3>
          <strong>{articles.length}</strong>
        </div>

        <div className="stat-card">
          <h3>En attente</h3>
          <strong>{count('pending')}</strong>
        </div>

        <div className="stat-card">
          <h3>Publiés</h3>
          <strong>{count('published')}</strong>
        </div>

        <div className="stat-card">
          <h3>Rejetés</h3>
          <strong>{count('rejected')}</strong>
        </div>
      </div>

      <div className="admin-article-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tous ({articles.length})
        </button>

        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          En attente ({count('pending')})
        </button>

        <button
          className={filter === 'published' ? 'active' : ''}
          onClick={() => setFilter('published')}
        >
          Publiés ({count('published')})
        </button>

        <button
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Rejetés ({count('rejected')})
        </button>

        <button
          className={filter === 'draft' ? 'active' : ''}
          onClick={() => setFilter('draft')}
        >
          Brouillons ({count('draft')})
        </button>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Chargement des articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconInbox size={26} />
            </div>
            <p>Aucun article dans cette catégorie.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td>{article.title || 'Sans titre'}</td>

                  <td className="muted">
                    {article.author?.username || '—'}
                  </td>

                  <td className="muted">
                    {article.category_name || '—'}
                  </td>

                  <td>
                    <span className={`article-status status-${article.status}`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                  </td>

                  <td className="muted">
                    {formatDate(
                      article.submitted_at ||
                      article.published_at ||
                      article.updated_at
                    )}
                  </td>

                  <td style={{ whiteSpace: 'nowrap' }}>
                    {article.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={processing === article.id}
                          onClick={() => handleApprove(article.id)}
                        >
                          Approuver
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          disabled={processing === article.id}
                          onClick={() => handleReject(article.id)}
                          style={{ marginLeft: 5 }}
                        >
                          Rejeter
                        </button>
                      </>
                    )}

                    <Link
                      to={`/admin/articles/${article.id}/edit`}
                      className="btn btn-secondary btn-sm"
                      style={{ marginLeft: 5 }}
                    >
                      Modifier
                    </Link>

                    <button
                      className="btn btn-danger btn-sm"
                      disabled={processing === article.id}
                      onClick={() => handleDelete(article.id)}
                      style={{ marginLeft: 5 }}
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
