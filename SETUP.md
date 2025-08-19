# FitNexus Setup Guide

Quick setup guide for the FitNexus AI-powered gym management system.

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd final-fitnexus
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create a superuser (admin account)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

The backend will be available at: http://localhost:8000

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: http://localhost:5173

## 🔧 Configuration

### Backend Configuration
- Database: SQLite (default) - can be changed to PostgreSQL in `backend/fitnexus/settings.py`
- JWT Token lifetime: 1 hour (configurable in settings)
- CORS: Configured for localhost development

### Frontend Configuration
- API Base URL: http://localhost:8000 (configured in `frontend/src/contexts/AuthContext.jsx`)
- Build tool: Vite
- Styling: Tailwind CSS

## 🧪 Testing the System

### Test the ML Model
```bash
cd backend
python -c "
import os, sys, django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitnexus.settings')
django.setup()
from ml_model.exercise_recommender import ExerciseRecommender
recommender = ExerciseRecommender()
print(f'✅ Loaded {len(recommender.exercises_df)} exercises')
recommendations = recommender.get_recommendations({'age': 25, 'weight': 70, 'height': 170, 'gender': 'male', 'experience_level': 'beginner'}, 3)
print(f'✅ Got {len(recommendations)} recommendations')
"
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/api/ml/health/

# Get categories (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/ml/categories/
```

## 📊 Default Data

The system comes with:
- **1,359+ exercises** from the MegaGym dataset
- **AI recommendation system** using content-based filtering
- **User authentication** with JWT tokens
- **Gym management** features

## 🔑 Default Admin Account

After running `python manage.py createsuperuser`, you can:
1. Access the admin panel at: http://localhost:8000/admin/
2. Create gyms and manage users
3. Test the full system functionality

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 8000
   lsof -ti:8000 | xargs kill -9
   ```

2. **Python dependencies not found**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Database migration errors**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Frontend build errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs and Debugging

- **Backend logs**: Check the terminal where `python manage.py runserver` is running
- **Frontend logs**: Check browser console (F12)
- **ML model logs**: Check backend terminal for initialization messages

## 📱 Usage

1. **Register/Login**: Create an account or login
2. **Complete Profile**: Add your age, weight, height, and experience level
3. **Get Recommendations**: Visit the recommendations page for personalized exercises
4. **Filter Exercises**: Use the filter options to find specific exercises
5. **Gym Management**: Admin users can manage gyms and members

## 🔒 Security Notes

- Change the `SECRET_KEY` in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Consider using PostgreSQL for production databases

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all dependencies are installed correctly
4. Verify the dataset file is present (`cleaned_megaGymDataset.csv`)

---

**Happy coding! 💪**
