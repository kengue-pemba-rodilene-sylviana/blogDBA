# Backend du blog — Django REST Framework + PostgreSQL

Ce dossier contient uniquement le backend. Django gère l’API, l’authentification et l’accès à PostgreSQL. Les tables doivent être créées par les migrations Django.

## Important si vous avez déjà exécuté le script SQL précédent

Le projet utilise un modèle utilisateur personnalisé (`blog.User`). Il faut le prendre en compte dès la première migration Django. Pour débuter, créez une base vide `blog_db` dans pgAdmin et laissez Django créer toutes les tables. N’exécutez pas en plus l’ancien script SQL sur cette base, car les deux schémas ne sont pas identiques et risquent d’entrer en conflit.

## Installation

Dans un terminal, placez-vous dans le dossier `backend` :

```bash
python -m venv .venv
```

Activez l’environnement :

- Windows : `.venv\\Scripts\\activate`
- macOS/Linux : `source .venv/bin/activate`

Installez les paquets et préparez la configuration :

```bash
pip install -r requirements.txt
cp .env.example .env
```

Sous Windows, si `cp` n’est pas disponible, copiez `.env.example` et renommez la copie en `.env`.

Modifiez `.env` pour y mettre le mot de passe du rôle PostgreSQL choisi dans pgAdmin. Ne partagez pas ce fichier et ne le publiez pas dans Git.

## Initialiser PostgreSQL et Django

Vérifiez dans pgAdmin que la base `blog_db` existe et que l’utilisateur indiqué dans `.env` peut s’y connecter. Puis, depuis le dossier contenant `manage.py` :

```bash
python manage.py makemigrations blog
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

L’API sera disponible à `http://127.0.0.1:8000/api/` et l’administration à `http://127.0.0.1:8000/admin/`.

## Routes principales

- `POST /api/auth/register/` : créer un compte (username, email, password).
- `POST /api/auth/token/` : obtenir un access token et un refresh token (username, password).
- `POST /api/auth/token/refresh/` : renouveler l’access token.
- `GET /api/articles/` : liste publique ; paramètres `?search=mot`, `?category=ID` et `?ordering=published_at`.
- `GET /api/articles/ID/` : détail d’un article.
- `POST /api/articles/` : créer un article connecté ; le compte devient son auteur.
- `PATCH` ou `DELETE /api/articles/ID/` : réservé à l’auteur de l’article ou à un compte staff.
- `GET /api/categories/` : liste des catégories. Leur gestion se fait via `/admin/` dans cette version.
- `/api/comments/` : lire les commentaires ; création, modification et suppression nécessitent une connexion, et chaque utilisateur ne modifie/supprime que ses commentaires.

Pour les requêtes protégées, transmettre l’en-tête `Authorization: Bearer <access_token>`.

## Sécurité avant déploiement

Définissez une vraie `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, des hôtes autorisés explicites et une origine CORS frontend exacte. La configuration actuelle est destinée au développement local.
