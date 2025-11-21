# 🚀 Quick Start Guide - DataVision v2.0

## Installation & Running the App

### Step 1: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Backend Server

```bash
cd backend
uvicorn main:app --reload
```

✅ Backend running at: `http://localhost:8000`

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 4: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

✅ Frontend running at: `http://localhost:5173`

---

## 📋 What's New in v2.0?

### 1️⃣ Document Storage (`Documents` page)
- Save all uploaded files permanently
- Download anytime
- Rename and organize
- View metadata (rows, columns, date)

### 2️⃣ Data Insights (Analytics Panel)
- Detect missing values
- Find outliers automatically
- Classify column data types
- Get actionable recommendations

### 3️⃣ Advanced Filters
- Filter numeric columns by range
- Filter categorical data
- Global search across all columns
- Real-time updates

### 4️⃣ Export Tools
- Export data to CSV
- Export data to JSON
- Export charts as PNG images

---

## 🎯 Usage Workflow

### Basic Workflow:
```
1. Sign Up / Login
2. Upload Data (auto-saves to Documents)
3. View Data Insights
4. Apply Filters
5. Create Visualization
6. Export Results
```

### Documents Management:
```
Navigate → Documents Page
├─ View all uploaded files
├─ Download any file
├─ Rename files
└─ Delete files
```

### Advanced Visualization:
```
Navigate → Visualize
├─ View Data Insights
├─ Apply Filters
├─ Select Chart Type
├─ Configure Axes
└─ Export as PNG
```

---

## 🔑 Key Features

| Feature | Location | Purpose |
|---------|----------|---------|
| **Document Storage** | Documents Page | Save & manage files |
| **Data Insights** | Visualize Page | Analyze data quality |
| **Filters** | Visualize Page | Subset data dynamically |
| **Export** | Visualize Page | Download data/charts |
| **Charts** | Visualize Page | Visualize patterns |

---

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- Bcrypt (Password security)

**Frontend:**
- React 19
- Tailwind CSS
- Chart.js
- React Router
- Vite

---

## 📊 Database

Automatically created: `backend/users.db`

**Tables:**
- `users` - User accounts
- `documents` - Stored files & metadata

---

## 🔒 Security

- ✅ Bcrypt password hashing
- ✅ User data isolation
- ✅ CORS enabled
- ✅ Email validation

---

## ❌ Troubleshooting

### Port Already in Use
```bash
# Backend (change port)
uvicorn main:app --reload --port 8001

# Frontend uses auto-increment
npm run dev  # Will use next available port
```

### Module Not Found
```bash
# Backend
pip install -r requirements.txt --upgrade

# Frontend
npm install --legacy-peer-deps
```

### Database Issues
```bash
# Delete and recreate
rm backend/users.db
# Restart backend - new DB will be created
```

### Frontend Won't Connect to Backend
- Ensure backend is running: `uvicorn main:app --reload`
- Check port 8000 is accessible
- Verify CORS is enabled in backend

---

## 📝 File Structure

```
backend/
├── main.py              # FastAPI app + endpoints
├── users.db            # SQLite database (auto-created)
└── requirements.txt    # Python dependencies

frontend/
├── src/
│   ├── App.jsx                 # Main router
│   ├── LoginPage.jsx           # Auth
│   ├── UploadDataPage.jsx      # File upload
│   ├── VisualizationPage.jsx   # Charts + insights
│   ├── DocumentsPage.jsx       # Document management ⭐ NEW
│   ├── ProfilePage.jsx         # User profile
│   ├── DataInsights.jsx        # Analytics ⭐ NEW
│   ├── DataFilters.jsx         # Filtering ⭐ NEW
│   ├── ExportTools.jsx         # Export ⭐ NEW
│   └── index.css               # Styles
├── package.json        # Node dependencies
└── vite.config.js      # Build config
```

---

## 🎓 Learn More

See `PROFESSIONAL_FEATURES.md` for:
- Detailed API documentation
- Advanced usage examples
- Future enhancement ideas
- Complete feature list

---

## ✨ Next Steps

After getting the app running:

1. **Create an account** (Sign up page)
2. **Upload sample data** (CSV/Excel/JSON)
3. **View insights** (Automatic analysis)
4. **Apply filters** (Subset your data)
5. **Create charts** (Visualize patterns)
6. **Export results** (Download data/images)

---

**Version:** 2.0
**Status:** Production Ready ✅
**Last Updated:** November 2024


