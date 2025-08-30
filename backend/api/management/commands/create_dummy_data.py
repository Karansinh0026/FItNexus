from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
import random
from api.models import Gym, MembershipPlan, Membership, Attendance, Notice

User = get_user_model()

class Command(BaseCommand):
    help = 'Create dummy data for gym owners, gyms, members, and membership plans'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating new dummy data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            User.objects.filter(user_type__in=['gym_owner', 'member']).delete()
            Gym.objects.all().delete()
            MembershipPlan.objects.all().delete()
            Membership.objects.all().delete()
            Attendance.objects.all().delete()
            Notice.objects.all().delete()

        self.stdout.write('Creating dummy data...')
        
        # Create gym owners
        gym_owners = self.create_gym_owners()
        
        # Create gyms
        gyms = self.create_gyms(gym_owners)
        
        # Create membership plans for each gym
        membership_plans = self.create_membership_plans(gyms)
        
        # Create members
        members = self.create_members()
        
        # Create memberships
        self.create_memberships(members, membership_plans, gyms)
        
        # Create attendance records (commented out for now due to unique constraint issues)
        # self.create_attendance_records()
        
        # Create notices
        self.create_notices(gyms)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created dummy data!')
        )

    def create_gym_owners(self):
        gym_owners_data = [
            {
                'username': 'rajesh_fitness_owner',
                'first_name': 'Rajesh',
                'last_name': 'Patel',
                'email': 'rajesh@fitnessahmedabad.com',
                'phone': '+919876543210',
                'date_of_birth': '1985-03-15'
            },
            {
                'username': 'priya_owner',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'email': 'priya@powergymahmedabad.com',
                'phone': '+919876543211',
                'date_of_birth': '1988-07-22'
            },
            {
                'username': 'amit_owner',
                'first_name': 'Amit',
                'last_name': 'Kumar',
                'email': 'amit@elitefitnessahmedabad.com',
                'phone': '+919876543212',
                'date_of_birth': '1982-11-08'
            },
            {
                'username': 'neha_owner',
                'first_name': 'Neha',
                'last_name': 'Singh',
                'email': 'neha@peakperformanceahmedabad.com',
                'phone': '+919876543213',
                'date_of_birth': '1990-05-12'
            }
        ]
        
        gym_owners = []
        for owner_data in gym_owners_data:
            user, created = User.objects.get_or_create(
                username=owner_data['username'],
                defaults={
                    'first_name': owner_data['first_name'],
                    'last_name': owner_data['last_name'],
                    'email': owner_data['email'],
                    'phone': owner_data['phone'],
                    'date_of_birth': owner_data['date_of_birth'],
                    'user_type': 'gym_owner',
                    'is_active': True
                }
            )
            if created:
                user.set_password('123456')
                user.save()
                self.stdout.write(f'Created gym owner: {user.get_full_name()}')
            gym_owners.append(user)
        
        return gym_owners

    def create_gyms(self, gym_owners):
        gyms_data = [
            {
                'name': 'Fitness Ahmedabad',
                'address': '123 CG Road, Navrangpura, Ahmedabad',
                'phone': '+919876543210',
                'email': 'info@fitnessahmedabad.com',
                'description': 'Premium fitness center with state-of-the-art equipment and personal training services in the heart of Ahmedabad.',
                'owner': gym_owners[0]
            },
            {
                'name': 'Power Gym Ahmedabad',
                'address': '456 Satellite Road, Jodhpur, Ahmedabad',
                'phone': '+919876543211',
                'email': 'info@powergymahmedabad.com',
                'description': 'Intense workout environment for serious fitness enthusiasts in Ahmedabad.',
                'owner': gym_owners[1]
            },
            {
                'name': 'Elite Fitness Ahmedabad',
                'address': '789 Vastrapur Lake Road, Vastrapur, Ahmedabad',
                'phone': '+919876543212',
                'email': 'info@elitefitnessahmedabad.com',
                'description': 'Exclusive gym with luxury amenities and specialized programs in Ahmedabad.',
                'owner': gym_owners[2]
            },
            {
                'name': 'Peak Performance Ahmedabad',
                'address': '321 Bodakdev Road, Bodakdev, Ahmedabad',
                'phone': '+919876543213',
                'email': 'info@peakperformanceahmedabad.com',
                'description': 'Performance-oriented gym with sports training and conditioning in Ahmedabad.',
                'owner': gym_owners[3]
            }
        ]
        
        gyms = []
        for gym_data in gyms_data:
            gym, created = Gym.objects.get_or_create(
                name=gym_data['name'],
                defaults={
                    'owner': gym_data['owner'],
                    'address': gym_data['address'],
                    'phone': gym_data['phone'],
                    'email': gym_data['email'],
                    'description': gym_data['description'],
                    'status': 'approved'
                }
            )
            if created:
                self.stdout.write(f'Created gym: {gym.name}')
            gyms.append(gym)
        
        return gyms

    def create_membership_plans(self, gyms):
        plans_data = [
            {'duration_months': 1, 'price': 2500},
            {'duration_months': 3, 'price': 6500},
            {'duration_months': 6, 'price': 12000},
            {'duration_months': 12, 'price': 22000}
        ]
        
        membership_plans = []
        for gym in gyms:
            for plan_data in plans_data:
                plan, created = MembershipPlan.objects.get_or_create(
                    gym=gym,
                    duration_months=plan_data['duration_months'],
                    defaults={
                        'price': plan_data['price'],
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(f'Created plan: {plan.duration_months} months - ₹{plan.price} for {gym.name}')
                membership_plans.append(plan)
        
        return membership_plans

    def create_members(self):
        members_data = [
            # Fitness Ahmedabad Members (15 members)
            {'username': 'arjun_patel', 'first_name': 'Arjun', 'last_name': 'Patel', 'email': 'arjun@email.com'},
            {'username': 'kavya_shah', 'first_name': 'Kavya', 'last_name': 'Shah', 'email': 'kavya@email.com'},
            {'username': 'rishabh_mehta', 'first_name': 'Rishabh', 'last_name': 'Mehta', 'email': 'rishabh@email.com'},
            {'username': 'diya_kapoor', 'first_name': 'Diya', 'last_name': 'Kapoor', 'email': 'diya@email.com'},
            {'username': 'aditya_verma', 'first_name': 'Aditya', 'last_name': 'Verma', 'email': 'aditya@email.com'},
            {'username': 'isha_reddy', 'first_name': 'Isha', 'last_name': 'Reddy', 'email': 'isha@email.com'},
            {'username': 'vivaan_malhotra', 'first_name': 'Vivaan', 'last_name': 'Malhotra', 'email': 'vivaan@email.com'},
            {'username': 'zara_khanna', 'first_name': 'Zara', 'last_name': 'Khanna', 'email': 'zara@email.com'},
            {'username': 'kabir_chopra', 'first_name': 'Kabir', 'last_name': 'Chopra', 'email': 'kabir@email.com'},
            {'username': 'myra_singh', 'first_name': 'Myra', 'last_name': 'Singh', 'email': 'myra@email.com'},
            {'username': 'aarav_gupta', 'first_name': 'Aarav', 'last_name': 'Gupta', 'email': 'aarav@email.com'},
            {'username': 'kiara_jain', 'first_name': 'Kiara', 'last_name': 'Jain', 'email': 'kiara@email.com'},
            {'username': 'advait_kumar', 'first_name': 'Advait', 'last_name': 'Kumar', 'email': 'advait@email.com'},
            {'username': 'ananya_rajput', 'first_name': 'Ananya', 'last_name': 'Rajput', 'email': 'ananya@email.com'},
            {'username': 'dhruv_yadav', 'first_name': 'Dhruv', 'last_name': 'Yadav', 'email': 'dhruv@email.com'},
            
            # Power Gym Ahmedabad Members (15 members)
            {'username': 'veer_singh', 'first_name': 'Veer', 'last_name': 'Singh', 'email': 'veer@email.com'},
            {'username': 'aisha_kapoor', 'first_name': 'Aisha', 'last_name': 'Kapoor', 'email': 'aisha@email.com'},
            {'username': 'kartik_sharma', 'first_name': 'Kartik', 'last_name': 'Sharma', 'email': 'kartik@email.com'},
            {'username': 'navya_patel', 'first_name': 'Navya', 'last_name': 'Patel', 'email': 'navya@email.com'},
            {'username': 'arav_mehta', 'first_name': 'Arav', 'last_name': 'Mehta', 'email': 'arav@email.com'},
            {'username': 'ishaani_verma', 'first_name': 'Ishaani', 'last_name': 'Verma', 'email': 'ishaani@email.com'},
            {'username': 'rishit_reddy', 'first_name': 'Rishit', 'last_name': 'Reddy', 'email': 'rishit@email.com'},
            {'username': 'kiara_malhotra', 'first_name': 'Kiara', 'last_name': 'Malhotra', 'email': 'kiara2@email.com'},
            {'username': 'advik_khanna', 'first_name': 'Advik', 'last_name': 'Khanna', 'email': 'advik@email.com'},
            {'username': 'myra_chopra', 'first_name': 'Myra', 'last_name': 'Chopra', 'email': 'myra2@email.com'},
            {'username': 'aarush_singh', 'first_name': 'Aarush', 'last_name': 'Singh', 'email': 'aarush@email.com'},
            {'username': 'isha_gupta', 'first_name': 'Isha', 'last_name': 'Gupta', 'email': 'isha2@email.com'},
            {'username': 'kabir_jain', 'first_name': 'Kabir', 'last_name': 'Jain', 'email': 'kabir2@email.com'},
            {'username': 'diya_kumar', 'first_name': 'Diya', 'last_name': 'Kumar', 'email': 'diya2@email.com'},
            {'username': 'arjun_rajput', 'first_name': 'Arjun', 'last_name': 'Rajput', 'email': 'arjun2@email.com'},
            {'username': 'kavya_yadav', 'first_name': 'Kavya', 'last_name': 'Yadav', 'email': 'kavya2@email.com'},
            
            # Additional members for other gyms
            {'username': 'elite_member1', 'first_name': 'Rohan', 'last_name': 'Sharma', 'email': 'rohan@email.com'},
            {'username': 'elite_member2', 'first_name': 'Sneha', 'last_name': 'Patel', 'email': 'sneha@email.com'},
            {'username': 'peak_member1', 'first_name': 'Vikram', 'last_name': 'Kumar', 'email': 'vikram@email.com'},
            {'username': 'peak_member2', 'first_name': 'Priya', 'last_name': 'Singh', 'email': 'priya@email.com'},
        ]
        
        members = []
        for member_data in members_data:
            user, created = User.objects.get_or_create(
                username=member_data['username'],
                defaults={
                    'first_name': member_data['first_name'],
                    'last_name': member_data['last_name'],
                    'email': member_data['email'],
                    'phone': f'+91{random.randint(7000000000, 9999999999)}',
                    'date_of_birth': f'{random.randint(1980, 2000)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}',
                    'user_type': 'member',
                    'is_active': True
                }
            )
            if created:
                user.set_password('123456')
                user.save()
                self.stdout.write(f'Created member: {user.get_full_name()}')
            members.append(user)
        
        return members

    def create_memberships(self, members, membership_plans, gyms):
        # Assign members to gyms with at least 10 members per gym
        fitness_ahmedabad = gyms[0]  # Fitness Ahmedabad
        power_gym_ahmedabad = gyms[1]  # Power Gym Ahmedabad
        
        # Fitness Ahmedabad members (first 15 members)
        fitness_members = members[:15]
        fitness_plans = [plan for plan in membership_plans if plan.gym == fitness_ahmedabad]
        
        # Power Gym Ahmedabad members (next 15 members)
        power_members = members[15:30]
        power_plans = [plan for plan in membership_plans if plan.gym == power_gym_ahmedabad]
        
        # Other gym members
        other_members = members[30:]
        other_plans = [plan for plan in membership_plans if plan.gym not in [fitness_ahmedabad, power_gym_ahmedabad]]
        
        # Create memberships for Fitness Ahmedabad
        for member in fitness_members:
            plan = random.choice(fitness_plans)
            start_date = timezone.now().date() - timedelta(days=random.randint(1, 365))
            end_date = start_date + timedelta(days=plan.duration_months * 30)
            
            membership, created = Membership.objects.get_or_create(
                member=member,
                gym=fitness_ahmedabad,
                plan=plan,
                defaults={
                    'status': 'approved',
                    'start_date': start_date,
                    'end_date': end_date
                }
            )
            if created:
                self.stdout.write(f'Created membership for {member.get_full_name()} at {fitness_ahmedabad.name}')
        
        # Create memberships for Power Gym Ahmedabad
        for member in power_members:
            plan = random.choice(power_plans)
            start_date = timezone.now().date() - timedelta(days=random.randint(1, 365))
            end_date = start_date + timedelta(days=plan.duration_months * 30)
            
            membership, created = Membership.objects.get_or_create(
                member=member,
                gym=power_gym_ahmedabad,
                plan=plan,
                defaults={
                    'status': 'approved',
                    'start_date': start_date,
                    'end_date': end_date
                }
            )
            if created:
                self.stdout.write(f'Created membership for {member.get_full_name()} at {power_gym_ahmedabad.name}')
        
        # Create memberships for other gyms
        for member in other_members:
            plan = random.choice(other_plans)
            start_date = timezone.now().date() - timedelta(days=random.randint(1, 365))
            end_date = start_date + timedelta(days=plan.duration_months * 30)
            
            membership, created = Membership.objects.get_or_create(
                member=member,
                gym=plan.gym,
                plan=plan,
                defaults={
                    'status': 'approved',
                    'start_date': start_date,
                    'end_date': end_date
                }
            )
            if created:
                self.stdout.write(f'Created membership for {member.get_full_name()} at {plan.gym.name}')

    def create_attendance_records(self):
        memberships = Membership.objects.filter(status='approved')
        
        for membership in memberships:
            # Generate random attendance records for the last 30 days
            attendance_dates = set()
            num_attendances = random.randint(5, 25)  # 5-25 attendance records
            
            # Generate unique dates
            while len(attendance_dates) < num_attendances:
                attendance_date = timezone.now().date() - timedelta(days=random.randint(1, 30))
                attendance_dates.add(attendance_date)
            
            # Create attendance records for unique dates
            for attendance_date in attendance_dates:
                attendance, created = Attendance.objects.get_or_create(
                    member=membership.member,
                    gym=membership.gym,
                    date=attendance_date,
                    defaults={
                        'streak_count': random.randint(1, 15)
                    }
                )
                if created:
                    self.stdout.write(f'Created attendance for {membership.member.get_full_name()} on {attendance_date}')

    def create_notices(self, gyms):
        notice_templates = [
            {
                'title': 'Holiday Schedule Update',
                'message': 'Please note that our gym will have modified hours during the upcoming holiday. Check our schedule for details.'
            },
            {
                'title': 'New Equipment Arrival',
                'message': 'We are excited to announce the arrival of new state-of-the-art equipment! Come check it out.'
            },
            {
                'title': 'Group Class Schedule',
                'message': 'Updated group class schedule is now available. New classes have been added to accommodate all fitness levels.'
            },
            {
                'title': 'Maintenance Notice',
                'message': 'Scheduled maintenance will take place this weekend. Some equipment may be temporarily unavailable.'
            },
            {
                'title': 'Member Appreciation Day',
                'message': 'Join us for our monthly member appreciation day with special classes and refreshments!'
            }
        ]
        
        for gym in gyms:
            for template in notice_templates:
                notice, created = Notice.objects.get_or_create(
                    gym=gym,
                    title=template['title'],
                    defaults={
                        'message': template['message'],
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(f'Created notice "{notice.title}" for {gym.name}')
