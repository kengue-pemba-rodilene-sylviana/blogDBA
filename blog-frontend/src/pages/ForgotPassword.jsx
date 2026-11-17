import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/password-reset/', { email });
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Impossible d'envoyer l'email. Vérifiez votre adresse et réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ---- Panneau visuel (gauche) ---- */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="auth-logo"> Bookfolio</Link>
          <h2>Pas de panique.</h2>
          <p>
            Cela arrive à tout le monde d'oublier un mot de passe.
            Nous allons vous aider à retrouver l'accès à votre bibliothèque.
          </p>
          <blockquote>
            « Chaque lecteur a le droit à une seconde chance. »
            <cite>— Bookfolio</cite>
          </blockquote>
        </div>
        <div className="auth-visual-decor"></div>
      </div>

      {/* ---- Panneau formulaire (droite) ---- */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {!sent ? (
            <>
              <div className="auth-card-header">
                <h1>Mot de passe oublié ?</h1>
                <p>
                  Entrez l'adresse email associée à votre compte.
                  Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Adresse email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Envoyer le lien'}
                </button>
              </form>

              <div className="auth-divider">
                <span>ou</span>
              </div>

              <p className="auth-switch">
                Vous vous en souvenez ?{' '}
                <Link to="/login">Retour à la connexion</Link>
              </p>
            </>
          ) : (
            /* ---- État "email envoyé" ---- */
            <div className="auth-success-state">
              <div className="success-icon">✉️</div>
              <h1>Email envoyé !</h1>
              <p>
                Si un compte est associé à <strong>{email}</strong>,
                vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="success-hint">
                Pensez à vérifier votre dossier « spam » ou « courrier indésirable ».
              </p>

              <Link to="/login" className="auth-submit as-link">
                Retour à la connexion
              </Link>

              <button
                type="button"
                className="resend-btn"
                onClick={() => setSent(false)}
              >
                Renvoyer l'email
              </button>
            </div>
          )}
        </div>

        <p className="auth-footer-note">
          © 2026 Bookfolio — Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
