import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AuthorShell from './AuthorShell';
import { IconArrow } from './AuthorIcons';
import './AuthorDashboard.css';

export default function AuthorDashboard() {
  const { user } = useAuth();

  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.get('/articles/mine/')
      .then((res) => {
        setArticles(res.data.results || res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const count = (status) =>
    articles.filter((article) => article.status === status).length;

  const labels = {
    draft: 'Brouillon',
    pending: 'En attente',
    published: 'Publié',
    rejected: 'Refusé',
  };

  return (
    <AuthorShell>
      <div className="author-hero">
        <div>
          <span className="author-eyebrow">Espace auteur</span>
          <h1>
            Bienvenue,<br />
            <span className="author-accent">
              {user?.first_name || user?.username || 'Auteur'}
            </span>.
          </h1>
          <p>Gérez vos publications et suivez leur évolution.</p>

          <Link to="/auteur/nouvel-article" className="author-primary-btn">
            Écrire un article <IconArrow size={16} />
          </Link>
        </div>

        <div className="author-hero-card">
          <span className="author-hero-status"><i /> Votre activité</span>
          <p>
            <strong>{articles.length}</strong> articles au total, dont{' '}
            <strong>{count('published')}</strong> publiés.
          </p>
          <Link to="/auteur/articles" className="author-hero-link">
            <span className="author-hero-arrow"><IconArrow size={16} /></span>
            Voir mes articles
          </Link>
        </div>
      </div>

      <div className="author-stats">
        <div className="author-stat-card">
          <h3>Total des articles</h3>
          <p>{articles.length}</p>
        </div>
        <div className="author-stat-card">
          <h3>Brouillons</h3>
          <p>{count('draft')}</p>
        </div>
        <div className="author-stat-card">
          <h3>En attente</h3>
          <p>{count('pending')}</p>
        </div>
        <div className="author-stat-card">
          <h3>Publiés</h3>
          <p>{count('published')}</p>
        </div>
      </div>

      <div className="author-section">
        <h2>Mes dernières publications</h2>

        {articles.length === 0 ? (
          <p>Vous n'avez pas encore créé d'article.</p>
        ) : (
          <div className="author-table-wrapper">
            <table className="author-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {articles.slice(0, 5).map((article) => (
                  <tr key={article.id}>
                    <td className="article-title-cell">{article.title}</td>
                    <td>
                      <span className={`article-status status-${article.status}`}>
                        {labels[article.status] || article.status}
                      </span>
                    </td>
                    <td className="author-muted">
                      {article.created_at
                        ? new Date(article.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthorShell>
  );
}
