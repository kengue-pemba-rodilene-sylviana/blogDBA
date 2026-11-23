import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AuthorShell from "./AuthorShell";
import { IconEdit, IconPlus } from "./AuthorIcons";
import "./AuthorDashboard.css";

export default function Drafts() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = async () => {
    try {
      const res = await api.get("/articles/mine/");
      const data = res.data;
      const all = Array.isArray(data) ? data : data.results || [];
      setArticles(all.filter((article) => article.status === "draft"));
    } catch (error) {
      console.error("Erreur chargement brouillons :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const submitArticle = async (id) => {
    try {
      await api.post(`/articles/${id}/submit/`);
      await loadDrafts();
    } catch (error) {
      alert(error.response?.data?.detail || "Erreur lors de la soumission.");
    }
  };

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Mes publications</span>
          <h1>Mes <span className="author-accent">brouillons</span></h1>
        </div>
        <Link className="author-button" to="/auteur/nouvel-article">
          <IconPlus size={16} /> Nouvel article
        </Link>
      </div>

      <section className="author-content-card">
        {loading ? (
          <p className="author-empty">Chargement des brouillons...</p>
        ) : articles.length === 0 ? (
          <div className="author-empty">
            <div className="author-empty-icon"><IconEdit size={26} /></div>
            <h3>Aucun brouillon</h3>
            <p>Les articles enregistrés sans soumission apparaîtront ici.</p>
          </div>
        ) : (
          <div className="author-table-wrapper">
            <table className="author-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Dernière modification</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="article-title-cell">{article.title}</td>
                    <td className="author-muted">
                      {article.updated_at
                        ? new Date(article.updated_at).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="author-button author-button-sm"
                        onClick={() => submitArticle(article.id)}
                      >
                        Soumettre
                      </button>
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
