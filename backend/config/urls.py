from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from blog.views import (
    AdminUserViewSet,
    ArticleViewSet,
    CategoryViewSet,
    CommentViewSet,
    FavoriteDestroyView,
    FavoriteListCreateView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ArticleViewListCreateView,
    me,
    password_change,
    ArticleViewClearView,
)

router = DefaultRouter()
router.register("articles", ArticleViewSet, basename="article")
router.register("categories", CategoryViewSet, basename="category")
router.register("comments", CommentViewSet, basename="comment")
router.register("admin/users", AdminUserViewSet, basename="admin-user")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/password-reset/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("api/auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me/", me, name="me"),
    path("api/auth/password-change/", password_change, name="password_change"),
    path("api/favorites/", FavoriteListCreateView.as_view(), name="favorite-list"),
    path("api/favorites/<int:pk>/", FavoriteDestroyView.as_view(), name="favorite-detail"),
    path("api/", include(router.urls)),
    path("api/article-views/", ArticleViewListCreateView.as_view(), name="article-view-list"),
    path("api/article-views/clear/", ArticleViewClearView.as_view(), name="article-view-clear"),
    path('api/auth/password-change/', password_change, name='password_change'),
    
]