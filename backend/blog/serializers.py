from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Article, Category, Comment, User, Favorite, ArticleView

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined'
        ]
        read_only_fields = fields

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.READER
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "role"
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    
class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class CategorySerializer(serializers.ModelSerializer):
    articles_count = serializers.IntegerField(source='articles.count', read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "articles_count", "created_at"]
        read_only_fields = ["id", "articles_count", "created_at"]  


class CommentSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)
    author_name = serializers.CharField(source="author.username", read_only=True)
    article_title = serializers.CharField(source="article.title", read_only=True)
    replies = serializers.SerializerMethodField()          # ← AJOUT

    class Meta:
        model = Comment
        fields = [
            "id", "article", "article_title",
            "parent",
            "author", "author_name",
            "content", "created_at", "updated_at",
            "replies",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at", "replies"]

    def get_replies(self, obj):
        # Ne sérialiser que les réponses de premier niveau
        replies = obj.replies.all().order_by("created_at")
        return CommentSerializer(replies, many=True, context=self.context).data


class ArticleSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            "id",
            "author",
            "category",
            "category_name",
            "title",
            "content",
            "image_url",
            "status",
            "submitted_at",
            "reviewed_at",
            "review_note",
            "published_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = [
            "id",
            "author",
            "status",
            "submitted_at",
            "reviewed_at",
            "review_note",
            "published_at",
            "updated_at",
            "comments",
        ]

class AdminUserSerializer(serializers.ModelSerializer):
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)
    article_count = serializers.IntegerField(source='articles.count', read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email",
            "first_name", "last_name",
            "role", "is_active", "is_staff", "is_superuser",
            "date_joined",
            "comment_count", "article_count",
        ]
        read_only_fields = ["id", "date_joined", "comment_count", "article_count"]
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
        }

class FavoriteSerializer(serializers.ModelSerializer):
    article_title = serializers.CharField(source='article.title', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'article', 'article_title', 'created_at']
        read_only_fields = ['user', 'created_at']
        

class ArticleViewSerializer(serializers.ModelSerializer):
    """Utilisé pour enregistrer une lecture (POST)."""

    class Meta:
        model = ArticleView
        fields = ['id', 'article', 'viewed_at', 'progress']
        read_only_fields = ['id', 'viewed_at']


class ArticleViewHistorySerializer(serializers.ModelSerializer):
    """Utilisé pour afficher l'historique (GET)."""

    article_title = serializers.CharField(
        source='article.title',
        read_only=True
    )

    article_image = serializers.CharField(
        source='article.image_url',
        read_only=True,
        allow_null=True
    )

    category_name = serializers.CharField(
        source='article.category.name',
        read_only=True,
        allow_null=True
    )

    category_slug = serializers.CharField(
        source='article.category.slug',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = ArticleView
        fields = [
            'id',
            'article',
            'article_title',
            'article_image',
            'category_name',
            'category_slug',
            'viewed_at',
            'progress',
        ]
        read_only_fields = [
            'id',
            'article_title',
            'article_image',
            'category_name',
            'category_slug',
            'viewed_at',
        ]
