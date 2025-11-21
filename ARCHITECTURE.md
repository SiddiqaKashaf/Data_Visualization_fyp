# 🏗️ System Architecture & Features Map

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATAVISION v2.0                             │
│              Professional Data Visualization Platform            │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
         ┌──────▼──────┐  ┌────▼────┐  ┌──────▼──────┐
         │  Frontend   │  │ Backend │  │  Database   │
         │  (React)    │  │(FastAPI)│  │(SQLite)     │
         └─────────────┘  └─────────┘  └─────────────┘
```

---

## Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│                   (Vite + Tailwind)                      │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │ Router  │      │  Pages  │      │Component│
   │(App.jsx)│      │          │      │Library  │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                 │
        │           ┌────▼──────────┐     │
        │           │               │     │
   ┌────▼─────┐ ┌─▼─────┐ ┌──────┬─▼──┐ ┌▼────────┐
   │ Auth     │ │Upload │ │Chart │Doc │ │ New    │
   │ Login    │ │ Data  │ │ & Vis│Mgt │ │ Insights
   │ Signup   │ │Page   │ │Page  │Pg │ │ Filters
   └──────────┘ └───┬───┘ └──┬───┴───┘ │ Export
                    │        │         └────────┘
                    │        └─────────┐
                    │                  │
           ┌────────▼────────┐   ┌────▼──────────┐
           │  Services       │   │  Components   │
           │  HTTP API calls │   │  Reusable UI  │
           └────────────────┘   └───────────────┘
                    │
                    └─────────────┐
                                  │
                        ┌─────────▼──────────┐
                        │   API Backend      │
                        │  (http://localhost│
                        │   :8000)           │
                        └────────────────────┘
```

---

