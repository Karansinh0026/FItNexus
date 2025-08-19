from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} - {self.role}"


class Gym(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_gyms')
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='gym_logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member_profile')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='members')
    membership_start_date = models.DateField(auto_now_add=True)
    membership_end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in cm
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in kg
    experience_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    
    def __str__(self):
        return f"{self.user.username} - {self.gym.name}"


class Attendance(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(auto_now_add=True)
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ['member', 'date']
    
    def __str__(self):
        return f"{self.member.user.username} - {self.date}"


class Exercise(models.Model):
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=100)
    equipment = models.CharField(max_length=100)
    level = models.CharField(max_length=20)
    body_part = models.CharField(max_length=100)
    calories_burned = models.IntegerField()
    duration = models.IntegerField()  # in minutes
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class WorkoutSession(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='workout_sessions')
    date = models.DateField(auto_now_add=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    exercises = models.ManyToManyField(Exercise, through='WorkoutExercise')
    
    def __str__(self):
        return f"{self.member.user.username} - {self.date}"


class WorkoutExercise(models.Model):
    workout_session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    sets = models.IntegerField(default=1)
    reps = models.IntegerField(default=1)
    duration = models.IntegerField(default=0)  # in seconds
    weight = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    
    def __str__(self):
        return f"{self.exercise.name} - {self.workout_session}"


class ExerciseEntry(models.Model):
    """Model to track individual exercise entries with calories burned"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='exercise_entries')
    exercise_name = models.CharField(max_length=200)
    exercise_type = models.CharField(max_length=100)
    body_part = models.CharField(max_length=100)
    duration = models.IntegerField()  # in minutes
    calories_burned = models.IntegerField()
    sets = models.IntegerField(default=1)
    reps = models.IntegerField(default=1)
    weight = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)  # in kg
    notes = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.member.user.username} - {self.exercise_name} - {self.date}"
    
    @property
    def total_calories(self):
        """Calculate total calories based on duration and intensity"""
        return self.calories_burned


class Streak(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_workout_date = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.member.user.username} - {self.current_streak} days"
