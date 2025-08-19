#!/usr/bin/env python
"""
Script to add sample gyms to the database
Run this script to populate the database with sample gyms for testing
"""

import os
import sys
import django
from datetime import date

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitnexus.settings')
django.setup()

from api.models import User, Gym

def create_sample_gyms():
    """Create sample gyms with owners"""
    
    # Sample gym data
    sample_gyms = [
        {
            'name': 'FitNexus Central',
            'address': '123 Fitness Street, Downtown, New York',
            'phone': '+1-555-0123',
            'email': 'info@fitnexuscentral.com',
            'description': 'Premium fitness center with state-of-the-art equipment and fitness programs.',
            'owner_username': 'gymowner1',
            'owner_email': 'owner1@fitnexuscentral.com',
            'owner_password': 'gymowner123'
        },
        {
            'name': 'PowerHouse Gym',
            'address': '456 Muscle Avenue, Midtown, New York',
            'phone': '+1-555-0456',
            'email': 'contact@powerhousegym.com',
            'description': 'Specialized in strength training and bodybuilding with professional equipment.',
            'owner_username': 'gymowner2',
            'owner_email': 'owner2@powerhousegym.com',
            'owner_password': 'gymowner123'
        },
        {
            'name': 'Elite Fitness Club',
            'address': '789 Wellness Boulevard, Uptown, New York',
            'phone': '+1-555-0789',
            'email': 'hello@elitefitness.com',
            'description': 'Luxury fitness club with spa facilities and personal training services.',
            'owner_username': 'gymowner3',
            'owner_email': 'owner3@elitefitness.com',
            'owner_password': 'gymowner123'
        },
        {
            'name': 'CrossFit Warriors',
            'address': '321 Strength Lane, Brooklyn, New York',
            'phone': '+1-555-0321',
            'email': 'info@crossfitwarriors.com',
            'description': 'High-intensity functional fitness training for all levels.',
            'owner_username': 'gymowner4',
            'owner_email': 'owner4@crossfitwarriors.com',
            'owner_password': 'gymowner123'
        },
        {
            'name': 'Yoga & Wellness Center',
            'address': '654 Peace Street, Queens, New York',
            'phone': '+1-555-0654',
            'email': 'contact@yogawellness.com',
            'description': 'Holistic wellness center offering yoga, meditation, and wellness programs.',
            'owner_username': 'gymowner5',
            'owner_email': 'owner5@yogawellness.com',
            'owner_password': 'gymowner123'
        },
        {
            'name': 'Sports Performance Lab',
            'address': '987 Athletic Drive, Manhattan, New York',
            'phone': '+1-555-0987',
            'email': 'info@sportsperformance.com',
            'description': 'Advanced sports training facility with performance testing and coaching.',
            'owner_username': 'gymowner6',
            'owner_email': 'owner6@sportsperformance.com',
            'owner_password': 'gymowner123'
        },
        {
            'name': 'Community Fitness Hub',
            'address': '147 Community Road, Bronx, New York',
            'phone': '+1-555-0147',
            'email': 'hello@communityfitness.com',
            'description': 'Family-friendly fitness center with programs for all ages.',
            'owner_username': 'gymowner7',
            'owner_email': 'owner7@communityfitness.com',
            'owner_password': 'gymowner123'
        },
        {
            'name': '24/7 Fitness Express',
            'address': '258 Express Way, Staten Island, New York',
            'phone': '+1-555-0258',
            'email': 'contact@247fitness.com',
            'description': 'Round-the-clock fitness access with modern equipment and flexible hours.',
            'owner_username': 'gymowner8',
            'owner_email': 'owner8@247fitness.com',
            'owner_password': 'gymowner123'
        }
    ]
    
    created_count = 0
    skipped_count = 0
    
    for gym_data in sample_gyms:
        try:
            # Check if gym already exists
            if Gym.objects.filter(name=gym_data['name']).exists():
                print(f"Gym '{gym_data['name']}' already exists, skipping...")
                skipped_count += 1
                continue
            
            # Create or get the owner
            owner, created = User.objects.get_or_create(
                username=gym_data['owner_username'],
                defaults={
                    'email': gym_data['owner_email'],
                    'role': 'admin',
                    'is_staff': True,
                    'is_active': True
                }
            )
            
            if created:
                owner.set_password(gym_data['owner_password'])
                owner.save()
                print(f"Created owner: {gym_data['owner_username']}")
            
            # Create the gym
            gym = Gym.objects.create(
                name=gym_data['name'],
                address=gym_data['address'],
                phone=gym_data['phone'],
                email=gym_data['email'],
                description=gym_data['description'],
                owner=owner
            )
            
            print(f"✅ Created gym: {gym.name} (Owner: {owner.username})")
            created_count += 1
            
        except Exception as e:
            print(f"❌ Error creating gym '{gym_data['name']}': {str(e)}")
    
    print(f"\n🎯 Summary:")
    print(f"   Created: {created_count} gyms")
    print(f"   Skipped: {skipped_count} gyms (already existed)")
    print(f"   Total gyms in database: {Gym.objects.count()}")
    
    # Display all gyms
    print(f"\n📋 All available gyms:")
    for gym in Gym.objects.all():
        print(f"   • {gym.name} - {gym.address}")

if __name__ == '__main__':
    print("🏋️ Setting up sample gyms...")
    create_sample_gyms()
    print("\n✅ Gym setup completed!")
