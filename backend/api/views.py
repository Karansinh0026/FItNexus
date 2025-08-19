from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from .models import User, Gym, Member, Attendance, Exercise, WorkoutSession, WorkoutExercise, Streak, ExerciseEntry
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer, GymSerializer,
    MemberSerializer, AttendanceSerializer, ExerciseSerializer, WorkoutSessionSerializer,
    StreakSerializer, DashboardStatsSerializer, ExerciseEntrySerializer
)
from rest_framework import serializers


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                
                # If user is an admin, create their gym
                if user.role == 'admin':
                    gym_data = {
                        'name': request.data.get('gym_name'),
                        'address': request.data.get('gym_address'),
                        'phone': request.data.get('gym_phone'),
                        'email': request.data.get('gym_email'),
                        'description': request.data.get('gym_description', '')
                    }
                    
                    # Validate gym data
                    required_fields = ['name', 'address', 'phone', 'email']
                    for field in required_fields:
                        if not gym_data.get(field):
                            user.delete()  # Clean up user if gym creation fails
                            return Response({
                                "error": f"Gym {field} is required for gym owner registration"
                            }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Check if gym name already exists
                    if Gym.objects.filter(name=gym_data['name']).exists():
                        user.delete()  # Clean up user if gym creation fails
                        return Response({
                            "error": "A gym with this name already exists"
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Create the gym
                    gym = Gym.objects.create(
                        name=gym_data['name'],
                        address=gym_data['address'],
                        phone=gym_data['phone'],
                        email=gym_data['email'],
                        description=gym_data['description'],
                        owner=user
                    )
                
                refresh = RefreshToken.for_user(user)
                response_data = {
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                
                # Add gym info to response if created
                if user.role == 'admin':
                    response_data['gym'] = {
                        'id': gym.id,
                        'name': gym.name,
                        'address': gym.address,
                        'phone': gym.phone,
                        'email': gym.email,
                        'description': gym.description
                    }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"message": "Error logging out"}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GymListCreateView(generics.ListCreateAPIView):
    queryset = Gym.objects.all()
    serializer_class = GymSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GymDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Gym.objects.all()
    serializer_class = GymSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'DELETE']:
            return [permissions.IsAuthenticated]
        return [permissions.IsAuthenticated]


class MemberListCreateView(generics.ListCreateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Member.objects.filter(gym__owner=self.request.user)
        elif self.request.user.role == 'member':
            return Member.objects.filter(user=self.request.user)
        return Member.objects.none()
    
    def perform_create(self, serializer):
        gym_id = self.request.data.get('gym')
        gym = Gym.objects.get(id=gym_id)
        serializer.save(user=self.request.user, gym=gym)


class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]


class AttendanceListCreateView(generics.ListCreateAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Attendance.objects.filter(member__gym__owner=self.request.user)
        elif self.request.user.role == 'member':
            return Attendance.objects.filter(member__user=self.request.user)
        return Attendance.objects.none()
    
    def perform_create(self, serializer):
        try:
            member = Member.objects.get(user=self.request.user)
            
            # Check if attendance already exists for today
            today = timezone.now().date()
            existing_attendance = Attendance.objects.filter(
                member=member,
                date=today
            ).first()
            
            if existing_attendance:
                raise serializers.ValidationError("Attendance already marked for today.")
            
            serializer.save(member=member)
            self.update_streak(member)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Member profile not found. Please contact your gym administrator.")
    
    def update_streak(self, member):
        streak, created = Streak.objects.get_or_create(member=member)
        today = timezone.now().date()
        
        if not streak.last_workout_date:
            streak.current_streak = 1
            streak.last_workout_date = today
        elif streak.last_workout_date == today - timedelta(days=1):
            streak.current_streak += 1
            streak.last_workout_date = today
        elif streak.last_workout_date == today:
            pass  # Already worked out today
        else:
            streak.current_streak = 1
            streak.last_workout_date = today
        
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
        
        streak.save()


class ExerciseListView(generics.ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Exercise.objects.all()
        name = self.request.query_params.get('name', None)
        body_part = self.request.query_params.get('body_part', None)
        level = self.request.query_params.get('level', None)
        
        if name:
            queryset = queryset.filter(name__icontains=name)
        if body_part:
            queryset = queryset.filter(body_part__icontains=body_part)
        if level:
            queryset = queryset.filter(level=level)
        
        return queryset


class ExerciseEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = ExerciseEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return ExerciseEntry.objects.filter(member__gym__owner=self.request.user)
        elif self.request.user.role == 'member':
            return ExerciseEntry.objects.filter(member__user=self.request.user)
        return ExerciseEntry.objects.none()
    
    def perform_create(self, serializer):
        try:
            member = Member.objects.get(user=self.request.user)
            serializer.save(member=member)
            
            # Update streak when exercise is logged
            self.update_streak(member)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Member profile not found. Please contact your gym administrator.")
    
    def update_streak(self, member):
        streak, created = Streak.objects.get_or_create(member=member)
        today = timezone.now().date()
        
        if not streak.last_workout_date:
            streak.current_streak = 1
            streak.last_workout_date = today
        elif streak.last_workout_date == today - timedelta(days=1):
            streak.current_streak += 1
            streak.last_workout_date = today
        elif streak.last_workout_date == today:
            pass  # Already worked out today
        else:
            streak.current_streak = 1
            streak.last_workout_date = today
        
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
        
        streak.save()


class ExerciseEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExerciseEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return ExerciseEntry.objects.filter(member__gym__owner=self.request.user)
        elif self.request.user.role == 'member':
            return ExerciseEntry.objects.filter(member__user=self.request.user)
        return ExerciseEntry.objects.none()


class WorkoutSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return WorkoutSession.objects.filter(member__gym__owner=self.request.user)
        elif self.request.user.role == 'member':
            return WorkoutSession.objects.filter(member__user=self.request.user)
        return WorkoutSession.objects.none()
    
    def perform_create(self, serializer):
        member = Member.objects.get(user=self.request.user)
        serializer.save(member=member)


class StreakListView(generics.ListAPIView):
    serializer_class = StreakSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Streak.objects.filter(member__gym__owner=self.request.user).order_by('-current_streak')
        elif self.request.user.role == 'member':
            return Streak.objects.filter(member__user=self.request.user)
        return Streak.objects.none()


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        print(f"User: {user.username}, Role: {user.role}")
        
        if user.role == 'admin':
            print("Processing admin dashboard...")
            # Check if user owns a gym
            try:
                gym = Gym.objects.filter(owner=user).first()
                if gym:
                    # This is a gym owner
                    print(f"User owns gym: {gym.name}")
                    
                    # Get gym members
                    members = Member.objects.filter(gym=gym, is_active=True)
                    total_members = members.count()
                    active_members = members.count()
                    
                    # Calculate attendance rate
                    total_attendance = Attendance.objects.filter(member__gym=gym).count()
                    avg_attendance_rate = round((total_attendance / max(total_members, 1)) * 100, 2) if total_members > 0 else 0
                    
                    # Get top members by streak
                    top_members = []
                    for member in members:
                        streak, created = Streak.objects.get_or_create(member=member)
                        top_members.append({
                            'username': member.user.username,
                            'longest_streak': streak.longest_streak,
                            'current_streak': streak.current_streak
                        })
                    
                    # Sort by longest streak
                    top_members.sort(key=lambda x: x['longest_streak'], reverse=True)
                    top_members = top_members[:5]  # Top 5
                    
                    stats = {
                        'total_members': total_members,
                        'active_members': active_members,
                        'avg_attendance_rate': avg_attendance_rate,
                        'top_members': top_members,
                        'gym_info': {
                            'id': gym.id,
                            'name': gym.name,
                            'address': gym.address,
                            'phone': gym.phone,
                            'email': gym.email,
                            'description': gym.description
                        }
                    }
                    
                    print(f"Gym owner stats: {stats}")
                    return Response(stats)
                else:
                    # Admin user without a gym (shouldn't happen in normal cases)
                    print("Admin user has no gym")
                    return Response({"error": "No gym found for this admin user"}, status=status.HTTP_404_NOT_FOUND)
                    
            except Exception as e:
                print(f"Error in admin dashboard: {e}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        elif user.role == 'member':
            # Check if user is enrolled in a gym
            try:
                member = Member.objects.get(user=user, is_active=True)
                gym = member.gym
                
                # Get user's streak
                streak, created = Streak.objects.get_or_create(member=member)
                
                # Get recent exercise entries
                recent_workouts = ExerciseEntry.objects.filter(member=member).order_by('-date')[:5]
                recent_workouts_data = []
                for workout in recent_workouts:
                    recent_workouts_data.append({
                        'exercise_name': workout.exercise_name,
                        'date': workout.date,
                        'calories_burned': workout.calories_burned,
                        'duration': workout.duration
                    })
                
                stats = {
                    'current_streak': streak.current_streak,
                    'longest_streak': streak.longest_streak,
                    'total_workouts': ExerciseEntry.objects.filter(member=member).count(),
                    'total_calories': ExerciseEntry.objects.filter(member=member).aggregate(
                        total_calories=Sum('calories_burned')
                    )['total_calories'] or 0,
                    'recent_workouts': recent_workouts_data,
                    'gym_info': {
                        'id': gym.id,
                        'name': gym.name,
                        'address': gym.address,
                        'phone': gym.phone,
                        'email': gym.email
                    }
                }
                
                return Response(stats)
                
            except Member.DoesNotExist:
                # User is not enrolled in any gym
                return Response({'not_enrolled': True}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response({'error': 'Invalid user role'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leaderboard(request):
    """Get leaderboard for longest streaks"""
    try:
        if request.user.role == 'admin':
            # Admin sees all members from their gyms
            streaks = Streak.objects.filter(
                member__gym__owner=request.user
            ).select_related('member__user').order_by('-longest_streak')[:10]
        else:
            # Members see all members from their gym
            try:
                member = Member.objects.get(user=request.user)
                streaks = Streak.objects.filter(
                    member__gym=member.gym
                ).select_related('member__user').order_by('-longest_streak')[:10]
            except Member.DoesNotExist:
                # If member doesn't exist, return empty leaderboard
                return Response([])
        
        leaderboard_data = []
        for i, streak in enumerate(streaks, 1):
            leaderboard_data.append({
                'rank': i,
                'username': streak.member.user.username,
                'longest_streak': streak.longest_streak,
                'current_streak': streak.current_streak
            })
        
        return Response(leaderboard_data)
    except Exception as e:
        print(f"Leaderboard error: {e}")
        return Response([], status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_attendance_today(request):
    """Check if attendance has been marked for today"""
    try:
        if request.user.role != 'member':
            return Response({"error": "Only members can check attendance"}, status=status.HTTP_403_FORBIDDEN)
        
        member = Member.objects.get(user=request.user)
        today = timezone.now().date()
        
        existing_attendance = Attendance.objects.filter(
            member=member,
            date=today
        ).first()
        
        return Response({
            "attendance_marked": existing_attendance is not None,
            "attendance_time": existing_attendance.check_in_time.isoformat() if existing_attendance else None
        })
    except Member.DoesNotExist:
        return Response({"error": "Member profile not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_gyms(request):
    """Get list of available gyms for enrollment"""
    try:
        # Get query parameters for filtering
        city = request.query_params.get('city', '').strip()
        
        # Base queryset - all gyms
        gyms = Gym.objects.all()
        
        # Filter by city if provided
        if city:
            gyms = gyms.filter(address__icontains=city)
        
        # Serialize gyms with basic info needed for enrollment
        gym_data = []
        for gym in gyms:
            gym_data.append({
                'id': gym.id,
                'name': gym.name,
                'address': gym.address,
                'phone': gym.phone,
                'email': gym.email,
                'description': gym.description,
                'member_count': gym.members.count(),
                'owner_name': f"{gym.owner.first_name} {gym.owner.last_name}".strip() or gym.owner.username
            })
        
        return Response(gym_data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def enroll_in_gym(request):
    """Enroll user in a gym"""
    try:
        if request.user.role != 'member':
            return Response({"error": "Only members can enroll in gyms"}, status=status.HTTP_403_FORBIDDEN)
        
        gym_id = request.data.get('gym_id')
        if not gym_id:
            return Response({"error": "Gym ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if gym exists
        try:
            gym = Gym.objects.get(id=gym_id)
        except Gym.DoesNotExist:
            return Response({"error": "Gym not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is already enrolled in a gym
        existing_membership = Member.objects.filter(user=request.user).first()
        if existing_membership:
            return Response({"error": "You are already enrolled in a gym"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new membership
        member = Member.objects.create(
            user=request.user,
            gym=gym,
            membership_start_date=timezone.now().date(),
            is_active=True
        )
        
        # Create initial streak record
        Streak.objects.create(member=member)
        
        return Response({
            "message": f"Successfully enrolled in {gym.name}",
            "gym": {
                "id": gym.id,
                "name": gym.name,
                "address": gym.address
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    try:
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({"error": "Current password and new password are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify current password
        if not request.user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password
        if len(new_password) < 8:
            return Response({"error": "New password must be at least 8 characters long"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def my_gym_details(request):
    """Get or delete gym owner's own gym details and members"""
    try:
        if request.user.role != 'admin':
            return Response({"error": "Only gym owners can access this endpoint"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get the gym owned by this user (handle multiple gyms by taking the first one)
        gym = Gym.objects.filter(owner=request.user).first()
        if not gym:
            return Response({"error": "No gym found for this owner"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'DELETE':
            # Delete the gym and all related data
            gym_name = gym.name
            owner = gym.owner
            
            # Delete the gym first (this will cascade delete all related members, attendance, etc.)
            gym.delete()
            
            # Delete the owner's account as well
            owner.delete()
            
            return Response({
                "message": f"Gym '{gym_name}' and owner account have been successfully deleted along with all associated data",
                "account_deleted": True
            }, status=status.HTTP_200_OK)
        
        # GET request - return gym details
        # Get gym members
        members = Member.objects.filter(gym=gym, is_active=True)
        
        # Get member details with streaks
        member_data = []
        for member in members:
            streak, created = Streak.objects.get_or_create(member=member)
            member_data.append({
                'id': member.id,
                'username': member.user.username,
                'email': member.user.email,
                'first_name': member.user.first_name,
                'last_name': member.user.last_name,
                'membership_start_date': member.membership_start_date,
                'current_streak': streak.current_streak,
                'longest_streak': streak.longest_streak,
                'total_workouts': ExerciseEntry.objects.filter(member=member).count(),
                'total_calories': ExerciseEntry.objects.filter(member=member).aggregate(
                    total_calories=Sum('calories_burned')
                )['total_calories'] or 0,
                'attendance_count': Attendance.objects.filter(member=member).count()
            })
        
        # Get gym statistics
        total_members = members.count()
        total_workouts = ExerciseEntry.objects.filter(member__gym=gym).count()
        total_calories = ExerciseEntry.objects.filter(member__gym=gym).aggregate(
            total_calories=Sum('calories_burned')
        )['total_calories'] or 0
        
        gym_data = {
            'id': gym.id,
            'name': gym.name,
            'address': gym.address,
            'phone': gym.phone,
            'email': gym.email,
            'description': gym.description,
            'total_members': total_members,
            'total_workouts': total_workouts,
            'total_calories': total_calories,
            'members': member_data
        }
        
        return Response(gym_data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
