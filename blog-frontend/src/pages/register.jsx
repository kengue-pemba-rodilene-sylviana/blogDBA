import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'lecteur',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractÃ¨res.');
      return;
    }

    setLoading(true);
    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.role
    );
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ---- Panneau gauche (visuel) ---- */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="auth-logo">Bookfolio</Link>
          <h2>Rejoignez notre communautÃ©.</h2>
          <p>
            Partagez vos coups de cÅ“ur littÃ©raires, dÃ©couvrez de nouvelles
            plumes et construisez votre bibliothÃ¨que personnelle.
          </p>
          <ul className="auth-benefits">
            <li>âœ¦ Publiez vos propres articles</li>
            <li>âœ¦ Commentez et Ã©changez</li>
            <li>âœ¦ Suivez vos auteurs prÃ©fÃ©rÃ©s</li>
          </ul>
        </div>
        <div className="auth-visual-decor"></div>
      </div>

      {/* ---- Panneau droit (formulaire) ---- */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>CrÃ©er un compte</h1>
            <p>Quelques secondes suffisent pour commencer</p>
          </div>

          {error && (
            <div className="auth-alert error">
              <span>âš </span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="ex : aminad"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Au moins 8 caractÃ¨res"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? 'ðŸ™ˆ' : 'ðŸ‘'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label>Je m'inscris en tant que</label>
              <div className="role-selector">
                <label className={`role-option ${formData.role === 'lecteur' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="lecteur"
                    checked={formData.role === 'lecteur'}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>Lecteur</strong>
                    <small>Lire et commenter</small>
                  </div>
                </label>
                <label className={`role-option ${formData.role === 'auteur' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="auteur"
                    checked={formData.role === 'auteur'}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>Auteur</strong>
                    <small>Publier des articles</small>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : "S'inscrire"}
            </button>
          </form>

          <p className="auth-switch">
            DÃ©jÃ  un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>

        <p className="auth-footer-note">
          Â© 2026 Bookfolio â€” Tous droits rÃ©servÃ©s
        </p>
      </div>
    </div>
  );
};

export default Register;

