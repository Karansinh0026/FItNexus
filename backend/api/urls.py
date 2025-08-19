from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, UserProfileView,
    GymListCreateView, GymDetailView, MemberListCreateView, MemberDetailView,
    AttendanceListCreateView, ExerciseListView, WorkoutSessionListCreateView,
    StreakListView, DashboardStatsView, leaderboard, ExerciseEntryListCreateView,
    ExerciseEntryDetailView, check_attendance_today, available_gyms, enroll_in_gym,
    change_password, my_gym_details
)

urlpatterns = [
    # Authentication
    path('auth/signup/', RegisterView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/change-password/', change_password, name='change-password'),
    
    # Gyms
    path('gyms/', GymListCreateView.as_view(), name='gym-list-create'),
    path('gyms/<int:pk>/', GymDetailView.as_view(), name='gym-detail'),
    path('gyms/available/', available_gyms, name='available-gyms'),
    path('gyms/enroll/', enroll_in_gym, name='enroll-in-gym'),
    path('gyms/my-gym/', my_gym_details, name='my-gym-details'),
    
    # Members
    path('members/', MemberListCreateView.as_view(), name='member-list-create'),
    path('members/<int:pk>/', MemberDetailView.as_view(), name='member-detail'),
    
    # Attendance
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-list-create'),
    path('attendance/check-today/', check_attendance_today, name='check-attendance-today'),
    
    # Exercises
    path('exercises/', ExerciseListView.as_view(), name='exercise-list'),
    
    # Exercise Entries (New tracking system)
    path('exercise-entries/', ExerciseEntryListCreateView.as_view(), name='exercise-entry-list-create'),
    path('exercise-entries/<int:pk>/', ExerciseEntryDetailView.as_view(), name='exercise-entry-detail'),
    
    # Workout Sessions
    path('workouts/', WorkoutSessionListCreateView.as_view(), name='workout-list-create'),
    
    # Streaks
    path('streaks/', StreakListView.as_view(), name='streak-list'),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('leaderboard/', leaderboard, name='leaderboard'),
]
