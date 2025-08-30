from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date, timedelta


class User(AbstractUser):
    USER_TYPES = [
        ('admin', 'Admin'),
        ('gym_owner', 'Gym Owner'),
        ('member', 'Member'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='member')
    phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class Gym(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gyms')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class MembershipPlan(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='membership_plans')
    duration_months = models.IntegerField(choices=[(3, '3 Months'), (6, '6 Months'), (12, '12 Months')])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        unique_together = ['gym', 'duration_months']
    
    def __str__(self):
        return f"{self.gym.name} - {self.duration_months} Months"


class Membership(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('terminated', 'Terminated'),
    ]
    
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='memberships')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE, related_name='memberships', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    def __str__(self):
        return f"{self.member.first_name} - {self.gym.name}"

class Attendance(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(auto_now_add=True)
    streak_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['member', 'gym', 'date']
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            # Check if there's an attendance record for yesterday
            from datetime import date, timedelta
            yesterday = date.today() - timedelta(days=1)
            try:
                yesterday_attendance = Attendance.objects.get(
                    member=self.member,
                    gym=self.gym,
                    date=yesterday
                )
                # If yesterday exists, continue the streak
                self.streak_count = yesterday_attendance.streak_count + 1
            except Attendance.DoesNotExist:
                # If yesterday doesn't exist, check if there's a gap
                # Look for the most recent attendance before yesterday
                recent_attendance = Attendance.objects.filter(
                    member=self.member,
                    gym=self.gym,
                    date__lt=yesterday
                ).order_by('-date').first()
                
                if recent_attendance:
                    # Check if the gap is more than 1 day (streak broken)
                    gap_days = (yesterday - recent_attendance.date).days
                    if gap_days > 1:
                        # Streak broken, start new streak
                        self.streak_count = 1
                    else:
                        # Only 1 day gap, continue streak
                        self.streak_count = recent_attendance.streak_count + 1
                else:
                    # No previous attendance, start new streak
                    self.streak_count = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def recalculate_streaks(cls, member, gym):
        """Recalculate streaks for all attendance records of a member at a gym"""
        attendances = cls.objects.filter(
            member=member,
            gym=gym
        ).order_by('date')
        
        current_streak = 0
        for attendance in attendances:
            if current_streak == 0:
                # First attendance or streak broken
                current_streak = 1
            else:
                # Check if this is consecutive with previous
                prev_attendance = attendances.filter(date__lt=attendance.date).order_by('-date').first()
                if prev_attendance and (attendance.date - prev_attendance.date).days == 1:
                    current_streak += 1
                else:
                    # Gap found, reset streak
                    current_streak = 1
            
            # Update the streak count if it changed
            if attendance.streak_count != current_streak:
                attendance.streak_count = current_streak
                attendance.save(update_fields=['streak_count'])
    
    def __str__(self):
        return f"{self.member.first_name} - {self.gym.name} - {self.date}"

class Notice(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='notices')
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.gym.name} - {self.title}"

class ExerciseRoutine(models.Model):
    EXPERIENCE_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercise_routines')
    age = models.IntegerField(validators=[MinValueValidator(13), MaxValueValidator(100)])
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight in kg")
    height = models.DecimalField(max_digits=5, decimal_places=2, help_text="Height in cm")
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS)
    routine_data = models.JSONField(help_text="Structured exercise routine data")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.first_name} - {self.experience_level} - {self.created_at.strftime('%Y-%m-%d')}"


class GymApprovalHistory(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='approval_history')
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gym_approvals')
    action = models.CharField(max_length=20, choices=[
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.gym.name} - {self.action} by {self.admin.get_full_name()} on {self.created_at.strftime('%Y-%m-%d')}"
