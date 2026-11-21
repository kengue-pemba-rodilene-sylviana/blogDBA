import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { IconAlert } from './AdminIcons';

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    content: '',
    image_url: '',
    category: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Charge les catégories (toujours) + l'article (si édition)
  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data)).catch(() => {});

    if (isEdit) {
      api.get(`/articles/${id}/`)
        .then(r => setForm({
          title: r.data.title || '',
          content: r.data.content || '',
          image_url: r.data.image_url || '',
          category: r.data.category || '',
        }))
        .catch(() => setError("Impossible de charger l'article."))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      image_url: form.image_url.trim(),
      category: form.category || null,
    };

    try {
      if (isEdit) {
        await api.patch(`/articles/${id}/`, payload);
      } else {
        await api.post('/articles/', payload);
      }
      navigate('/admin/articles');
    } catch (err) {
      const data = err.response?.data;
      let msg = "Erreur lors de l'enregistrement.";
      if (data && typeof data === 'object') {
        const k = Object.keys(data)[0];
        const v = data[k];
        msg = Array.isArray(v) ? v[0] : v;
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
        <h1>{isEdit ? "Modifier l'article" : 'Nouvel article'}</h1>
        <p>
          {isEdit
            ? "Mettez à jour le contenu et les informations de l'article."
            : 'Rédigez et publiez un nouvel article sur Bookfolio.'}
        </p>
      </div>

      {error && <div className="alert alert-error"><IconAlert size={18} /> {error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        {/* Titre */}
        <div className="form-group">
          <label htmlFor="title">Titre</label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-input"
            placeholder="Un titre clair et accrocheur"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={250}
          />
          <p className="form-hint">{form.title.length}/250 caractères</p>
        </div>

        {/* Catégorie + Image */}
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">— Aucune catégorie —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="form-hint">Optionnel. Modifiable plus tard.</p>
          </div>

          <div className="form-group">
            <label htmlFor="image_url">Image (URL)</label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={form.image_url}
              onChange={handleChange}
            />
            <p className="form-hint">URL d'une image hébergée (Unsplash, etc.).</p>
          </div>
        </div>

        {/* Contenu */}
        <div className="form-group">
          <label htmlFor="content">Contenu</label>
          <textarea
            id="content"
            name="content"
            className="form-textarea"
            placeholder="Rédigez votre article…"
            value={form.content}
            onChange={handleChange}
            required
            style={{ minHeight: 280 }}
          />
          <p className="form-hint">{form.content.length} caractères</p>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : "Publier l'article"}
          </button>
          <Link to="/admin/articles" className="btn btn-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </>
  );
};

export default ArticleForm;