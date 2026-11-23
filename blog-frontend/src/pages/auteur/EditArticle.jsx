import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import AuthorShell from './AuthorShell';
import './AuthorDashboard.css';
import './CreateArticle.css';

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState({
    title: '',
    category: '',
    content: '',
    image_url: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articleRes, categoryRes] = await Promise.all([
          api.get(`/articles/${id}/`),
          api.get('/categories/')
        ]);

        const data = articleRes.data;
        if (!['draft', 'rejected'].includes(data.status)) {
          setError("Cet article ne peut plus être modifié.");
          return;
        }

        setArticle({
          title: data.title || '',
          category: data.category || '',
          content: data.content || '',
          image_url: data.image_url || ''
        });

        setCategories(categoryRes.data.results || categoryRes.data);
      } catch {
        setError("Impossible de charger l'article.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    setArticle({ ...article, [e.target.name]: e.target.value });
  };

  const handleSave = async (submit = false) => {
    try {
      setError('');

      const response = await api.patch(`/articles/${id}/`, {
        ...article,
        category: Number(article.category)
      });

      if (submit) {
        await api.post(`/articles/${id}/submit/`);
      }

      alert(submit ? 'Article soumis pour validation.' : 'Modifications enregistrées.');
      navigate('/auteur/articles');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Erreur lors de l'enregistrement de l'article."
      );
    }
  };

  if (loading) {
    return (
      <AuthorShell>
        <p className="author-empty">Chargement...</p>
      </AuthorShell>
    );
  }

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Rédaction</span>
          <h1>Modifier l'<span className="author-accent">article</span></h1>
        </div>
      </div>

      {error && <p className="author-error error-message">{error}</p>}

      <form className="author-form" onSubmit={(e) => { e.preventDefault(); handleSave(false); }}>
        <div className="author-field">
          <label htmlFor="title">Titre</label>
          <input
            id="title"
            name="title"
            value={article.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="author-form-row">
          <div className="author-field">
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              name="category"
              value={article.category}
              onChange={handleChange}
              required
            >
              <option value="">Choisir une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="author-field">
            <label htmlFor="image_url">URL de l'image</label>
            <input
              id="image_url"
              name="image_url"
              value={article.image_url}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="author-field">
          <label htmlFor="content">Contenu</label>
          <textarea
            id="content"
            name="content"
            value={article.content}
            onChange={handleChange}
            rows="12"
            required
          />
        </div>

        <div className="author-actions">
          <button type="submit" className="author-button">Enregistrer</button>
          <button type="button" className="author-button author-button-secondary" onClick={() => handleSave(true)}>
            Enregistrer et soumettre
          </button>
          <button type="button" className="author-button author-button-secondary" onClick={() => navigate('/auteur/articles')}>
            Annuler
          </button>
        </div>
      </form>
    </AuthorShell>
  );
}
