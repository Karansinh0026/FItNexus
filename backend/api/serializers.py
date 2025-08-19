from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Gym, Member, Attendance, Exercise, WorkoutSession, WorkoutExercise, Streak, ExerciseEntry


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'date_of_birth', 'profile_picture']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role', 'phone', 'date_of_birth']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class GymSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Gym
        fields = '__all__'
        read_only_fields = ['owner', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.count()


class MemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    gym = GymSerializer(read_only=True)
    
    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ['membership_start_date']


class AttendanceSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['date', 'check_in_time']


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    
    class Meta:
        model = WorkoutExercise
        fields = '__all__'


class WorkoutSessionSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    exercises = WorkoutExerciseSerializer(source='workoutexercise_set', many=True, read_only=True)
    
    class Meta:
        model = WorkoutSession
        fields = '__all__'
        read_only_fields = ['date', 'start_time']


class ExerciseEntrySerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    total_calories = serializers.ReadOnlyField()
    
    class Meta:
        model = ExerciseEntry
        fields = '__all__'
        read_only_fields = ['date', 'created_at']


class StreakSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    
    class Meta:
        model = Streak
        fields = '__all__'


class DashboardStatsSerializer(serializers.Serializer):
    total_workouts = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    total_calories_burned = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    recent_workouts = serializers.ListField()  # Changed to ListField to handle both types
