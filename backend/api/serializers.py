from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Gym, MembershipPlan, Membership, Attendance, Notice, ExerciseRoutine, GymApprovalHistory


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'phone', 'date_of_birth', 'address']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'user_type', 'phone', 'date_of_birth', 'address']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class GymSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Gym
        fields = ['id', 'name', 'address', 'phone', 'email', 'description', 'owner', 'owner_name', 'status', 'rejection_reason', 'created_at']
        read_only_fields = ['owner', 'status', 'rejection_reason', 'created_at']


class MembershipPlanSerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    
    class Meta:
        model = MembershipPlan
        fields = ['id', 'gym', 'gym_name', 'duration_months', 'price', 'description', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class MembershipSerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    plan_details = serializers.CharField(source='plan.duration_months', read_only=True)
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    owner_name = serializers.CharField(source='gym.owner.get_full_name', read_only=True)
    
    class Meta:
        model = Membership
        fields = ['id', 'member', 'member_name', 'gym', 'gym_name', 'plan', 'plan_details', 'status', 'start_date', 'end_date', 'owner_name', 'created_at']
        read_only_fields = ['created_at']


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'member_name', 'gym_name', 'date', 'streak_count', 'created_at']
        read_only_fields = ['date', 'streak_count', 'created_at']


class NoticeSerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = ['id', 'gym', 'gym_name', 'title', 'message', 'created_at', 'created_at_formatted', 'is_active']
        read_only_fields = ['created_at', 'created_at_formatted']
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')


class ExerciseRoutineSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = ExerciseRoutine
        fields = ['id', 'user', 'user_name', 'age', 'weight', 'height', 'experience_level', 'routine_data', 'created_at', 'created_at_formatted']
        read_only_fields = ['user', 'created_at', 'created_at_formatted']
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')


class AttendanceStatsSerializer(serializers.Serializer):
    total_attendance = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()
    total_days = serializers.IntegerField()
    attended_days = serializers.IntegerField()


class LeaderboardEntrySerializer(serializers.Serializer):
    member_id = serializers.IntegerField()
    member_name = serializers.CharField()
    total_attendance = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()
    rank = serializers.IntegerField()


class GymAttendanceStatsSerializer(serializers.Serializer):
    today_attendance = serializers.IntegerField()
    total_members = serializers.IntegerField()
    attendance_percentage_today = serializers.FloatField()
    average_attendance_percentage = serializers.FloatField()
    top_attenders = LeaderboardEntrySerializer(many=True)
    recent_attendance = AttendanceSerializer(many=True)


class GymApprovalHistorySerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    admin_name = serializers.CharField(source='admin.get_full_name', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = GymApprovalHistory
        fields = ['id', 'gym', 'gym_name', 'admin', 'admin_name', 'action', 'notes', 'created_at', 'created_at_formatted']
        read_only_fields = ['created_at', 'created_at_formatted']
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')
