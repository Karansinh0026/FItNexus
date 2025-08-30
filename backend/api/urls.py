from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='token_obtain_pair'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='user-profile-update'),

    path('gyms/', views.GymListView.as_view(), name='gym-list'),
    path('gyms/my/', views.GymOwnerListView.as_view(), name='gym-owner-list'),
    path('gyms/create/', views.GymCreateView.as_view(), name='gym-create'),
    path('gyms/<int:pk>/', views.GymDetailView.as_view(), name='gym-detail'),
    path('gyms/<int:pk>/update/', views.GymUpdateView.as_view(), name='gym-update'),
    
    # Gym attendance endpoints (for frontend compatibility)
    path('gyms/<int:gym_id>/attendance/stats/', views.MemberAttendanceStatsView.as_view(), name='member-attendance-stats-alt'),
    path('gyms/<int:gym_id>/attendance/leaderboard/', views.GymLeaderboardView.as_view(), name='gym-leaderboard-alt'),
    path('gyms/<int:gym_id>/attendance/mark/', views.MarkAttendanceView.as_view(), name='mark-attendance-alt'),
    path('gyms/<int:gym_id>/attendance/check-today/', views.CheckTodayAttendanceView.as_view(), name='check-today-attendance'),
    path('gyms/<int:gym_id>/attendance/history/', views.AttendanceHistoryView.as_view(), name='attendance-history'),
    path('gyms/<int:gym_id>/attendance/analytics/', views.GymAttendanceStatsView.as_view(), name='gym-attendance-analytics-alt'),

    path('gyms/<int:gym_id>/plans/', views.MembershipPlanListView.as_view(), name='membership-plan-list'),
    path('gyms/<int:gym_id>/plans/create/', views.MembershipPlanCreateView.as_view(), name='membership-plan-create'),
    path('gyms/<int:gym_id>/plans/<int:pk>/update/', views.MembershipPlanUpdateView.as_view(), name='membership-plan-update'),
    path('gyms/<int:gym_id>/plans/<int:pk>/toggle/', views.MembershipPlanToggleView.as_view(), name='membership-plan-toggle'),
    path('gyms/<int:gym_id>/plans/<int:pk>/delete/', views.MembershipPlanDeleteView.as_view(), name='membership-plan-delete'),
    path('gyms/<int:gym_id>/plans/<int:pk>/request/', views.MembershipRequestFromPlanView.as_view(), name='membership-request-from-plan'),

    path('membership-requests/', views.MembershipRequestView.as_view(), name='membership-request'),
    path('membership-requests/<int:pk>/approve/', views.MembershipApproveView.as_view(), name='membership-approve'),
    path('membership-requests/<int:pk>/reject/', views.MembershipRejectView.as_view(), name='membership-reject'),
    path('memberships/', views.MembershipListView.as_view(), name='membership-list'),
    path('memberships/<int:pk>/approve/', views.MembershipApproveView.as_view(), name='membership-approve-alt'),
    path('memberships/<int:pk>/reject/', views.MembershipRejectView.as_view(), name='membership-reject-alt'),
    path('memberships/<int:pk>/terminate/', views.MembershipTerminateView.as_view(), name='membership-terminate'),
    
    # Plan management endpoints (for frontend compatibility)
    path('plans/<int:pk>/toggle/', views.MembershipPlanToggleView.as_view(), name='plan-toggle-alt'),


    path('attendance/mark/', views.MarkAttendanceView.as_view(), name='mark-attendance'),
    path('attendance/member-stats/<int:gym_id>/', views.MemberAttendanceStatsView.as_view(), name='member-attendance-stats'),
    path('attendance/leaderboard/<int:gym_id>/', views.GymLeaderboardView.as_view(), name='gym-leaderboard'),
    path('attendance/gym-analytics/<int:gym_id>/', views.GymAttendanceStatsView.as_view(), name='gym-attendance-analytics'),

    path('admin/gyms/pending/', views.AdminPendingGymsView.as_view(), name='admin-pending-gyms'),
    path('admin/gyms/all/', views.AdminAllGymsView.as_view(), name='admin-all-gyms'),
    path('admin/gyms/<int:gym_id>/approve/', views.AdminApproveGymView.as_view(), name='admin-approve-gym'),
    path('admin/gyms/<int:gym_id>/reject/', views.AdminRejectGymView.as_view(), name='admin-reject-gym'),
    path('admin/approval-stats/', views.AdminApprovalStatsView.as_view(), name='admin-approval-stats'),

    # Notice endpoints
    path('notices/', views.NoticeListView.as_view(), name='notice-list'),
    path('notices/create/', views.NoticeCreateView.as_view(), name='notice-create'),
    path('notices/<int:notice_id>/', views.NoticeDetailView.as_view(), name='notice-detail'),

    # Exercise routine endpoints
    path('exercise-routines/', views.ExerciseRoutineListView.as_view(), name='exercise-routine-list'),
    path('exercise-routines/create/', views.ExerciseRoutineCreateView.as_view(), name='exercise-routine-create'),
    path('exercise-routines/<int:routine_id>/', views.ExerciseRoutineDetailView.as_view(), name='exercise-routine-detail'),
]
