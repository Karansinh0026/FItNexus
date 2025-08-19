#!/usr/bin/env python
"""
Script to fix duplicate gym ownership issues
This script will ensure each admin user owns only one gym
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitnexus.settings')
django.setup()

from api.models import User, Gym

def fix_duplicate_gyms():
    """Fix duplicate gym ownership by keeping only the first gym for each owner"""
    
    print("🔧 Fixing duplicate gym ownership issues...")
    
    # Get all admin users
    admin_users = User.objects.filter(role='admin')
    
    for admin_user in admin_users:
        # Get all gyms owned by this user
        gyms = Gym.objects.filter(owner=admin_user)
        
        if gyms.count() > 1:
            print(f"⚠️  User '{admin_user.username}' owns {gyms.count()} gyms")
            
            # Keep the first gym, delete the rest
            first_gym = gyms.first()
            duplicate_gyms = gyms.exclude(id=first_gym.id)
            
            print(f"   Keeping gym: {first_gym.name}")
            print(f"   Deleting {duplicate_gyms.count()} duplicate gym(s):")
            
            for gym in duplicate_gyms:
                print(f"     - {gym.name}")
                gym.delete()
            
            print(f"   ✅ Fixed: User '{admin_user.username}' now owns 1 gym")
        elif gyms.count() == 1:
            print(f"✅ User '{admin_user.username}' owns 1 gym: {gyms.first().name}")
        else:
            print(f"ℹ️  User '{admin_user.username}' owns 0 gyms (super admin)")
    
    print("\n🎯 Summary:")
    print("   All duplicate gym ownership issues have been resolved!")
    
    # Show final state
    print("\n📋 Final gym ownership status:")
    for admin_user in User.objects.filter(role='admin'):
        gym_count = Gym.objects.filter(owner=admin_user).count()
        if gym_count == 1:
            gym = Gym.objects.filter(owner=admin_user).first()
            print(f"   {admin_user.username}: {gym.name}")
        elif gym_count == 0:
            print(f"   {admin_user.username}: No gym (super admin)")
        else:
            print(f"   {admin_user.username}: {gym_count} gyms (ERROR - should be fixed)")

if __name__ == '__main__':
    print("🏋️ Fixing Duplicate Gym Ownership Issues")
    print("=" * 50)
    fix_duplicate_gyms()
    print("\n✅ Fix completed!")
