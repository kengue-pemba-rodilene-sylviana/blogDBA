// src/hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]); // ids d'articles favoris
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/favorites/')
      .then((res) => setFavorites(res.data.map((f) => f.article)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const toggleFavorite = useCallback(async (articleId) => {
    const isFav = favorites.includes(articleId);
    // Optimistic UI
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
    try {
      if (isFav) {
        // On doit retrouver l'id du Favorite, pas celui de l'article
        const res = await api.get('/favorites/');
        const fav = res.data.find((f) => f.article === articleId);
        if (fav) await api.delete(`/favorites/${fav.id}/`);
      } else {
        await api.post('/favorites/', { article: articleId });
      }
    } catch (e) {
      console.error(e);
      // rollback
      setFavorites((prev) =>
        isFav ? [...prev, articleId] : prev.filter((id) => id !== articleId)
      );
    }
  }, [favorites]);

  return { favorites, loading, toggleFavorite };
};