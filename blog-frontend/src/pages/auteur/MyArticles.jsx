import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AuthorShell from "./AuthorShell";
import { IconFile, IconPlus } from "./AuthorIcons";
import "./AuthorDashboard.css";

export default function MyArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticles = async () => {
    try {
      const res = await api.get("/articles/mine/");
      const data = res.data;
      setArticles(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const submitArticle = async (id) => {
    if (!window.confirm("Soumettre cet article pour validation ?")) return;

    try {
      await api.post(`/articles/${id}/submit/`);
      await loadArticles();
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de soumettre cet article.");
    }
  };

  const labels = {
    draft: "Brouillon",
    pending: "En attente",
    published: "Publié",
    rejected: "Refusé",
  };

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Mes publications</span>
          <h1>Mes <span className="author-accent">articles</span></h1>
        </div>
        <Link className="author-button" to="/auteur/nouvel-article">
          <IconPlus size={16} /> Nouvel article
        </Link>
      </div>

      {error && <div className="author-error">{error}</div>}

      <section className="author-content-card">
        {loading ? (
          <p className="author-empty">Chargement...</p>
        ) : articles.length === 0 ? (
          <div className="author-empty">
            <div className="author-empty-icon"><IconFile size={26} /></div>
            <h3>Aucun article enregistré</h3>
            <p>Créez votre premier article pour commencer.</p>
            <Link className="author-button" to="/auteur/nouvel-article">
              Créer un article
            </Link>
          </div>
        ) : (
          <div className="author-table-wrapper">
            <table className="author-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Dernière modification</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="article-title-cell">{article.title}</td>
                    <td>
                      <span className={`article-status status-${article.status}`}>
                        {labels[article.status] || article.status}
                      </span>
                      {article.status === "rejected" && article.review_note && (
                        <p className="author-review-note">
                          Motif : {article.review_note}
                        </p>
                      )}
                    </td>
                    <td className="author-muted">
                      {article.updated_at
                        ? new Date(article.updated_at).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      {(article.status === "draft" || article.status === "rejected") && (
                        <button
                          className="author-button author-button-sm"
                          onClick={() => submitArticle(article.id)}
                        >
                          Soumettre
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AuthorShell>
  );
}
