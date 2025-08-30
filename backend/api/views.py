from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import date, timedelta
from django.db.models import Count, Q, Avg
from .models import User, Gym, MembershipPlan, Membership, Attendance, Notice, ExerciseRoutine
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    GymSerializer, MembershipPlanSerializer, MembershipSerializer,
    AttendanceSerializer, NoticeSerializer, ExerciseRoutineSerializer,
    AttendanceStatsSerializer, LeaderboardEntrySerializer, GymAttendanceStatsSerializer
)
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import json
import requests


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print(f"Registration attempt - Data received: {request.data}")
        
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account created successfully! Welcome to FitNexus.',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"Registration serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print(f"Login attempt - Data received: {request.data}")
        print(f"Content-Type: {request.content_type}")
        
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Welcome back! You\'re now logged in.',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            })
        else:
            print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout successful'})
        except Exception as e:
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


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


class UserProfileUpdateView(APIView):
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GymListView(generics.ListAPIView):
    serializer_class = GymSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Gym.objects.filter(status='approved')


class GymOwnerListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Sorry, this section is only for gym owners.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all gyms owned by the current user (both approved and pending)
        user_gyms = Gym.objects.filter(owner=request.user)
        serializer = GymSerializer(user_gyms, many=True)
        return Response(serializer.data)


