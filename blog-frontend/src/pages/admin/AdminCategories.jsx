import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { name: '', slug: '' };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories/')
      .then((r) => setCategories(r.data))
      .catch(() => setError('Impossible de charger les catégories.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Slug auto à partir du nom
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm({ ...form, name, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = { name: form.name.trim(), slug: form.slug.trim() };

    try {
      if (editingId) {
        const res = await api.patch(`/categories/${editingId}/`, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? res.data : c))
        );
      } else {
        const res = await api.post('/categories/', payload);
        setCategories((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setForm(emptyForm);
      setEditingId(null);
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

  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug });
    setEditingId(cat.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie « ${cat.name} » ? Les articles associés n'auront plus de catégorie.`)) return;
    try {
      await api.delete(`/categories/${cat.id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch {
      alert('Impossible de supprimer cette catégorie.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Catégories</h1>
        <p>Gérez les catégories utilisées pour classer les articles.</p>
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

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{
        background: '#fafaf9',
        border: '1px solid #e7e5e4',
        borderRadius: 10,
        padding: 20,
        marginBottom: 32,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>
          {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Ex : Réflexion, Astuces…"
              value={form.name}
              onChange={handleNameChange}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="slug">Slug (URL)</label>
            <input
              id="slug"
              name="slug"
              type="text"
              className="form-input"
              placeholder="reflexion"
              value={form.slug}
              onChange={handleChange}
              required
              maxLength={120}
            />
            <p className="form-hint">Généré automatiquement, modifiable.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer la catégorie'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Tableau */}
      <div className="data-table-wrapper">
        {loading ? (
          <div className="empty-state"><p>Chargement…</p></div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <p>Aucune catégorie pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Nom</th>
                <th>Slug</th>
                <th style={{ width: 140 }}>Articles</th>
                <th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="muted">{cat.id}</td>
                  <td><strong>{cat.name}</strong></td>
                  <td className="muted"><code>{cat.slug}</code></td>
                  <td className="muted">{cat.articles_count ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(cat)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(cat)}
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

export default AdminCategories;