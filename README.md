# FitNexus - AI-Powered Gym Management System

A comprehensive gym management system with AI-powered exercise recommendations using a real dataset.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - Secure login/register with JWT tokens
- **Gym Management** - Admin dashboard for gym owners
- **Member Management** - Track members, attendance, and streaks
- **AI Exercise Recommendations** - Personalized workout suggestions

### AI Exercise Recommendation System
- **Content-Based Filtering** - Uses TF-IDF and cosine similarity
- **Personalized Recommendations** - Based on user profile (age, weight, experience level)
- **Real Dataset** - Uses cleaned MegaGym dataset with 1,359+ exercises
- **Smart Filtering** - Filter by type, body part, equipment, level
- **Similar Exercise Suggestions** - Find related exercises

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (can be upgraded to PostgreSQL)
- **scikit-learn** - Machine learning for recommendations
- **pandas & numpy** - Data processing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client

## 📊 Dataset

The system uses the **cleaned_megaGymDataset.csv** containing:
- 1,359+ exercises
- Exercise details: Title, Description, Type, Body Part, Equipment, Level, Rating
- Multiple exercise types: Strength, Cardio, Plyometrics, Stretching
- Various equipment types: Body Only, Dumbbell, Barbell, Cable, Machine, etc.

## 🏃‍♂️ Exercise Recommendation Algorithm

### Content-Based Filtering
1. **Feature Engineering**: Combines exercise title, description, type, body part, equipment, and level
2. **TF-IDF Vectorization**: Converts text features to numerical vectors
3. **Cosine Similarity**: Calculates similarity between exercises
4. **User Profile Matching**: Filters based on age, experience level, and preferences
5. **Rating & Similarity Scoring**: Combines exercise ratings with similarity scores

### Personalization Factors
- **Age-based filtering**: Different recommendations for different age groups
- **Experience level**: Beginner, Intermediate, Advanced
- **Equipment availability**: Bodyweight vs. gym equipment
- **Body part focus**: Target specific muscle groups
- **Exercise ratings**: Prioritize highly-rated exercises

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Test the System
```bash
# Test the ML model
cd backend
python test_backend.py

# Access the application
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

## 📁 Project Structure

```
final fitnexus/
├── backend/
│   ├── api/                 # Main API app
│   ├── ml_model/           # AI recommendation system
│   │   ├── exercise_recommender.py  # Core ML model
│   │   ├── views.py        # API endpoints
│   │   └── urls.py         # URL routing
│   ├── fitnexus/           # Django settings
│   └── test_backend.py     # Test script
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── contexts/       # React contexts
│   └── package.json
└── cleaned_megaGymDataset.csv  # Exercise dataset
```

## 🔧 API Endpoints

### ML Model Endpoints
- `POST /api/ml/recommendations/` - Get personalized recommendations
- `GET /api/ml/categories/` - Get exercise categories
- `POST /api/ml/filter/` - Filter exercises
- `POST /api/ml/similar/` - Get similar exercises
- `GET /api/ml/health/` - Health check

### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User registration
- `GET /api/auth/profile/` - Get user profile

## 🎯 Usage Examples

### Get Exercise Recommendations
```javascript
const userProfile = {
  age: 25,
  weight: 70,
  height: 170,
  gender: 'male',
  experience_level: 'beginner'
};

const response = await axios.post('/api/ml/recommendations/', userProfile);
const recommendations = response.data.recommendations;
```

### Filter Exercises
```javascript
const filters = {
  type: 'Strength',
  body_part: 'Chest',
  equipment: 'Dumbbell',
  level: 'Beginner'
};

const response = await axios.post('/api/ml/filter/', filters);
const exercises = response.data.exercises;
```

## 🔍 Improvements Made

### ML Model Enhancements
- ✅ **Real Dataset Integration**: Uses actual exercise data instead of sample data
- ✅ **Content-Based Filtering**: TF-IDF + cosine similarity for better recommendations
- ✅ **Improved Personalization**: Age, experience, and equipment-based filtering
- ✅ **Similar Exercise Suggestions**: Find related exercises
- ✅ **Better Error Handling**: Robust error handling and fallbacks

### Code Quality
- ✅ **Removed Unnecessary Files**: Cleaned up setup scripts and test files
- ✅ **Improved API Design**: Better error responses and validation
- ✅ **Enhanced Logging**: Proper logging for debugging
- ✅ **Health Check Endpoint**: Monitor system status

### Frontend Improvements
- ✅ **Better Error Handling**: User-friendly error messages
- ✅ **Loading States**: Proper loading indicators
- ✅ **Responsive Design**: Works on all screen sizes

## 🧪 Testing

Run the test script to verify the ML model:
```bash
cd backend
python test_backend.py
```

Expected output:
```
✅ Loaded 1359 exercises from dataset
✅ Similarity matrix built successfully
✅ Recommender initialized with 1359 exercises
✅ Got 5 recommendations
🎉 All tests passed!
```

## 🔮 Future Enhancements

- **Collaborative Filtering**: User-based recommendations
- **Workout Planning**: Generate complete workout routines
- **Progress Tracking**: Track user progress and adjust recommendations
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Detailed workout analytics
- **Social Features**: Share workouts and achievements

## 📝 License

This project is for educational purposes. The exercise dataset is from the MegaGym dataset.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**FitNexus** - Empowering fitness with AI-driven recommendations! 💪