class GymCreateView(APIView):
    def post(self, request):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can create gyms'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user already has a gym
        existing_gym = Gym.objects.filter(owner=request.user).first()
        if existing_gym:
            # Allow registration if the existing gym is rejected
            if existing_gym.status == 'rejected':
                # Update the rejected gym instead of deleting it
                serializer = GymSerializer(existing_gym, data=request.data, partial=True)
                if serializer.is_valid():
                    gym = serializer.save(status='pending')  # Reset to pending for new review
                    return Response({
                        'message': 'Gym updated successfully and pending approval',
                        'gym': serializer.data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            elif existing_gym.status == 'approved':
                return Response({
                    'error': 'You already have an approved gym. Each gym owner can only have one approved gym.',
                    'existing_gym': {
                        'id': existing_gym.id,
                        'name': existing_gym.name,
                        'status': existing_gym.status
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            elif existing_gym.status == 'pending':
                return Response({
                    'error': 'You already have a gym pending approval. Please wait for admin review.',
                    'existing_gym': {
                        'id': existing_gym.id,
                        'name': existing_gym.name,
                        'status': existing_gym.status
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Gym creation attempt - Data received: {request.data}")
        print(f"User: {request.user.username} (ID: {request.user.id})")
        print(f"User type: {request.user.user_type}")
        
        serializer = GymSerializer(data=request.data)
        if serializer.is_valid():
            print("Serializer is valid, creating gym...")
            gym = serializer.save(owner=request.user)
            print(f"Gym created successfully: {gym.name} (ID: {gym.id})")
            return Response({
                'message': 'Gym created successfully and pending approval',
                'gym': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"Gym serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GymDetailView(APIView):
    def get(self, request, pk):
        gym = get_object_or_404(Gym, id=pk, status='approved')
        serializer = GymSerializer(gym)
        return Response(serializer.data)


class GymUpdateView(APIView):
    def put(self, request, pk):
        gym = get_object_or_404(Gym, id=pk, owner=request.user)
        serializer = GymSerializer(gym, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MembershipPlanListView(APIView):
    def get(self, request, gym_id):
        gym = get_object_or_404(Gym, id=gym_id, status='approved')
        plans = MembershipPlan.objects.filter(gym=gym, is_active=True)
        serializer = MembershipPlanSerializer(plans, many=True)
        return Response(serializer.data)


class MembershipPlanCreateView(APIView):
    def post(self, request, gym_id):
        print(f"Membership plan creation attempt - Gym ID: {gym_id}")
        print(f"User: {request.user.username} (ID: {request.user.id})")
        print(f"User type: {request.user.user_type}")
        print(f"Data received: {request.data}")
        
        gym = get_object_or_404(Gym, id=gym_id, owner=request.user)
        print(f"Gym found: {gym.name} (ID: {gym.id})")
        
        serializer = MembershipPlanSerializer(data=request.data)
        if serializer.is_valid():
            print("Plan serializer is valid, creating plan...")
            plan = serializer.save(gym=gym)
            print(f"Plan created successfully: {plan.duration_months} months - ₹{plan.price}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(f"Plan serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MembershipPlanUpdateView(APIView):
    def put(self, request, plan_id):
        plan = get_object_or_404(MembershipPlan, id=plan_id, gym__owner=request.user)
        serializer = MembershipPlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MembershipPlanToggleView(APIView):
    def post(self, request, pk):
        plan = get_object_or_404(MembershipPlan, id=pk, gym__owner=request.user)
        plan.is_active = not plan.is_active
        plan.save()
        
        action = "activated" if plan.is_active else "deactivated"
        return Response({
            'message': f'Membership plan {action} successfully',
            'is_active': plan.is_active
        })


class MembershipPlanDeleteView(APIView):
    def delete(self, request, pk):
        plan = get_object_or_404(MembershipPlan, id=pk, gym__owner=request.user)
        
        # Check if there are any active memberships using this plan
        active_memberships = Membership.objects.filter(
            plan=plan,
            status__in=['pending', 'approved']
        ).count()
        
        if active_memberships > 0:
            return Response({
                'error': f'Cannot delete plan. There are {active_memberships} active memberships using this plan.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        plan.delete()
        return Response({'message': 'Membership plan deleted successfully'})


class MembershipRequestView(APIView):
    def post(self, request, gym_id, pk):
        print(f"Membership request attempt - Gym ID: {gym_id}, Plan ID: {pk}")
        print(f"User: {request.user.username} (ID: {request.user.id})")
        print(f"User type: {request.user.user_type}")
        
        if request.user.user_type != 'member':
            print("Error: User is not a member")
            return Response({'error': 'Only members can request memberships'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            gym = get_object_or_404(Gym, id=gym_id, status='approved')
            print(f"MembershipRequestView - Gym found: {gym.name} (ID: {gym.id})")
            
            plan = get_object_or_404(MembershipPlan, id=pk, gym=gym, is_active=True)
            print(f"MembershipRequestView - Plan found: {plan.duration_months} months - ₹{plan.price}")
            
            # Check if membership already exists
            existing_membership = Membership.objects.filter(plan=plan, member=request.user, gym=gym).first()
            if existing_membership:
                print(f"MembershipRequestView - Error: Membership already exists - Status: {existing_membership.status}")
                return Response({'error': 'You already have a membership request for this gym'}, status=status.HTTP_400_BAD_REQUEST)
            
            membership = Membership.objects.create(
                member=request.user,
                gym=gym,
                plan=plan,
                status='pending'
            )
            print(f"MembershipRequestView - Membership created successfully: {membership.id}")
            
            serializer = MembershipSerializer(membership)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"MembershipRequestView - Error in membership request: {str(e)}")
            return Response({'error': 'Failed to create membership request'}, status=status.HTTP_400_BAD_REQUEST)


class MembershipRequestFromPlanView(APIView):
    def post(self, request, gym_id, pk):
        print(f"Membership request from plan - Gym ID: {gym_id}, Plan ID: {pk}")
        print(f"User: {request.user.username} (ID: {request.user.id})")
        print(f"User type: {request.user.user_type}")
        
        if request.user.user_type != 'member':
            print("Error: User is not a member")
            return Response({'error': 'Only members can request memberships'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            gym = get_object_or_404(Gym, id=gym_id, status='approved')
            print(f"MembershipRequestFromPlanView - Gym found: {gym.name} (ID: {gym.id})")
            
            plan = get_object_or_404(MembershipPlan, id=pk, gym=gym, is_active=True)
            print(f"MembershipRequestFromPlanView - Plan found: {plan.duration_months} months - ₹{plan.price}")
            
            # Check if membership already exists
            existing_membership = Membership.objects.filter(plan=plan, member=request.user, gym=gym).first()
            if existing_membership:
                print(f"MembershipRequestFromPlanView - Error: Membership already exists - Status: {existing_membership.status}")
                return Response({'error': 'You already have a membership request for this gym'}, status=status.HTTP_400_BAD_REQUEST)
            
            membership = Membership.objects.create(
                member=request.user,
                gym=gym,
                plan=plan,
                status='pending'
            )
            print(f"MembershipRequestFromPlanView - Membership created successfully: {membership.id}")
            
            serializer = MembershipSerializer(membership)
            return Response({
                'message': 'Membership request sent successfully! The gym owner will review your request.',
                'membership': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"MembershipRequestFromPlanView - Error in membership request: {str(e)}")
            return Response({'error': 'Failed to create membership request'}, status=status.HTTP_400_BAD_REQUEST)


class MembershipListView(APIView):
    def get(self, request):
        if request.user.user_type == 'member':
            memberships = Membership.objects.filter(member=request.user)
        elif request.user.user_type == 'gym_owner':
            memberships = Membership.objects.filter(gym__owner=request.user)
        else:
            memberships = Membership.objects.all()
        
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)


class MembershipApproveView(APIView):
    def post(self, request, pk):
        membership = get_object_or_404(Membership, id=pk)
        
        if request.user.user_type != 'gym_owner' or membership.gym.owner != request.user:
            return Response({'error': 'Only gym owners can approve memberships'}, status=status.HTTP_403_FORBIDDEN)
        
        membership.status = 'approved'
        membership.start_date = date.today()
        membership.end_date = date.today() + timedelta(days=membership.plan.duration_months * 30)
        membership.save()
        return Response({'message': 'Membership approved successfully'})


class MembershipRejectView(APIView):
    def post(self, request, pk):
        membership = get_object_or_404(Membership, id=pk)
        
        if request.user.user_type != 'gym_owner' or membership.gym.owner != request.user:
            return Response({'error': 'Only gym owners can reject memberships'}, status=status.HTTP_403_FORBIDDEN)
        
        membership.status = 'rejected'
        membership.save()
        return Response({'message': 'Membership rejected successfully'})


class MembershipTerminateView(APIView):
    def post(self, request, pk):
        membership = get_object_or_404(Membership, id=pk)
        
        if request.user.user_type != 'gym_owner' or membership.gym.owner != request.user:
            return Response({'error': 'Only gym owners can terminate memberships'}, status=status.HTTP_403_FORBIDDEN)
        
        membership.status = 'terminated'
        membership.save()
        return Response({'message': 'Membership terminated successfully'})


# Attendance Views
class MarkAttendanceView(APIView):
    def post(self, request, gym_id):
        if request.user.user_type != 'member':
            return Response({'error': 'Only members can mark attendance'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has active membership
        membership = get_object_or_404(
            Membership, 
            member=request.user, 
            gym_id=gym_id, 
            status='approved'
        )
        
        # Check if already marked attendance today
        today = date.today()
        existing_attendance = Attendance.objects.filter(
            member=request.user,
            gym_id=gym_id,
            date=today
        ).first()
        
        if existing_attendance:
            return Response({
                'error': 'Attendance already marked for today',
                'attendance': AttendanceSerializer(existing_attendance).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark attendance
        attendance = Attendance.objects.create(
            member=request.user,
            gym_id=gym_id
        )
        
        serializer = AttendanceSerializer(attendance)
        return Response({
            'message': 'Attendance marked successfully',
            'attendance': serializer.data
        }, status=status.HTTP_201_CREATED)


class CheckTodayAttendanceView(APIView):
    def get(self, request, gym_id):
        if request.user.user_type != 'member':
            return Response({'error': 'Only members can check attendance'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has active membership
        membership = get_object_or_404(
            Membership, 
            member=request.user, 
            gym_id=gym_id, 
            status='approved'
        )
        
        # Check if already marked attendance today
        today = date.today()
        existing_attendance = Attendance.objects.filter(
            member=request.user,
            gym_id=gym_id,
            date=today
        ).first()
        
        return Response({
            'marked': existing_attendance is not None,
            'attendance': AttendanceSerializer(existing_attendance).data if existing_attendance else None
        })


class AttendanceHistoryView(APIView):
    def get(self, request, gym_id):
        if request.user.user_type != 'member':
            return Response({'error': 'Only members can view attendance history'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has active membership
        membership = get_object_or_404(
            Membership, 
            member=request.user, 
            gym_id=gym_id, 
            status='approved'
        )
        
        # Get attendance history (last 30 days)
        thirty_days_ago = date.today() - timedelta(days=30)
        attendances = Attendance.objects.filter(
            member=request.user,
            gym_id=gym_id,
            date__gte=thirty_days_ago
        ).order_by('-date')
        
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)


class MemberAttendanceStatsView(APIView):
    def get(self, request, gym_id):
        if request.user.user_type != 'member':
            return Response({'error': 'Only members can view attendance stats'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get membership start date
        membership = get_object_or_404(
            Membership, 
            member=request.user, 
            gym_id=gym_id, 
            status='approved'
        )
        
        # Handle cases where dates might be None
        if membership.start_date:
            start_date = membership.start_date
        elif membership.created_at:
            start_date = membership.created_at.date()
        else:
            # Fallback to today if no dates are available
            start_date = date.today()
        
        today = date.today()
        
        # Calculate total days since membership
        total_days = (today - start_date).days + 1
        
        # Get attendance data
        attendances = Attendance.objects.filter(
            member=request.user,
            gym_id=gym_id
        ).order_by('date')
        
        attended_days = attendances.count()
        
        # Calculate current streak
        current_streak = 0
        if attendances.exists():
            latest_attendance = attendances.last()
            current_date = latest_attendance.date
            
            while True:
                if Attendance.objects.filter(
                    member=request.user,
                    gym_id=gym_id,
                    date=current_date
                ).exists():
                    current_streak += 1
                    current_date -= timedelta(days=1)
                else:
                    break
        
        # Calculate longest streak
        longest_streak = 0
        temp_streak = 0
        prev_date = None
        
        for attendance in attendances:
            if prev_date is None or (attendance.date - prev_date).days == 1:
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1
            prev_date = attendance.date
        
        longest_streak = max(longest_streak, temp_streak)
        
        # Calculate attendance percentage
        attendance_percentage = (attended_days / total_days * 100) if total_days > 0 else 0
        
        stats = {
            'total_attendance': attended_days,
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'attendance_percentage': round(attendance_percentage, 2),
            'total_days': total_days,
            'attended_days': attended_days
        }
        
        serializer = AttendanceStatsSerializer(stats)
        return Response(serializer.data)


class GymLeaderboardView(APIView):
    def get(self, request, gym_id):
        # Check if user has access to this gym
        if request.user.user_type == 'member':
            membership = get_object_or_404(
                Membership, 
                member=request.user, 
                gym_id=gym_id, 
                status='approved'
            )
        elif request.user.user_type == 'gym_owner':
            gym = get_object_or_404(Gym, id=gym_id, owner=request.user)
        else:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all active members
        active_memberships = Membership.objects.filter(
            gym_id=gym_id,
            status='approved'
        )
        
        leaderboard = []
        
        for membership in active_memberships:
            member = membership.member
            start_date = membership.start_date or membership.created_at.date()
            today = date.today()
            total_days = (today - start_date).days + 1
            
            # Get attendance data
            attendances = Attendance.objects.filter(
                member=member,
                gym_id=gym_id
            ).order_by('date')
            
            total_attendance = attendances.count()
            
            # Calculate current streak
            current_streak = 0
            if attendances.exists():
                latest_attendance = attendances.last()
                current_date = latest_attendance.date
                
                while True:
                    if Attendance.objects.filter(
                        member=member,
                        gym_id=gym_id,
                        date=current_date
                    ).exists():
                        current_streak += 1
                        current_date -= timedelta(days=1)
                    else:
                        break
            
            # Calculate longest streak
            longest_streak = 0
            temp_streak = 0
            prev_date = None
            
            for attendance in attendances:
                if prev_date is None or (attendance.date - prev_date).days == 1:
                    temp_streak += 1
                else:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
                prev_date = attendance.date
            
            longest_streak = max(longest_streak, temp_streak)
            
            # Calculate attendance percentage
            attendance_percentage = (total_attendance / total_days * 100) if total_days > 0 else 0
            
            leaderboard.append({
                'member_id': member.id,
                'member_name': member.get_full_name(),
                'total_attendance': total_attendance,
                'current_streak': current_streak,
                'longest_streak': longest_streak,
                'attendance_percentage': round(attendance_percentage, 2),
                'rank': 0  # Will be set after sorting
            })
        
        # Sort by total attendance (descending)
        leaderboard.sort(key=lambda x: x['total_attendance'], reverse=True)
        
        # Assign ranks
        for i, entry in enumerate(leaderboard):
            entry['rank'] = i + 1
        
        serializer = LeaderboardEntrySerializer(leaderboard, many=True)
        return Response(serializer.data)





class GymAttendanceStatsView(APIView):
    def get(self, request, gym_id):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can view gym attendance stats'}, status=status.HTTP_403_FORBIDDEN)
        
        gym = get_object_or_404(Gym, id=gym_id, owner=request.user)
        today = date.today()
        
        # Get today's attendance
        today_attendance = Attendance.objects.filter(
            gym_id=gym_id,
            date=today
        ).count()
        
        # Get total active members
        total_members = Membership.objects.filter(
            gym_id=gym_id,
            status='approved'
        ).count()
        
        # Calculate today's attendance percentage
        attendance_percentage_today = (today_attendance / total_members * 100) if total_members > 0 else 0
        
        # Get recent attendance (last 10)
        recent_attendance = Attendance.objects.filter(
            gym_id=gym_id
        ).order_by('-date', '-created_at')[:10]
        
        # Get top 5 attenders
        top_attenders = []
        active_memberships = Membership.objects.filter(
            gym_id=gym_id,
            status='approved'
        )
        
        for membership in active_memberships:
            member = membership.member
            start_date = membership.start_date or membership.created_at.date()
            total_days = (today - start_date).days + 1
            
            total_attendance = Attendance.objects.filter(
                member=member,
                gym_id=gym_id
            ).count()
            
            attendance_percentage = (total_attendance / total_days * 100) if total_days > 0 else 0
            
            top_attenders.append({
                'member_id': member.id,
                'member_name': member.get_full_name(),
                'total_attendance': total_attendance,
                'current_streak': 0,  # Simplified for this view
                'longest_streak': 0,  # Simplified for this view
                'attendance_percentage': round(attendance_percentage, 2),
                'rank': 0
            })
        
        # Sort and get top 5
        top_attenders.sort(key=lambda x: x['total_attendance'], reverse=True)
        top_attenders = top_attenders[:5]
        
        # Assign ranks
        for i, entry in enumerate(top_attenders):
            entry['rank'] = i + 1
        
        # Serialize top_attenders using LeaderboardEntrySerializer
        top_attenders_serializer = LeaderboardEntrySerializer(top_attenders, many=True)
        
        # Calculate average attendance percentage
        if top_attenders:
            average_attendance_percentage = sum(entry['attendance_percentage'] for entry in top_attenders) / len(top_attenders)
        else:
            average_attendance_percentage = 0
        
        stats = {
            'today_attendance': today_attendance,
            'total_members': total_members,
            'attendance_percentage_today': round(attendance_percentage_today, 2),
            'average_attendance_percentage': round(average_attendance_percentage, 2),
            'top_attenders': top_attenders_serializer.data,
            'recent_attendance': AttendanceSerializer(recent_attendance, many=True).data
        }
        
        serializer = GymAttendanceStatsSerializer(stats)
        return Response(serializer.data)


class AdminPendingGymsView(APIView):
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can view pending gyms'}, status=status.HTTP_403_FORBIDDEN)
        
        gyms = Gym.objects.filter(status='pending')
        serializer = GymSerializer(gyms, many=True)
        return Response(serializer.data)


class AdminApproveGymView(APIView):
    def post(self, request, gym_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can approve gyms'}, status=status.HTTP_403_FORBIDDEN)
        
        gym = get_object_or_404(Gym, id=gym_id)
        gym.status = 'approved'
        gym.save()
        
        # Create approval history record
        from .models import GymApprovalHistory
        GymApprovalHistory.objects.create(
            gym=gym,
            admin=request.user,
            action='approved',
            notes=request.data.get('notes', '')
        )
        
        return Response({'message': 'Gym approved successfully'})


class AdminRejectGymView(APIView):
    def post(self, request, gym_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can reject gyms'}, status=status.HTTP_403_FORBIDDEN)
        
        gym = get_object_or_404(Gym, id=gym_id)
        gym.status = 'rejected'
        gym.rejection_reason = request.data.get('notes', '')
        gym.save()
        
        # Create rejection history record
        from .models import GymApprovalHistory
        GymApprovalHistory.objects.create(
            gym=gym,
            admin=request.user,
            action='rejected',
            notes=request.data.get('notes', '')
        )
        
        return Response({'message': 'Gym rejected successfully'})


class AdminApprovalStatsView(APIView):
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can view approval stats'}, status=status.HTTP_403_FORBIDDEN)
        
        from django.utils import timezone
        from datetime import timedelta
        from .models import GymApprovalHistory
        
        today = timezone.now().date()
        
        # Today's approvals
        today_approvals = GymApprovalHistory.objects.filter(
            action='approved',
            created_at__date=today
        ).count()
        
        # Today's rejections
        today_rejections = GymApprovalHistory.objects.filter(
            action='rejected',
            created_at__date=today
        ).count()
        
        # Total pending gyms
        pending_gyms = Gym.objects.filter(status='pending').count()
        
        # Recent approval history (last 10)
        recent_history = GymApprovalHistory.objects.all()[:10]
        
        from .serializers import GymApprovalHistorySerializer
        history_serializer = GymApprovalHistorySerializer(recent_history, many=True)
        
        return Response({
            'today_approvals': today_approvals,
            'today_rejections': today_rejections,
            'pending_gyms': pending_gyms,
            'recent_history': history_serializer.data
        })


class AdminAllGymsView(APIView):
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can view all gyms'}, status=status.HTTP_403_FORBIDDEN)
        
        gyms = Gym.objects.all().order_by('-created_at')
        serializer = GymSerializer(gyms, many=True)
        return Response(serializer.data)


class NoticeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can create notices'}, status=403)
        
        # Get the gym owner's gym
        try:
            gym = Gym.objects.get(owner=request.user)
        except Gym.DoesNotExist:
            return Response({'error': 'You must have a registered gym to create notices'}, status=400)
        
        # Add the gym to the request data
        data = request.data.copy()
        data['gym'] = gym.id
        
        serializer = NoticeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class NoticeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.user_type == 'gym_owner':
            # Gym owners see notices for their gyms
            gyms = Gym.objects.filter(owner=user)
            notices = Notice.objects.filter(gym__in=gyms, is_active=True)
        elif user.user_type == 'member':
            # Members see notices for gyms they're members of
            memberships = Membership.objects.filter(member=user, status='approved')
            gym_ids = [membership.gym.id for membership in memberships]
            notices = Notice.objects.filter(gym_id__in=gym_ids, is_active=True)
        else:
            # Admin sees all notices
            notices = Notice.objects.filter(is_active=True)
        
        serializer = NoticeSerializer(notices, many=True)
        return Response(serializer.data)

class NoticeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, notice_id):
        try:
            notice = Notice.objects.get(id=notice_id, is_active=True)
            serializer = NoticeSerializer(notice)
            return Response(serializer.data)
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=404)

    def put(self, request, notice_id):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can update notices'}, status=403)
        
        try:
            notice = Notice.objects.get(id=notice_id)
            # Verify the notice belongs to the current user's gym
            if notice.gym.owner != request.user:
                return Response({'error': 'You can only update notices for your own gyms'}, status=403)
            
            serializer = NoticeSerializer(notice, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=404)

    def delete(self, request, notice_id):
        if request.user.user_type != 'gym_owner':
            return Response({'error': 'Only gym owners can delete notices'}, status=403)
        
        try:
            notice = Notice.objects.get(id=notice_id)
            # Verify the notice belongs to the current user's gym
            if notice.gym.owner != request.user:
                return Response({'error': 'You can only delete notices for your own gyms'}, status=403)
            
            notice.delete()
            return Response({'message': 'Notice deleted successfully'}, status=204)
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=404)

class ExerciseRoutineCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type != 'member':
            return Response({'error': 'Only members can create exercise routines'}, status=403)
        
        # Extract user data
        age = request.data.get('age')
        weight = request.data.get('weight')
        height = request.data.get('height')
        experience_level = request.data.get('experience_level')
        
        if not all([age, weight, height, experience_level]):
            return Response({'error': 'All fields are required'}, status=400)
        
        try:
            # Call Gemini API to generate exercise routine
            routine_data = self.generate_exercise_routine(age, weight, height, experience_level)
            
            # Save to database
            exercise_routine = ExerciseRoutine.objects.create(
                user=request.user,
                age=age,
                weight=weight,
                height=height,
                experience_level=experience_level,
                routine_data=routine_data
            )
            
            serializer = ExerciseRoutineSerializer(exercise_routine)
            return Response(serializer.data, status=201)
            
        except Exception as e:
            return Response({'error': f'Failed to generate exercise routine: {str(e)}'}, status=500)
    
    def generate_exercise_routine(self, age, weight, height, experience_level):
        """Generate exercise routine using Gemini API"""
        GEMINI_API_KEY = settings.GEMINI_API_KEY
        GEMINI_API_URL = settings.GEMINI_API_URL
        
        # Check if API key is configured
        if GEMINI_API_KEY in ['YOUR_GEMINI_API_KEY', 'your_actual_api_key_here']:
            raise Exception("Gemini API key not configured. Please set a valid API key.")
        
        prompt = f"""
        Create a personalized 7-day exercise routine for a {experience_level} fitness level person.
        
        User Details:
        - Age: {age} years
        - Weight: {weight} kg
        - Height: {height} cm
        - Experience Level: {experience_level}
        
        IMPORTANT: Please provide a COMPLETE 7-day routine covering ALL days of the week (Monday through Sunday).
        
        Please provide a structured exercise routine that includes:
        1. Day-by-day breakdown (Monday to Sunday - ALL 7 DAYS MUST BE INCLUDED)
        2. For each day, include:
           - Warm-up exercises (5-10 minutes)
           - Main workout (30-45 minutes)
           - Cool-down exercises (5-10 minutes)
        3. Exercise details including:
           - Exercise name
           - Sets and reps
           - Duration (for cardio)
           - Rest periods
           - Difficulty level
        4. Rest day recommendations (but still include them in the weekly routine)
        5. Safety tips and modifications for the user's level
        
        Return the response as a structured JSON object with the following format:
        {{
            "summary": "Brief overview of the routine",
            "weekly_routine": {{
                "monday": {{
                    "day": "Monday",
                    "focus": "Focus area for the day",
                    "warmup": ["exercise1", "exercise2"],
                    "main_workout": [
                        {{
                            "exercise": "Exercise name",
                            "sets": 3,
                            "reps": "10-12",
                            "rest": "60 seconds",
                            "notes": "Additional notes"
                        }}
                    ],
                    "cooldown": ["exercise1", "exercise2"],
                    "total_duration": "45 minutes"
                }},
                // ... repeat for other days
            }},
            "safety_tips": ["tip1", "tip2"],
            "modifications": {{
                "beginner": "How to modify for beginners",
                "advanced": "How to make it more challenging"
            }}
        }}
        """
        
        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers={
                    "Content-Type": "application/json"
                },
                json={
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }]
                },
                timeout=30  # Add timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Check if response has the expected structure
                if 'candidates' in result and len(result['candidates']) > 0:
                    candidate = result['candidates'][0]
                    if 'content' in candidate and 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
                        generated_text = candidate['content']['parts'][0]['text']
                        
                        # Try to parse as JSON, if it fails, return as structured text
                        try:
                            parsed_data = json.loads(generated_text)
                            # Validate that it has the expected structure
                            if isinstance(parsed_data, dict) and 'summary' in parsed_data:
                                return parsed_data
                            else:
                                return {
                                    "raw_response": generated_text,
                                    "structured": False,
                                    "note": "Response format not as expected"
                                }
                        except json.JSONDecodeError:
                            # If not valid JSON, return as structured text
                            return {
                                "raw_response": generated_text,
                                "structured": False,
                                "note": "Response is not valid JSON"
                            }
                    else:
                        print(f"Unexpected Gemini response structure: {result}")
                        raise Exception("Gemini API returned invalid response format. Please try again.")
                else:
                    print(f"Gemini API returned no candidates: {result}")
                    raise Exception("Gemini API returned no response. Please try again.")
            else:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                raise Exception(f"Gemini API failed with status {response.status_code}. Please check your API key and try again.")
                
        except requests.exceptions.Timeout:
            print("Gemini API request timed out")
            raise Exception("Gemini API request timed out. Please try again.")
        except requests.exceptions.RequestException as e:
            print(f"Gemini API request failed: {str(e)}")
            raise Exception(f"Gemini API request failed: {str(e)}")
        except Exception as e:
            print(f"Unexpected error in Gemini API call: {str(e)}")
            raise Exception(f"Unexpected error in Gemini API call: {str(e)}")
    


class ExerciseRoutineListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'member':
            return Response({'error': 'Only members can view exercise routines'}, status=403)
        
        routines = ExerciseRoutine.objects.filter(user=request.user).order_by('-created_at')
        serializer = ExerciseRoutineSerializer(routines, many=True)
        return Response(serializer.data)

class ExerciseRoutineDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, routine_id):
        try:
            routine = ExerciseRoutine.objects.get(id=routine_id, user=request.user)
            serializer = ExerciseRoutineSerializer(routine)
            return Response(serializer.data)
        except ExerciseRoutine.DoesNotExist:
            return Response({'error': 'Exercise routine not found'}, status=404)
    
    def delete(self, request, routine_id):
        try:
            routine = ExerciseRoutine.objects.get(id=routine_id, user=request.user)
            routine.delete()
            return Response({'message': 'Exercise routine deleted successfully'}, status=204)
        except ExerciseRoutine.DoesNotExist:
            return Response({'error': 'Exercise routine not found'}, status=404)
