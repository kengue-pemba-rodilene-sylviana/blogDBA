import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirection automatique après succès
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/password-reset/confirm/', { uid, token, new_password: password});
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Le lien est invalide ou a expiré. Veuillez refaire la demande.'
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
          <h2>Un nouveau départ.</h2>
          <p>
            Choisissez un nouveau mot de passe sécurisé pour reprendre
            le fil de vos lectures.
          </p>
          <blockquote>
            « Tourner la page, c'est aussi recommencer. »
            <cite>— Bookfolio</cite>
          </blockquote>
        </div>
        <div className="auth-visual-decor"></div>
      </div>

      {/* ---- Panneau formulaire (droite) ---- */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {!success ? (
            <>
              <div className="auth-card-header">
                <h1>Nouveau mot de passe</h1>
                <p>Choisissez un mot de passe solide et facile à retenir.</p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="password">Nouveau mot de passe</label>
                  <div className="password-field">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Au moins 8 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Réinitialiser'}
                </button>
              </form>

              <p className="auth-switch">
                <Link to="/login">Retour à la connexion</Link>
              </p>
            </>
          ) : (
            /* ---- État de succès ---- */
            <div className="auth-success-state">
              <div className="success-icon">✅</div>
              <h1>Mot de passe modifié !</h1>
              <p>
                Votre mot de passe a été réinitialisé avec succès.
                Vous allez être redirigé vers la page de connexion...
              </p>
              <Link to="/login" className="auth-submit as-link">
                Se connecter maintenant
              </Link>
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

export default ResetPassword;