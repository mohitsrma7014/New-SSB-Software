from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from django.contrib.auth.hashers import make_password

class RegisterUser(APIView):
    def post(self, request):
        data = request.data
        try:
            user = CustomUser.objects.create(
                username=data['username'],
                first_name=data['name'],
                last_name=data['lastname'],
                email=data['email'],
                mobile_no=data['mobile_no'],
                department=data['department'],
                profile_photo=data.get('profile_photo'),
                password=make_password(data['password']),
            )
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

class LoginUser(APIView):
    def post(self, request):
        csrf_token = request.headers.get('X-CSRFToken')
        print(f"Received CSRF Token: {csrf_token}")
        data = request.data
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user:
            # Generate JWT token pair
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Log the Authorization header to check if it's being received
        print('Authorization Header:', request.headers.get('Authorization'))
        user = request.user
        return Response({
            'username': user.username,
            'name': user.first_name,
            'lastname': user.last_name,
            'mobile': user.mobile_no,
            'email': user.email,
            'department': user.department,
            'profile_photo': user.profile_photo.url if user.profile_photo else None,
        })


from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

class CsrfTokenView(APIView):
    def get(self, request):
        csrf_token = get_token(request)
        
        # Create a response object
        response = JsonResponse({'csrfToken': csrf_token})

        # Explicitly set the CSRF token cookie
        response.set_cookie(
            'csrftoken', csrf_token,
            max_age=60*60*24*365,  # One year expiration
            expires=None,  # Browser session expiration
            secure=False,  # Set to True in production with HTTPS
            httponly=False,  # Allow access to cookie via JavaScript
            samesite='None',  # This is necessary for cross-origin requests
        )
        
        return response
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get refresh token from the request body
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=400)

            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logout successful"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework.exceptions import PermissionDenied


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure the user is from the IT department
        if request.user.department != 'IT':
            raise PermissionDenied("You are not authorized to view this list.")

        users = CustomUser.objects.all()
        user_data = CustomUserSerializer(users, many=True).data
        return Response(user_data)

    def put(self, request, pk):
        # Ensure the user is from the IT department
        if request.user.department != 'IT':
            raise PermissionDenied("You are not authorized to update user details.")

        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Assuming you have a serializer for updating user details
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Ensure the user is from the IT department
        if request.user.department != 'IT':
            raise PermissionDenied("You are not authorized to view this user.")

        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CustomUserSerializer(user)
        return Response(serializer.data)


from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = request.data
    
    old_password = data.get("old_password")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")
    
    print(f"Authenticated User: {user.username}")  # Debugging
    print(f"Received old password: {old_password}")  # Debugging
    
    user.refresh_from_db()  # Ensure fresh data from database
    
    if not user.check_password(old_password):
        print("Password check failed")  # Debugging
        return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({"error": "New passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 8:
        return Response({"error": "New password must be at least 8 characters long"}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)



import random
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.cache import cache  # To store OTP temporarily
from twilio.rest import Client  # Replace with your SMS gateway

User = get_user_model()

# Twilio credentials (Replace with your own)
TWILIO_ACCOUNT_SID = "ACed9c66a6794fbf7f54548972e9d41d6a"
TWILIO_AUTH_TOKEN = "4d59a513db9a49de68d40662bad0e14f"
TWILIO_PHONE_NUMBER = "+16206369866"


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        mobile_no = request.data.get("mobile_no")
        if not mobile_no:
            return Response({"error": "Mobile number is required"}, status=status.HTTP_400_BAD_REQUEST)

        otp = random.randint(100000, 999999)  # Generate a 6-digit OTP
        cache.set(mobile_no, otp, timeout=300)  # Store OTP for 5 minutes

        # Send OTP via Twilio
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your verification OTP is {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=mobile_no
        )

        return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        mobile_no = request.data.get("mobile_no")
        otp_received = request.data.get("otp")

        if not mobile_no or not otp_received:
            return Response({"error": "Mobile number and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        stored_otp = cache.get(mobile_no)

        if stored_otp and int(otp_received) == stored_otp:
            cache.delete(mobile_no)  # OTP verified, remove from cache
            return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)


class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        mobile_no = request.data.get("mobile_no")

        if not (username and first_name and last_name and mobile_no):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

        if not cache.get(mobile_no):  # Ensure OTP verification happened
            return Response({"error": "Phone number not verified"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            first_name=first_name,
            last_name=last_name,
            mobile_no=mobile_no,
        )
        user.set_password("defaultpassword")  # Set a default password or prompt the user to create one later
        user.save()

        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
