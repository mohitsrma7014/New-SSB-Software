from django.urls import path
from .views import RegisterUser, LoginUser, UserDetails,CsrfTokenView,UserListView, UserDetailsView,LogoutView,change_password,SendOTPView,VerifyOTPView,RegisterUserView

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginUser.as_view(), name='login'),
    path('user-details/', UserDetails.as_view(), name='user-details'),
    path('csrf/', CsrfTokenView.as_view(), name='csrf_token'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('user/<int:pk>/', UserDetailsView.as_view(), name='user-detail'),
    path('user/<int:pk>/update/', UserListView.as_view(), name='user-update'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change_password/', change_password, name='change_password'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('register/', RegisterUserView.as_view(), name='register'),
]
