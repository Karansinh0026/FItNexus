from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .exercise_recommender import ExerciseRecommender
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize the recommender
try:
    recommender = ExerciseRecommender()
    print("✅ Exercise recommender initialized successfully")
except Exception as e:
    print(f"❌ Error initializing exercise recommender: {e}")
    logger.error(f"Failed to initialize exercise recommender: {e}")
    recommender = None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    """Get personalized exercise recommendations"""
    if not recommender:
        return Response(
            {"error": "Recommendation service unavailable"}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    try:
        user_profile = request.data
        if not user_profile:
            return Response(
                {"error": "User profile data is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        num_recommendations = user_profile.get('num_recommendations', 5)
        
        # Validate user profile data
        required_fields = ['age', 'weight', 'height', 'gender', 'experience_level']
        for field in required_fields:
            if field not in user_profile:
                user_profile[field] = {
                    'age': 25,
                    'weight': 70,
                    'height': 170,
                    'gender': 'male',
                    'experience_level': 'beginner'
                }[field]
        
        recommendations = recommender.get_recommendations(user_profile, num_recommendations)
        
        return Response({
            'recommendations': recommendations,
            'total_found': len(recommendations),
            'user_profile': user_profile
        })
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return Response(
            {"error": "Failed to get recommendations", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exercise_categories(request):
    """Get available exercise categories for filtering"""
    if not recommender:
        return Response(
            {"error": "Recommendation service unavailable"}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    try:
        categories = recommender.get_exercise_categories()
        return Response(categories)
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        return Response(
            {"error": "Failed to get categories", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def filter_exercises(request):
    """Filter exercises based on criteria"""
    if not recommender:
        return Response(
            {"error": "Recommendation service unavailable"}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    try:
        filters = request.data or {}
        exercises = recommender.filter_exercises(filters)
        
        return Response({
            'exercises': exercises,
            'total_found': len(exercises),
            'filters_applied': filters
        })
    except Exception as e:
        logger.error(f"Error filtering exercises: {e}")
        return Response(
            {"error": "Failed to filter exercises", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_similar_exercises(request):
    """Get similar exercises based on exercise name"""
    if not recommender:
        return Response(
            {"error": "Recommendation service unavailable"}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    try:
        exercise_name = request.data.get('exercise_name')
        if not exercise_name:
            return Response(
                {"error": "Exercise name is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        num_recommendations = request.data.get('num_recommendations', 5)
        similar_exercises = recommender.get_similar_exercises(exercise_name, num_recommendations)
        
        return Response({
            'similar_exercises': similar_exercises,
            'total_found': len(similar_exercises),
            'base_exercise': exercise_name
        })
    except Exception as e:
        logger.error(f"Error getting similar exercises: {e}")
        return Response(
            {"error": "Failed to get similar exercises", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_check(request):
    """Health check endpoint for the ML service"""
    try:
        if recommender and recommender.exercises_df is not None:
            return Response({
                'status': 'healthy',
                'total_exercises': len(recommender.exercises_df),
                'service': 'exercise_recommender'
            })
        else:
            return Response(
                {'status': 'unhealthy', 'error': 'Recommender not initialized'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return Response(
            {'status': 'unhealthy', 'error': str(e)}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
