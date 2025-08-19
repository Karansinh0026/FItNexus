from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Gym, Member, Attendance, Exercise, WorkoutSession, WorkoutExercise, Streak


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['username']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'date_of_birth', 'profile_picture')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'date_of_birth')}),
    )


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'phone', 'email', 'member_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'address', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']
    
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'gym', 'experience_level', 'is_active', 'membership_start_date']
    list_filter = ['experience_level', 'is_active', 'membership_start_date', 'gym']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'gym__name']
    readonly_fields = ['membership_start_date']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'check_in_time', 'check_out_time']
    list_filter = ['date', 'member__gym']
    search_fields = ['member__user__username', 'member__user__first_name']
    readonly_fields = ['date', 'check_in_time']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'equipment', 'level', 'body_part', 'calories_burned', 'duration']
    list_filter = ['type', 'equipment', 'level', 'body_part']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'start_time', 'end_time']
    list_filter = ['date', 'member__gym']
    search_fields = ['member__user__username', 'member__user__first_name']
    readonly_fields = ['date', 'start_time']


@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = ['workout_session', 'exercise', 'sets', 'reps', 'duration', 'weight']
    list_filter = ['exercise__type', 'exercise__body_part']
    search_fields = ['workout_session__member__user__username', 'exercise__name']


@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = ['member', 'current_streak', 'longest_streak', 'last_workout_date']
    list_filter = ['last_workout_date']
    search_fields = ['member__user__username', 'member__user__first_name']
    readonly_fields = ['last_workout_date']
