import { useEffect, useState } from "react";
import api from "../../api/axios";
import AuthorShell from "./AuthorShell";
import { IconClock } from "./AuthorIcons";
import "./AuthorDashboard.css";

export default function PendingArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    try {
      const res = await api.get("/articles/mine/");
      const data = res.data;
      const all = Array.isArray(data) ? data : data.results || [];

      setArticles(
        all.filter((article) =>
          ["pending", "rejected"].includes(article.status)
        )
      );
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const resubmitArticle = async (id) => {
    try {
      await api.post(`/articles/${id}/submit/`);
      await loadArticles();
    } catch (error) {
      alert(error.response?.data?.detail || "Impossible de soumettre cet article.");
    }
  };

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Modération</span>
          <h1>Suivi des <span className="author-accent">validations</span></h1>
        </div>
      </div>

      <section className="author-content-card">
        {loading ? (
          <p className="author-empty">Chargement...</p>
        ) : articles.length === 0 ? (
          <div className="author-empty">
            <div className="author-empty-icon"><IconClock size={26} /></div>
            <h3>Aucun article à suivre</h3>
            <p>Vos articles soumis apparaîtront ici.</p>
          </div>
        ) : (
          <div className="author-table-wrapper">
            <table className="author-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Motif du refus</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="article-title-cell">{article.title}</td>
                    <td>
                      <span className={`article-status status-${article.status}`}>
                        {article.status === "pending" ? "En attente" : "Refusé"}
                      </span>
                    </td>
                    <td className="author-muted">
                      {article.status === "rejected"
                        ? article.review_note || "Aucun motif communiqué"
                        : "—"}
                    </td>
                    <td>
                      {article.status === "rejected" && (
                        <button
                          className="author-button author-button-sm"
                          onClick={() => resubmitArticle(article.id)}
                        >
                          Soumettre à nouveau
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
