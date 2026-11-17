from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Article, Category, Comment, User, Favorite, ArticleView

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_active', 'date_joined']
        read_only_fields = fields

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
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
    class Meta:
        model = Comment
        fields = ["id", "article","article_title", "author", "author_name", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "author_name", "created_at", "updated_at"]


class ArticleSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = ["id", "author", "category", "category_name", "title", "content", "image_url", "published_at", "updated_at", "comments"]
        read_only_fields = ["id", "author", "published_at", "updated_at", "comments"]

class AdminUserSerializer(serializers.ModelSerializer):
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)
    article_count = serializers.IntegerField(source='articles.count', read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "role",
            "is_active", "is_staff", "date_joined",
            "comment_count", "article_count",
        ]
        read_only_fields = fields

class FavoriteSerializer(serializers.ModelSerializer):
    article_title = serializers.CharField(source='article.title', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'article', 'article_title', 'created_at']
        read_only_fields = ['user', 'created_at']
        
class ArticleViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleView
        fields = ['id', 'article', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']
        