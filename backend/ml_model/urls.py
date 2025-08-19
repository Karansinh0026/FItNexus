from django.urls import path
from .views import (
    get_recommendations, 
    get_exercise_categories, 
    filter_exercises, 
    get_similar_exercises,
    health_check
)

urlpatterns = [
    path('recommendations/', get_recommendations, name='get_recommendations'),
    path('categories/', get_exercise_categories, name='get_exercise_categories'),
    path('filter/', filter_exercises, name='filter_exercises'),
    path('similar/', get_similar_exercises, name='get_similar_exercises'),
    path('health/', health_check, name='health_check'),
]
