from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Gym, MembershipPlan, Membership, Notice, ExerciseRoutine, GymApprovalHistory


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_staff')
    list_filter = ('user_type', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'date_of_birth', 'address')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'date_of_birth', 'address')}),
    )

admin.site.register(User, CustomUserAdmin)

@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'address', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'owner__username', 'address')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ('gym', 'duration_months', 'price', 'is_active', 'created_at')
    list_filter = ('duration_months', 'is_active', 'created_at')
    search_fields = ('gym__name',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('member', 'gym', 'plan', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'start_date', 'end_date', 'created_at')
    search_fields = ('member__username', 'gym__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('gym', 'title', 'created_at', 'is_active')
    list_filter = ('gym', 'is_active', 'created_at')
    search_fields = ('title', 'message', 'gym__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ExerciseRoutine)
class ExerciseRoutineAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'weight', 'height', 'experience_level', 'created_at')
    list_filter = ('experience_level', 'created_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(GymApprovalHistory)
class GymApprovalHistoryAdmin(admin.ModelAdmin):
    list_display = ('gym', 'admin', 'action', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('gym__name', 'admin__username')
    readonly_fields = ('created_at',)
