import pandas as pd
import numpy as np
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import random

class ExerciseRecommender:
    def __init__(self):
        self.exercises_df = None
        self.tfidf_matrix = None
        self.tfidf_vectorizer = None
        self.similarity_matrix = None
        self._load_dataset()
        self._build_similarity_matrix()
        
    def _load_dataset(self):
        """Load the exercise dataset"""
        try:
            # Try to load the dataset from the project root
            dataset_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'cleaned_megaGymDataset.csv')
            if os.path.exists(dataset_path):
                self.exercises_df = pd.read_csv(dataset_path)
                # Clean the data
                self.exercises_df = self.exercises_df.dropna(subset=['Title', 'Desc', 'Type', 'BodyPart'])
                self.exercises_df['Rating'] = self.exercises_df['Rating'].fillna(7.0)
                self.exercises_df['Level'] = self.exercises_df['Level'].fillna('Intermediate')
                self.exercises_df['Equipment'] = self.exercises_df['Equipment'].fillna('Body Only')
                
                print(f"✅ Loaded {len(self.exercises_df)} exercises from dataset")
            else:
                # Fallback to sample data if dataset not found
                self.exercises_df = self._create_sample_data()
                print("⚠️ Dataset not found, using sample data")
        except Exception as e:
            print(f"Error loading dataset: {e}")
            self.exercises_df = self._create_sample_data()
    
    def _build_similarity_matrix(self):
        """Build similarity matrix for content-based filtering"""
        try:
            # Combine text features for similarity calculation
            self.exercises_df['combined_features'] = (
                self.exercises_df['Title'] + ' ' + 
                self.exercises_df['Desc'] + ' ' + 
                self.exercises_df['Type'] + ' ' + 
                self.exercises_df['BodyPart'] + ' ' + 
                self.exercises_df['Equipment'] + ' ' + 
                self.exercises_df['Level']
            )
            
            # Create TF-IDF vectorizer
            self.tfidf_vectorizer = TfidfVectorizer(
                stop_words='english',
                max_features=5000,
                ngram_range=(1, 2)
            )
            
            # Create TF-IDF matrix
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.exercises_df['combined_features'])
            
            # Calculate cosine similarity
            self.similarity_matrix = cosine_similarity(self.tfidf_matrix)
            
            print("✅ Similarity matrix built successfully")
        except Exception as e:
            print(f"Error building similarity matrix: {e}")
            self.similarity_matrix = None
    
    def _create_sample_data(self):
        """Create sample exercise data as fallback"""
        exercises_data = [
            {
                'Title': 'Push-ups', 'Type': 'Strength', 'Equipment': 'Body Only', 
                'Level': 'Beginner', 'BodyPart': 'Chest', 'Rating': 8.5, 
                'Desc': 'Classic chest exercise', 'RatingDesc': 'Good'
            },
            {
                'Title': 'Squats', 'Type': 'Strength', 'Equipment': 'Body Only', 
                'Level': 'Beginner', 'BodyPart': 'Quadriceps', 'Rating': 9.0, 
                'Desc': 'Lower body strength exercise', 'RatingDesc': 'Excellent'
            },
            {
                'Title': 'Pull-ups', 'Type': 'Strength', 'Equipment': 'Body Only', 
                'Level': 'Intermediate', 'BodyPart': 'Lats', 'Rating': 8.8, 
                'Desc': 'Upper body pulling exercise', 'RatingDesc': 'Good'
            },
            {
                'Title': 'Running', 'Type': 'Cardio', 'Equipment': 'Body Only', 
                'Level': 'Beginner', 'BodyPart': 'Quadriceps', 'Rating': 9.2, 
                'Desc': 'Aerobic cardiovascular exercise', 'RatingDesc': 'Excellent'
            },
            {
                'Title': 'Plank', 'Type': 'Strength', 'Equipment': 'Body Only', 
                'Level': 'Beginner', 'BodyPart': 'Abdominals', 'Rating': 9.3, 
                'Desc': 'Core stability exercise', 'RatingDesc': 'Excellent'
            }
        ]
        return pd.DataFrame(exercises_data)
    
    def get_recommendations(self, user_profile, num_recommendations=5):
        """Get personalized exercise recommendations based on user profile"""
        try:
            # Extract user features
            age = user_profile.get('age', 30)
            weight = user_profile.get('weight', 70)
            height = user_profile.get('height', 170)
            gender = user_profile.get('gender', 'male')
            experience_level = user_profile.get('experience_level', 'beginner')
            
            # Create personalized exercise pool based on user characteristics
            personalized_exercises = self._get_personalized_exercise_pool(user_profile)
            
            if len(personalized_exercises) == 0:
                # Fallback to all exercises if no personalized matches
                personalized_exercises = self.exercises_df.copy()
            
            # Apply experience level filtering
            filtered_exercises = self._filter_by_experience_level(personalized_exercises, experience_level)
            
            # Apply age-based filtering
            filtered_exercises = self._filter_by_age(filtered_exercises, age)
            
            # Apply gender-based preferences
            filtered_exercises = self._apply_gender_preferences(filtered_exercises, gender)
            
            # If still no exercises, use all exercises
            if len(filtered_exercises) == 0:
                filtered_exercises = self.exercises_df.copy()
            
            # Sort by rating and get diverse recommendations
            filtered_exercises = filtered_exercises.sort_values('Rating', ascending=False)
            
            # Get diverse recommendations (different body parts and types)
            diverse_recommendations = self._get_diverse_recommendations(filtered_exercises, num_recommendations)
            
            recommendations = []
            for _, exercise in diverse_recommendations.iterrows():
                # Calculate personalized similarity score
                similarity_score = self._calculate_personalized_score(exercise, user_profile)
                
                recommendations.append({
                    'name': exercise['Title'],
                    'type': exercise['Type'],
                    'equipment': exercise['Equipment'],
                    'level': exercise['Level'],
                    'body_part': exercise['BodyPart'],
                    'calories_burned': self._estimate_calories(exercise, user_profile),
                    'duration': self._estimate_duration(exercise, user_profile),
                    'description': exercise['Desc'],
                    'instructions': self._generate_instructions(exercise),
                    'similarity_score': similarity_score,
                    'rating': exercise.get('Rating', 7.0),
                    'recommended_for': self._generate_recommendation_reason(exercise, user_profile),
                    'difficulty': self._get_difficulty_level(exercise, user_profile),
                    'target_muscles': self._get_target_muscles(exercise),
                    'benefits': self._get_exercise_benefits(exercise, user_profile)
                })
            
            return recommendations
        except Exception as e:
            print(f"Error in get_recommendations: {e}")
            # Return basic recommendations if anything fails
            basic_exercises = self.exercises_df.head(num_recommendations)
            recommendations = []
            for _, exercise in basic_exercises.iterrows():
                recommendations.append({
                    'name': exercise['Title'],
                    'type': exercise['Type'],
                    'equipment': exercise['Equipment'],
                    'level': exercise['Level'],
                    'body_part': exercise['BodyPart'],
                    'calories_burned': 10,
                    'duration': 15,
                    'description': exercise['Desc'],
                    'instructions': self._generate_instructions(exercise),
                    'similarity_score': 0.5,
                    'rating': exercise.get('Rating', 7.0),
                    'recommended_for': f"Basic recommendation for {user_profile.get('experience_level', 'beginner')} level",
                    'difficulty': 'Moderate',
                    'target_muscles': exercise['BodyPart'],
                    'benefits': 'General fitness improvement'
                })
            return recommendations
    
    def _get_personalized_exercise_pool(self, user_profile):
        """Get a personalized pool of exercises based on user characteristics"""
        age = user_profile.get('age', 30)
        gender = user_profile.get('gender', 'male')
        experience_level = user_profile.get('experience_level', 'beginner')
        
        # Start with all exercises
        pool = self.exercises_df.copy()
        
        # Age-based preferences
        if age < 18:
            # Teenagers: Focus on bodyweight, cardio, and basic strength
            preferred_types = ['Cardio', 'Strength', 'Plyometrics']
            preferred_equipment = ['Body Only', 'Dumbbell']
            pool = pool[pool['Type'].isin(preferred_types) | pool['Equipment'].isin(preferred_equipment)]
        elif age < 25:
            # Young adults: Can handle more variety
            pass  # Use all exercises
        elif age < 40:
            # Adults: Focus on functional fitness
            preferred_types = ['Strength', 'Cardio', 'Stretching']
            pool = pool[pool['Type'].isin(preferred_types)]
        elif age < 60:
            # Middle-aged: Focus on joint-friendly exercises
            preferred_equipment = ['Body Only', 'Cable', 'Dumbbell']
            preferred_types = ['Strength', 'Cardio', 'Stretching']
            pool = pool[(pool['Equipment'].isin(preferred_equipment)) & (pool['Type'].isin(preferred_types))]
        else:
            # Seniors: Focus on low-impact, stability exercises
            preferred_equipment = ['Body Only', 'Cable']
            preferred_types = ['Strength', 'Stretching', 'Cardio']
            pool = pool[(pool['Equipment'].isin(preferred_equipment)) & (pool['Type'].isin(preferred_types))]
        
        return pool
    
    def _filter_by_experience_level(self, exercises, experience_level):
        """Filter exercises by experience level"""
        if experience_level.lower() == 'beginner':
            return exercises[exercises['Level'].str.lower() == 'beginner']
        elif experience_level.lower() == 'intermediate':
            return exercises[exercises['Level'].str.lower().isin(['beginner', 'intermediate'])]
        else:  # advanced
            return exercises  # Can do all exercises
    
    def _filter_by_age(self, exercises, age):
        """Apply age-specific filtering"""
        if age < 18:
            # Avoid very heavy weights and complex movements
            exercises = exercises[exercises['Equipment'] != 'Barbell']
        elif age > 50:
            # Avoid high-impact exercises
            exercises = exercises[exercises['Type'] != 'Plyometrics']
        
        return exercises
    
    def _apply_gender_preferences(self, exercises, gender):
        """Apply gender-specific exercise preferences"""
        if gender.lower() == 'female':
            # Women often prefer: core, lower body, cardio, flexibility
            preferred_body_parts = ['Abdominals', 'Glutes', 'Quadriceps', 'Calves', 'Hamstrings']
            preferred_types = ['Cardio', 'Strength', 'Stretching']
            
            # Boost exercises that target preferred areas
            preferred_exercises = exercises[
                (exercises['BodyPart'].isin(preferred_body_parts)) |
                (exercises['Type'].isin(preferred_types))
            ]
            
            # If we have enough preferred exercises, use them
            if len(preferred_exercises) >= 10:
                return preferred_exercises
            else:
                return exercises
        else:  # male
            # Men often prefer: upper body, strength, power
            preferred_body_parts = ['Chest', 'Biceps', 'Triceps', 'Shoulders', 'Lats']
            preferred_types = ['Strength', 'Powerlifting', 'Olympic Weightlifting']
            
            # Boost exercises that target preferred areas
            preferred_exercises = exercises[
                (exercises['BodyPart'].isin(preferred_body_parts)) |
                (exercises['Type'].isin(preferred_types))
            ]
            
            # If we have enough preferred exercises, use them
            if len(preferred_exercises) >= 10:
                return preferred_exercises
            else:
                return exercises
    
    def _get_diverse_recommendations(self, exercises, num_recommendations):
        """Get diverse recommendations across different body parts and types"""
        if len(exercises) <= num_recommendations:
            return exercises
        
        # Group by body part and type to ensure diversity
        diverse_exercises = []
        body_parts = exercises['BodyPart'].unique()
        exercise_types = exercises['Type'].unique()
        
        # Get top exercises from each body part
        for body_part in body_parts:
            body_part_exercises = exercises[exercises['BodyPart'] == body_part].head(2)
            diverse_exercises.extend(body_part_exercises.to_dict('records'))
        
        # Get top exercises from each type
        for exercise_type in exercise_types:
            type_exercises = exercises[exercises['Type'] == exercise_type].head(2)
            diverse_exercises.extend(type_exercises.to_dict('records'))
        
        # Convert back to DataFrame and remove duplicates
        diverse_df = pd.DataFrame(diverse_exercises).drop_duplicates(subset=['Title'])
        
        # Sort by rating and return top recommendations
        diverse_df = diverse_df.sort_values('Rating', ascending=False)
        return diverse_df.head(num_recommendations)
    
    def _calculate_personalized_score(self, exercise, user_profile):
        """Calculate a personalized similarity score"""
        score = 0.5  # Base score
        
        # Experience level matching
        user_level = user_profile.get('experience_level', 'beginner').lower()
        exercise_level = exercise['Level'].lower()
        
        if user_level == exercise_level:
            score += 0.3
        elif user_level == 'intermediate' and exercise_level == 'beginner':
            score += 0.2
        elif user_level == 'advanced':
            score += 0.2
        
        # Age considerations
        age = user_profile.get('age', 30)
        if age < 18 and exercise['Equipment'] == 'Body Only':
            score += 0.1
        elif age > 50 and exercise['Equipment'] in ['Body Only', 'Cable']:
            score += 0.1
        
        # Gender preferences
        gender = user_profile.get('gender', 'male')
        if gender.lower() == 'female':
            if exercise['BodyPart'] in ['Abdominals', 'Glutes', 'Quadriceps']:
                score += 0.1
        else:  # male
            if exercise['BodyPart'] in ['Chest', 'Biceps', 'Triceps']:
                score += 0.1
        
        # Rating bonus
        rating = exercise.get('Rating', 7.0)
        if rating > 8.0:
            score += 0.1
        
        return min(score, 1.0)
    
    def _generate_recommendation_reason(self, exercise, user_profile):
        """Generate a personalized reason for the recommendation"""
        age = user_profile.get('age', 30)
        gender = user_profile.get('gender', 'male')
        experience_level = user_profile.get('experience_level', 'beginner')
        
        reasons = []
        
        # Age-based reasons
        if age < 18:
            reasons.append("Great for developing fitness foundation")
        elif age < 25:
            reasons.append("Perfect for building strength and endurance")
        elif age < 40:
            reasons.append("Excellent for maintaining fitness and health")
        elif age < 60:
            reasons.append("Joint-friendly and effective for your age group")
        else:
            reasons.append("Safe and effective for senior fitness")
        
        # Gender-based reasons
        if gender.lower() == 'female':
            if exercise['BodyPart'] in ['Abdominals', 'Glutes']:
                reasons.append("Targets areas commonly focused on by women")
        else:
            if exercise['BodyPart'] in ['Chest', 'Biceps']:
                reasons.append("Builds upper body strength")
        
        # Experience-based reasons
        if experience_level == 'beginner':
            reasons.append("Perfect for beginners")
        elif experience_level == 'intermediate':
            reasons.append("Challenging but achievable")
        else:
            reasons.append("Advanced exercise for experienced users")
        
        return " • ".join(reasons)
    
    def _get_difficulty_level(self, exercise, user_profile):
        """Get difficulty level relative to user"""
        user_level = user_profile.get('experience_level', 'beginner')
        exercise_level = exercise['Level']
        
        if user_level == 'beginner' and exercise_level == 'Beginner':
            return 'Easy'
        elif user_level == 'beginner' and exercise_level == 'Intermediate':
            return 'Moderate'
        elif user_level == 'intermediate' and exercise_level == 'Beginner':
            return 'Easy'
        elif user_level == 'intermediate' and exercise_level == 'Intermediate':
            return 'Moderate'
        elif user_level == 'advanced':
            return 'Challenging'
        else:
            return 'Moderate'
    
    def _get_target_muscles(self, exercise):
        """Get target muscles for the exercise"""
        body_part = exercise['BodyPart']
        muscle_mapping = {
            'Chest': 'Pectoralis Major, Anterior Deltoids',
            'Biceps': 'Biceps Brachii, Brachialis',
            'Triceps': 'Triceps Brachii',
            'Shoulders': 'Deltoids (Anterior, Lateral, Posterior)',
            'Lats': 'Latissimus Dorsi',
            'Abdominals': 'Rectus Abdominis, Obliques, Transverse Abdominis',
            'Quadriceps': 'Rectus Femoris, Vastus Lateralis, Vastus Medialis, Vastus Intermedius',
            'Hamstrings': 'Biceps Femoris, Semitendinosus, Semimembranosus',
            'Glutes': 'Gluteus Maximus, Gluteus Medius, Gluteus Minimus',
            'Calves': 'Gastrocnemius, Soleus',
            'Lower Back': 'Erector Spinae',
            'Middle Back': 'Rhomboids, Trapezius',
            'Traps': 'Trapezius',
            'Forearms': 'Flexors, Extensors',
            'Adductors': 'Adductor Magnus, Adductor Longus, Adductor Brevis',
            'Abductors': 'Gluteus Medius, Tensor Fasciae Latae'
        }
        return muscle_mapping.get(body_part, body_part)
    
    def _get_exercise_benefits(self, exercise, user_profile):
        """Get exercise benefits based on user profile"""
        age = user_profile.get('age', 30)
        gender = user_profile.get('gender', 'male')
        
        benefits = []
        
        # General benefits based on exercise type
        if exercise['Type'] == 'Strength':
            benefits.append("Builds muscle strength")
            benefits.append("Improves bone density")
        elif exercise['Type'] == 'Cardio':
            benefits.append("Improves cardiovascular health")
            benefits.append("Burns calories")
        elif exercise['Type'] == 'Stretching':
            benefits.append("Improves flexibility")
            benefits.append("Reduces muscle tension")
        
        # Age-specific benefits
        if age < 25:
            benefits.append("Builds foundation for lifelong fitness")
        elif age < 40:
            benefits.append("Maintains muscle mass and metabolism")
        elif age < 60:
            benefits.append("Supports healthy aging")
        else:
            benefits.append("Maintains independence and mobility")
        
        return ", ".join(benefits)
    
    def _estimate_calories(self, exercise, user_profile):
        """Estimate calories burned based on exercise type and user profile"""
        base_calories = {
            'Strength': 8,
            'Cardio': 15,
            'Plyometrics': 12,
            'Stretching': 3,
            'Powerlifting': 10,
            'Olympic Weightlifting': 12,
            'Strongman': 14
        }
        
        calories = base_calories.get(exercise['Type'], 10)
        
        # Adjust based on user weight
        weight = user_profile.get('weight', 70)
        if weight > 80:
            calories += 3
        elif weight < 60:
            calories -= 2
        
        # Adjust based on age
        age = user_profile.get('age', 30)
        if age > 50:
            calories = int(calories * 0.8)  # Lower metabolism
        
        return max(calories, 3)
    
    def _estimate_duration(self, exercise, user_profile):
        """Estimate exercise duration based on type and user profile"""
        base_duration = {
            'Strength': 12,
            'Cardio': 25,
            'Plyometrics': 15,
            'Stretching': 8,
            'Powerlifting': 15,
            'Olympic Weightlifting': 18,
            'Strongman': 20
        }
        
        duration = base_duration.get(exercise['Type'], 15)
        
        # Adjust based on experience level
        experience = user_profile.get('experience_level', 'beginner')
        if experience == 'beginner':
            duration += 5
        elif experience == 'advanced':
            duration -= 3
        
        # Adjust based on age
        age = user_profile.get('age', 30)
        if age > 50:
            duration += 3  # More rest time needed
        
        return max(duration, 5)
    
    def _generate_instructions(self, exercise):
        """Generate basic instructions based on exercise type"""
        exercise_type = exercise['Type']
        body_part = exercise['BodyPart']
        
        if exercise_type == 'Strength':
            return f"Perform 3 sets of 8-12 reps for {body_part} strength. Focus on proper form and controlled movement."
        elif exercise_type == 'Cardio':
            return f"Perform for 20-30 minutes at moderate intensity. Maintain steady pace throughout."
        elif exercise_type == 'Plyometrics':
            return f"Perform 3 sets of 10-15 reps with explosive movement. Rest 60-90 seconds between sets."
        elif exercise_type == 'Stretching':
            return f"Hold each stretch for 20-30 seconds. Breathe deeply and don't bounce."
        else:
            return f"Follow the exercise description and maintain proper form throughout the movement."
    
    def get_exercise_categories(self):
        """Get available exercise categories for filtering"""
        try:
            categories = {
                'types': sorted(self.exercises_df['Type'].unique().tolist()),
                'body_parts': sorted(self.exercises_df['BodyPart'].unique().tolist()),
                'equipment': sorted(self.exercises_df['Equipment'].unique().tolist()),
                'levels': sorted(self.exercises_df['Level'].unique().tolist())
            }
            return categories
        except Exception as e:
            print(f"Error getting categories: {e}")
            return {
                'types': ['Strength', 'Cardio', 'Plyometrics'],
                'body_parts': ['Chest', 'Back', 'Legs', 'Arms', 'Abdominals'],
                'equipment': ['Body Only', 'Dumbbell', 'Barbell', 'Cable'],
                'levels': ['Beginner', 'Intermediate', 'Advanced']
            }
    
    def filter_exercises(self, filters):
        """Filter exercises based on provided criteria"""
        try:
            filtered = self.exercises_df.copy()
            
            if filters.get('type'):
                filtered = filtered[filtered['Type'] == filters['type']]
            
            if filters.get('body_part'):
                filtered = filtered[filtered['BodyPart'] == filters['body_part']]
            
            if filters.get('equipment'):
                filtered = filtered[filtered['Equipment'] == filters['equipment']]
            
            if filters.get('level'):
                filtered = filtered[filtered['Level'] == filters['level']]
            
            if filters.get('min_rating'):
                filtered = filtered[filtered['Rating'] >= float(filters['min_rating'])]
            
            # Sort by rating
            filtered = filtered.sort_values('Rating', ascending=False)
            
            exercises = []
            for _, exercise in filtered.iterrows():
                exercises.append({
                    'name': exercise['Title'],
                    'type': exercise['Type'],
                    'equipment': exercise['Equipment'],
                    'level': exercise['Level'],
                    'body_part': exercise['BodyPart'],
                    'calories_burned': self._estimate_calories(exercise, {}),
                    'duration': self._estimate_duration(exercise, {}),
                    'description': exercise['Desc'],
                    'rating': exercise.get('Rating', 7.0)
                })
            
            return exercises
        except Exception as e:
            print(f"Error filtering exercises: {e}")
            return []
    
    def get_similar_exercises(self, exercise_name, num_recommendations=5):
        """Get similar exercises based on exercise name"""
        try:
            # Find the exercise in the dataset
            exercise_idx = self.exercises_df[self.exercises_df['Title'] == exercise_name].index
            if len(exercise_idx) == 0:
                return []
            
            exercise_idx = exercise_idx[0]
            
            if self.similarity_matrix is not None and exercise_idx < len(self.similarity_matrix):
                # Get similarity scores for this exercise
                similarities = self.similarity_matrix[exercise_idx]
                
                # Get indices of most similar exercises (excluding itself)
                similar_indices = np.argsort(similarities)[::-1][1:num_recommendations+1]
                
                similar_exercises = []
                for idx in similar_indices:
                    if idx < len(self.exercises_df):
                        exercise = self.exercises_df.iloc[idx]
                        similar_exercises.append({
                            'name': exercise['Title'],
                            'type': exercise['Type'],
                            'equipment': exercise['Equipment'],
                            'level': exercise['Level'],
                            'body_part': exercise['BodyPart'],
                            'description': exercise['Desc'],
                            'rating': exercise.get('Rating', 7.0),
                            'similarity_score': similarities[idx]
                        })
                
                return similar_exercises
            
            return []
        except Exception as e:
            print(f"Error getting similar exercises: {e}")
            return []
