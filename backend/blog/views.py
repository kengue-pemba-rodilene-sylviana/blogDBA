from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import generics, permissions, viewsets, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotAuthenticated, ValidationError, PermissionDenied
from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Article, Category, Comment, Favorite, ArticleView
from .serializers import (
    ArticleSerializer,
    ArticleViewSerializer,
    CategorySerializer,
    CommentSerializer,
    RegisterSerializer,
    FavoriteSerializer,
    UserSerializer,
    AdminUserSerializer,
    ArticleViewHistorySerializer,
)
from .mailer import send_email_via_gas


User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class PasswordResetRequestView(generics.GenericAPIView):
    """Demande un lien de réinitialisation sans révéler si l'adresse existe."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            raise ValidationError({"email": "Ce champ est obligatoire."})

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(
                settings,
                "PASSWORD_RESET_FRONTEND_URL",
                "http://localhost:5173/reset-password",
            )
            reset_url = f"{frontend_url}?uid={uid}&token={token}"

            send_email_via_gas(
                to=user.email,
                subject="Réinitialisation de votre mot de passe — Bookfolio",
                body=f"""Bonjour {user.username},

Pour choisir un nouveau mot de passe, ouvrez ce lien :
{reset_url}

Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.

— L'équipe Bookfolio""",
                html_body=f"""
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2 style="color: #7c2d12;">Bookfolio</h2>
                <p>Bonjour <strong>{user.username}</strong>,</p>
                <p>Pour choisir un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}"
                    style="background:#7c2d12;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
                    Réinitialiser mon mot de passe
                    </a>
                </p>
                <p style="color:#78716c;font-size:13px;">
                    Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
                </p>
                </div>
                """,
            )

        return Response(
            {"detail": "Si cette adresse est associée à un compte, un lien de réinitialisation a été envoyé."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """Valide le jeton envoyé par e-mail et change le mot de passe du compte."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get("uid", "")
        token = request.data.get("token", "")
        password = request.data.get("new_password", "")
        if not uid or not token or not password:
            raise ValidationError({"detail": "Les champs uid, token et new_password sont obligatoires."})

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            raise ValidationError({"token": "Le lien est invalide ou a expiré. Demandez un nouveau lien."})

        validate_password(password, user=user)
        user.set_password(password)
        user.save(update_fields=["password"])
        return Response({"detail": "Votre mot de passe a été réinitialisé."}, status=status.HTTP_200_OK)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    if request.method == 'PATCH':
        for field in ['username', 'email', 'first_name', 'last_name']:
            if field in request.data:
                setattr(u, field, request.data[field])
        try:
            u.save()
        except Exception as e:
            return Response({'detail': str(e)}, status=400)
    return Response({
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'is_staff': u.is_staff,
        'is_superuser': u.is_superuser,
        'role': getattr(u, 'role', None),
        'date_joined': u.date_joined,
    })

class IsAuthorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and (obj.author_id == request.user.id or request.user.is_staff)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthorOrReadOnly]
    search_fields = ["title", "content", "category__name"]
    ordering_fields = ["published_at", "title"]

    def get_queryset(self):
        queryset = Article.objects.select_related("author", "category").prefetch_related("comments__author")
        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise NotAuthenticated()
        serializer.save(author=self.request.user)

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsAuthenticated(), IsAuthorOrReadOnly()]


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Comment.objects.select_related("author", "article").prefetch_related("replies__author")
        article_id = self.request.query_params.get("article")
        if article_id:
            # Ne renvoyer que les racines, les réponses viendront dans "replies"
            queryset = queryset.filter(article_id=article_id, parent__isnull=True)
        return queryset

    def perform_create(self, serializer):
        article_id = self.request.data.get("article")
        if not article_id or not Article.objects.filter(pk=article_id).exists():
            raise ValidationError({"article": "Un article valide est requis."})
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author_id != self.request.user.id and not self.request.user.is_staff:
            raise PermissionDenied("Vous ne pouvez modifier que vos propres commentaires.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author_id != self.request.user.id and not self.request.user.is_staff:
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres commentaires.")
        instance.delete()
        
    
class AdminUserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,      # ← AJOUT
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def perform_update(self, serializer):
        target = serializer.instance
        data = serializer.validated_data

        # Un admin ne peut pas modifier son propre rôle / statut
        if target.id == self.request.user.id:
            if "role" in data or "is_superuser" in data or "is_staff" in data:
                raise PermissionDenied("Vous ne pouvez pas modifier votre propre rôle.")
            if "is_active" in data and not data["is_active"]:
                raise PermissionDenied("Vous ne pouvez pas désactiver votre propre compte.")

        # Synchronisation du rôle : si role="admin" → is_staff=True
        if "role" in data:
            if data["role"] == "admin":
                target.is_staff = True
                target.is_superuser = True
            else:
                target.is_staff = False
                target.is_superuser = False

        serializer.save()

class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDestroyView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class ArticleViewListCreateView(generics.ListCreateAPIView):
    serializer_class = ArticleViewHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            ArticleView.objects
            .filter(user=self.request.user)
            .select_related('article', 'article__category')
        )

    def perform_create(self, serializer):
        article = serializer.validated_data['article']
        progress = self.request.data.get('progress', 0)
        try:
            progress = max(0, min(100, int(progress)))
        except (TypeError, ValueError):
            progress = 0

        obj, _ = ArticleView.objects.update_or_create(
            user=self.request.user,
            article=article,
            defaults={'progress': progress},
        )
        serializer.instance = obj


class ArticleViewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ArticleViewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ArticleView.objects.filter(user=self.request.user)


class ArticleViewClearView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        count, _ = ArticleView.objects.filter(user=request.user).delete()
        return Response({'deleted': count}, status=status.HTTP_200_OK)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def password_change(request):
    old = request.data.get('old_password', '')
    new = request.data.get('new_password', '')

    if not old or not new:
        return Response({'detail': 'Les deux champs sont obligatoires.'}, status=400)

    if not request.user.check_password(old):
        return Response({'old_password': 'Mot de passe actuel incorrect.'}, status=400)

    try:
        validate_password(new, user=request.user)
    except DjangoValidationError as e:
        return Response({'new_password': list(e.messages)}, status=400)

    request.user.set_password(new)
    request.user.save()
    return Response({'detail': 'Mot de passe modifié avec succès.'})