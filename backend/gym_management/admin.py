from django.contrib import admin
from .models import Notice

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('gym', 'title', 'created_at', 'is_active')
    list_filter = ('gym', 'is_active', 'created_at')
    search_fields = ('title', 'message', 'gym__name')
    readonly_fields = ('created_at', 'updated_at')
