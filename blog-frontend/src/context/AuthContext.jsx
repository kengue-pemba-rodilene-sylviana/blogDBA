import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Au chargement, on vérifie si un token existe déjà
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/token/', { username, password });
      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);

      // Récupération du profil
      let currentUser = { username };
      try {
        const me = await api.get('/auth/me/', {
          headers: { Authorization: `Bearer ${access}` },
        });
        currentUser = me.data;
      } catch (meError) {
        console.warn('Endpoint /auth/me/ indisponible', meError);
      }

      localStorage.setItem('user', JSON.stringify(currentUser));
      setUser(currentUser);

      // Redirection selon le rôle
      if (currentUser.is_superuser || currentUser.role === 'admin') {
        navigate('/admin');
      } 
      else if (currentUser.role === 'reader') {
        navigate('/lecteur');
      } 
      else {
        navigate('/');
      }

      return { success: true };
    } catch (error) {
      const data = error.response?.data;
      let message = "Identifiants incorrects";
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      return { success: false, message };
    }
  };

  // Fonction d'inscription
  const register = async (username, email, password, role) => {
    try {
      await api.post('/auth/register/', { username, email, password, role });
      navigate('/login');
      return { success: true };
    } catch (error) {
      const data = error.response?.data;
      let message = "Erreur d'inscription";
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      return { success: false, message };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);