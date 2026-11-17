from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Article, Category, Comment, User


@admin.register(User)
class BlogUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Rôle blog", {"fields": ("role",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Informations", {"fields": ("email", "role")}),)
    list_display = ["username", "email", "role", "is_staff", "is_active"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_at"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "category", "published_at"]
    list_filter = ["category", "published_at"]
    search_fields = ["title", "content"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["article", "author", "created_at"]
    search_fields = ["content"]
