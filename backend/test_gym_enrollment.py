#!/usr/bin/env python
"""
Test script for gym enrollment functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_gym_enrollment():
    """Test the gym enrollment functionality"""
    
    print("🏋️ Testing Gym Enrollment Functionality")
    print("=" * 50)
    
    # Test 1: Get all available gyms
    print("\n1. Testing: Get all available gyms")
    try:
        response = requests.get(f"{BASE_URL}/gyms/available/")
        if response.status_code == 200:
            gyms = response.json()
            print(f"✅ Success! Found {len(gyms)} gyms:")
            for gym in gyms:
                print(f"   • {gym['name']} - {gym['address']}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test 2: Search gyms by city
    print("\n2. Testing: Search gyms by city (New York)")
    try:
        response = requests.get(f"{BASE_URL}/gyms/available/?city=New York")
        if response.status_code == 200:
            gyms = response.json()
            print(f"✅ Success! Found {len(gyms)} gyms in New York:")
            for gym in gyms:
                print(f"   • {gym['name']} - {gym['address']}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test 3: Search gyms by city (non-existent)
    print("\n3. Testing: Search gyms by city (non-existent city)")
    try:
        response = requests.get(f"{BASE_URL}/gyms/available/?city=NonExistentCity")
        if response.status_code == 200:
            gyms = response.json()
            print(f"✅ Success! Found {len(gyms)} gyms in NonExistentCity (expected 0)")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Gym enrollment API testing completed!")

if __name__ == '__main__':
    test_gym_enrollment()
