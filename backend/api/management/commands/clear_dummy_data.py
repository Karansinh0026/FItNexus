from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Gym, MembershipPlan, Membership, Attendance, Notice

User = get_user_model()

class Command(BaseCommand):
    help = 'Clear all dummy data from the database'

    def handle(self, *args, **options):
        self.stdout.write('Clearing all dummy data...')
        
        # Clear all data in reverse order of dependencies
        deleted_notices = Notice.objects.all().delete()
        deleted_attendance = Attendance.objects.all().delete()
        deleted_memberships = Membership.objects.all().delete()
        deleted_plans = MembershipPlan.objects.all().delete()
        deleted_gyms = Gym.objects.all().delete()
        deleted_users = User.objects.filter(user_type__in=['gym_owner', 'member']).delete()
        
        self.stdout.write(f'Deleted {deleted_notices[0]} notices')
        self.stdout.write(f'Deleted {deleted_attendance[0]} attendance records')
        self.stdout.write(f'Deleted {deleted_memberships[0]} memberships')
        self.stdout.write(f'Deleted {deleted_plans[0]} membership plans')
        self.stdout.write(f'Deleted {deleted_gyms[0]} gyms')
        self.stdout.write(f'Deleted {deleted_users[0]} users')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully cleared all dummy data!')
        )
