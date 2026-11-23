import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AuthorShell from "./AuthorShell";
import "./AuthorDashboard.css";
import "./CreateArticle.css";

export default function CreateArticle() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/categories/")
      .then((res) => {
        const data = res.data;
        setCategories(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => console.error("Erreur catégories :", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, submitForReview = false) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/articles/", form);
      const articleId = response.data.id;

      if (submitForReview) {
        await api.post(`/articles/${articleId}/submit/`);
        setMessage("Article soumis à l'administrateur !");
      } else {
        setMessage("Article enregistré dans vos brouillons !");
      }

      setTimeout(() => navigate("/auteur/articles"), 1000);
    } catch (error) {
      console.error(error.response?.data || error);
      setMessage(
        error.response?.data?.detail ||
        "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Publication</span>
          <h1>Créer un <span className="author-accent">article</span></h1>
          <p>Rédigez votre texte, enregistrez-le en brouillon ou soumettez-le pour validation.</p>
        </div>
      </div>

      <form className="author-form create-article-form">
        <div className="author-field">
          <label htmlFor="title">Titre de l'article</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Saisissez le titre..."
            required
          />
        </div>

        <div className="author-form-row">
          <div className="author-field">
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              name="category"
              value={form.category}
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
            <label htmlFor="image_url">Image (URL)</label>
            <input
              id="image_url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="author-field">
          <label htmlFor="content">Contenu de l'article</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Rédigez votre article..."
            rows="12"
            required
          />
        </div>

        {message && <p className="create-message">{message}</p>}

        <div className="author-actions create-actions">
          <button
            type="button"
            className="author-button author-button-secondary"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
          >
            Enregistrer le brouillon
          </button>
          <button
            type="button"
            className="author-button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
          >
            Soumettre pour validation
          </button>
        </div>
      </form>
    </AuthorShell>
  );
}
