import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ExerciseRoutine = () => {
  // const { user } = useAuth(); // User not currently used but available for future features
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    experience_level: 'beginner'
  });

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/exercise-routines/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutines(data);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  };

  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/exercise-routines/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newRoutine = await response.json();
        setRoutines([newRoutine, ...routines]);
        setShowCreateForm(false);
        setFormData({ age: '', weight: '', height: '', experience_level: 'beginner' });
        alert('Exercise routine created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create routine'}`);
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      alert('Failed to create exercise routine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/exercise-routines/${routineId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setRoutines(routines.filter(routine => routine.id !== routineId));
        if (selectedRoutine?.id === routineId) {
          setSelectedRoutine(null);
        }
        alert('Routine deleted successfully!');
      } else {
        alert('Failed to delete routine');
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      alert('Failed to delete routine');
    }
  };

  const formatRoutineData = (routineData) => {
    if (typeof routineData === 'string') {
      try {
        return JSON.parse(routineData);
      } catch {
        return { raw_response: routineData };
      }
    }
    return routineData;
  };

  const renderRoutineDetails = (routine) => {
    const data = formatRoutineData(routine.routine_data);
    
    if (data.raw_response) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">AI Generated Routine:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-3 rounded border">
            {data.raw_response}
          </pre>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {data.summary && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
            <p className="text-blue-700">{data.summary}</p>
          </div>
        )}
        
        {data.weekly_routine && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Weekly Routine</h4>
            {Object.entries(data.weekly_routine).map(([day, dayRoutine]) => (
              <div key={day} className="bg-white border rounded-lg p-4">
                <h5 className="font-semibold text-lg text-gray-800 mb-3 capitalize">
                  {dayRoutine.day || day}
                </h5>
                
                {dayRoutine.focus && (
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Focus:</span> {dayRoutine.focus}
                  </p>
                )}
                
                <div className="grid md:grid-cols-3 gap-4">
                  {dayRoutine.warmup && (
                    <div>
                      <h6 className="font-medium text-green-700 mb-2">Warm-up</h6>
                      <ul className="text-sm space-y-1">
                        {dayRoutine.warmup.map((exercise, index) => (
                          <li key={index} className="text-gray-700">• {exercise}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {dayRoutine.main_workout && (
                    <div>
                      <h6 className="font-medium text-blue-700 mb-2">Main Workout</h6>
                      <div className="space-y-2">
                        {dayRoutine.main_workout.map((exercise, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <p className="font-medium text-sm">{exercise.exercise}</p>
                            {exercise.sets && <p className="text-xs text-gray-600">Sets: {exercise.sets}</p>}
                            {exercise.reps && <p className="text-xs text-gray-600">Reps: {exercise.reps}</p>}
                            {exercise.rest && <p className="text-xs text-gray-600">Rest: {exercise.rest}</p>}
                            {exercise.notes && <p className="text-xs text-gray-600">{exercise.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dayRoutine.cooldown && (
                    <div>
                      <h6 className="font-medium text-purple-700 mb-2">Cool-down</h6>
                      <ul className="text-sm space-y-1">
                        {dayRoutine.cooldown.map((exercise, index) => (
                          <li key={index} className="text-gray-700">• {exercise}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {dayRoutine.total_duration && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="font-medium">Total Duration:</span> {dayRoutine.total_duration}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {data.safety_tips && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Safety Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              {data.safety_tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        {data.modifications && (
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-2">Modifications</h4>
            <div className="space-y-2">
              {data.modifications.beginner && (
                <div>
                  <span className="font-medium text-indigo-700">Beginner:</span>
                  <p className="text-indigo-700 text-sm">{data.modifications.beginner}</p>
                </div>
              )}
              {data.modifications.advanced && (
                <div>
                  <span className="font-medium text-indigo-700">Advanced:</span>
                  <p className="text-indigo-700 text-sm">{data.modifications.advanced}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Exercise Routines</h1>
        <p className="text-gray-600">
          Get personalized workout routines generated by AI based on your fitness profile
        </p>
      </div>

      {/* Create New Routine Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {showCreateForm ? 'Cancel' : 'Create New Routine'}
        </button>
      </div>

      {/* Create Routine Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Exercise Routine</h2>
          <form onSubmit={handleCreateRoutine} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  min="13"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your weight in kg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your height in cm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level *
                </label>
                <select
                  required
                  value={formData.experience_level}
                  onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Generating...' : 'Generate Routine'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Routines List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Exercise Routines</h2>
        
        {routines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routines yet</h3>
            <p className="text-gray-500">Create your first AI-generated exercise routine to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {routine.experience_level.charAt(0).toUpperCase() + routine.experience_level.slice(1)} Level Routine
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created on {routine.created_at_formatted}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRoutine(selectedRoutine?.id === routine.id ? null : routine)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {selectedRoutine?.id === routine.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{routine.age}</p>
                      <p className="text-sm text-gray-500">Age</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{routine.weight}</p>
                      <p className="text-sm text-gray-500">Weight (kg)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{routine.height}</p>
                      <p className="text-sm text-gray-500">Height (cm)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600 capitalize">{routine.experience_level}</p>
                      <p className="text-sm text-gray-500">Level</p>
                    </div>
                  </div>
                  
                  {selectedRoutine?.id === routine.id && (
                    <div className="border-t pt-4">
                      {renderRoutineDetails(routine)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseRoutine;