## Backend Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FastAPI Backend                        │
│                  (Python + SQLAlchemy)                    │
└──────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼──────┐   ┌───▼──────┐   ┌───▼────────┐
    │ Models    │   │ Schemas  │   │ Endpoints  │
    │           │   │          │   │            │
    ├─ User    │   ├─ Login   │   ├─ /signup
    │ Document │   │ Data     │   ├─ /login
    └───┬──────┘   └────┬─────┘   ├─ /docs/*
        │               │         └─ /*
        │               │
    ┌───▼───────────────▼──────┐
    │   SQLAlchemy ORM        │
    │   Database Session      │
    └────────┬────────────────┘
             │
        ┌────▼─────────────┐
        │   SQLite DB      │
        │  (users.db)      │
        │                  │
        ├─ users table     │
        ├─ documents table │
        └──────────────────┘
```

---

## Data Flow Diagram

### 1. Upload Flow
```
User selects file
    ↓
Frontend parses file
    ↓
Extract: rows, cols, data
    ↓
Display preview & stats
    ↓
Save to localStorage (temp)
    ↓
Send to backend /documents/save
    ↓
Backend validates user
    ↓
Store binary data in DB
    ↓
Create Document record
    ↓
✅ File saved permanently
```

### 2. Filter Flow
```
User selects filter
    ↓
DataFilters component processes
    ↓
Apply to dataset in memory
    ↓
Call onFilterChange() callback
    ↓
Update filteredData state
    ↓
VisualizationPage re-renders
    ↓
Chart uses filtered data
    ↓
✅ Chart updates instantly
```

### 3. Insights Flow
```
Dataset loaded
    ↓
DataInsights component analyzes
    ↓
Calculate missing %
    ↓
Detect outliers (IQR)
    ↓
Classify data types
    ↓
Generate recommendations
    ↓
Render panels with results
    ↓
✅ Insights displayed
```

### 4. Export Flow
```
User clicks export button
    ↓
ExportTools component handles
    ↓
Converts data to format (CSV/JSON)
    ↓
Creates Blob object
    ↓
Creates download link
    ↓
Triggers browser download
    ↓
✅ File downloaded
```

---

## Component Hierarchy

```
App.jsx
├── LoginPage.jsx
├── UploadDataPage.jsx
│   └── (Dropzone + Preview)
├── VisualizationPage.jsx
│   ├── DataInsights.jsx ⭐ NEW
│   ├── DataFilters.jsx ⭐ NEW
│   ├── Chart Components
│   │   ├── Bar Chart
│   │   ├── Line Chart
│   │   ├── Pie Chart
│   │   └── Scatter Chart
│   └── ExportTools.jsx ⭐ NEW
├── DocumentsPage.jsx ⭐ NEW
│   └── (Document Table + CRUD)
└── ProfilePage.jsx
    └── (User Settings)
```

---

## Database Schema

```
┌─────────────────────────────┐
│        USERS TABLE          │
├─────────────────────────────┤
│ id (PK)                     │
│ name (VARCHAR)              │
│ email (VARCHAR UNIQUE)      │
│ hashed_password (VARCHAR)   │
└────────────────┬────────────┘
                 │ (1-to-Many)
                 │
┌────────────────▼─────────────────┐
│     DOCUMENTS TABLE             │
├─────────────────────────────────┤
│ id (PK)                         │
│ user_id (FK → users.id)         │
│ filename (VARCHAR)              │
│ file_data (BLOB)                │ ← Binary file content
│ file_type (VARCHAR)             │ ← csv, json, xlsx
│ created_at (DATETIME)           │
│ updated_at (DATETIME)           │
│ row_count (INTEGER)             │
│ col_count (INTEGER)             │
│ metadata (TEXT)                 │ ← JSON metadata
└─────────────────────────────────┘
```

---

## API Endpoints Map

```
┌──────────────────────────────────────────────────┐
│          DATAVISION API ENDPOINTS                │
├──────────────────────────────────────────────────┤

AUTH ENDPOINTS:
├─ POST   /signup
│         Create new user account
└─ POST   /login
          Authenticate user

DOCUMENT ENDPOINTS:
├─ POST   /documents/save
│         Upload and store file
├─ GET    /documents/list
│         Retrieve all user documents
├─ GET    /documents/{id}/download
│         Get file binary data
├─ PUT    /documents/{id}/rename
│         Rename a document
└─ DELETE /documents/{id}
          Delete a document

└──────────────────────────────────────────────────┘
```

---

## State Management Flow

### Global State (App.jsx)
```
App Component State:
├─ isLoggedIn (boolean)
├─ userName (string)
├─ userEmail (string) ← Passed to all pages
├─ parsedData (array)
├─ columnNames (array)
├─ dark (boolean)
└─ Methods:
   ├─ handleLogin()
   ├─ handleLogout()
   └─ Theme toggle
```

### Page-Level State
```
UploadDataPage:
├─ localData
├─ stats
├─ selectedCols
├─ showPreview

VisualizationPage:
├─ filteredData ← From DataFilters
├─ chartType
├─ xAxis, yAxis
├─ chartData

DocumentsPage:
├─ documents
├─ loading
├─ renaming

DataFilters:
├─ filters
├─ filterType
├─ searchText

DataInsights:
├─ insights (memoized)
└─ recommendations
```

---

## Feature Matrix

```
┌─────────────────┬──────────┬─────────┬──────────────┐
│    Feature      │ Frontend │ Backend │ Requirement  │
├─────────────────┼──────────┼─────────┼──────────────┤
│ Upload Files    │    ✅    │    ✅   │ User + File  │
│ Preview Data    │    ✅    │    -    │ (In Memory)  │
│ Save to DB      │    ✅    │    ✅   │ Logged In    │
│ Retrieve Files  │    ✅    │    ✅   │ User Auth    │
│ Download Files  │    ✅    │    ✅   │ File Owner   │
│ Rename Files    │    ✅    │    ✅   │ File Owner   │
│ Delete Files    │    ✅    │    ✅   │ File Owner   │
│ Data Analysis   │    ✅    │    -    │ Data Loaded  │
│ Outlier Detect  │    ✅    │    -    │ Numeric Data │
│ Advanced Filter │    ✅    │    -    │ Data Present │
│ Multiple Charts │    ✅    │    -    │ Data Present │
│ Export CSV      │    ✅    │    -    │ Data Present │
│ Export JSON     │    ✅    │    -    │ Data Present │
│ Export Chart    │    ✅    │    -    │ Chart Render │
│ Dark Mode       │    ✅    │    -    │ Browser      │
└─────────────────┴──────────┴─────────┴──────────────┘
```

---

## Technology Stack Summary

```
┌──────────────────────────────────────────┐
│         FRONTEND STACK                   │
├──────────────────────────────────────────┤
│ Framework: React 19                      │
│ Build Tool: Vite                         │
│ Styling: Tailwind CSS                    │
│ UI Icons: React Icons                    │
│ Charts: Chart.js + React-ChartJS-2       │
│ File Parsing: PapaParse, ExcelJS         │
│ Drag/Drop: React Dropzone                │
│ Routing: React Router v7                 │
│ Loading: React Spinners                  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│         BACKEND STACK                    │
├──────────────────────────────────────────┤
│ Framework: FastAPI                       │
│ Server: Uvicorn                          │
│ ORM: SQLAlchemy                          │
│ Database: SQLite                         │
│ Security: Bcrypt                         │
│ Validation: Pydantic                     │
│ CORS: fastapi.middleware.cors            │
│ Upload: python-multipart                 │
└──────────────────────────────────────────┘
```

---

## Deployment Architecture

```
Typical Production Setup:
┌─────────────────────────────────────────┐
│   Client Browser                        │
│   (React SPA)                           │
└────────┬────────────────────────────────┘
         │ HTTPS
┌────────▼────────────────────────────────┐
│   CDN / Static Files                    │
│   (Netlify, Vercel, S3)                 │
└─────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   API Gateway / Load Balancer           │
└────────┬────────────────────────────────┘
         │ HTTPS
┌────────▼────────────────────────────────┐
│   Docker Container                      │
│   - FastAPI App                         │
│   - Uvicorn Server                      │
│   (AWS EC2, GCP, Azure, DigitalOcean)   │
└────────┬────────────────────────────────┘
         │
┌────────▼────────────────────────────────┐
│   Database                              │
│   - PostgreSQL (Production)             │
│   - Cloud Storage: S3 (Files)           │
│   (AWS RDS, GCP CloudSQL)               │
└────────────────────────────────────────┘
```

---

## Performance Optimizations

```
Frontend Optimizations:
├─ React.memo() on expensive components
├─ useMemo() for insights calculations
├─ Lazy loading of documents
├─ Debounced filter updates
└─ Canvas rendering for charts

Backend Optimizations:
├─ Database indexes on:
│  ├─ users.email
│  ├─ documents.user_id
│  ├─ documents.created_at
│  └─ documents.filename
├─ Async file upload handling
├─ Query optimization with filters
└─ Connection pooling

Network Optimizations:
├─ Gzip compression
├─ Code splitting with Vite
├─ CDN for static assets
└─ API response caching
```

---

## Security Architecture

```
┌────────────────────────────────────────┐
│     SECURITY LAYERS                    │
├────────────────────────────────────────┤

1. AUTHENTICATION
   └─ Bcrypt hashing (password)
   └─ Email validation

2. AUTHORIZATION
   └─ User-document relationship check
   └─ Verify user owns document

3. DATA TRANSMISSION
   └─ HTTPS/TLS encryption
   └─ CORS validation

4. STORAGE
   └─ Binary storage in DB
   └─ Indexed queries for performance

5. INPUT VALIDATION
   └─ Pydantic schemas
   └─ Type checking

Future Improvements:
├─ JWT tokens for sessions
├─ Rate limiting
├─ Input sanitization
├─ SQL injection prevention ✅ (SQLAlchemy)
├─ XSS prevention ✅ (React)
└─ CSRF protection
```

---

This architecture provides:
- ✅ **Scalability**: Modular components
- ✅ **Reliability**: Error handling
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Performance**: Optimizations throughout
- ✅ **Security**: Multiple protection layers

**Ready for professional production deployment!**
