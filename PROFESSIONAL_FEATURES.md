# 📊 DataVision - Advanced Data Visualization Platform
## Professional Enhancements

This document outlines all the professional upgrades made to your FYP project.

---

## 🎯 New Features

### 1. **📁 Document Storage System**
Store all your uploaded datasets permanently in a database and manage them easily.

**Features:**
- ✅ Auto-save documents when uploading data
- ✅ View all uploaded documents with metadata
- ✅ Download any document anytime
- ✅ Rename documents for better organization
- ✅ Delete documents when no longer needed
- ✅ View creation date, row count, and column count

**Backend Endpoints:**
- `POST /documents/save` - Save uploaded file
- `GET /documents/list` - List all user documents
- `GET /documents/{id}/download` - Download a specific document
- `DELETE /documents/{id}` - Delete a document
- `PUT /documents/{id}/rename` - Rename a document

**Database Schema:**
```
Document Table:
- id (primary key)
- user_id (foreign key)
- filename
- file_data (binary)
- file_type (csv, json, xlsx)
- created_at, updated_at
- row_count, col_count
- metadata (JSON)
```

---

### 2. **🧠 Data Insights & Analytics**
Automatic analysis of your data with intelligent recommendations.

**Features:**
- 📊 Missing value detection and reporting
- 🎯 Outlier detection using IQR (Interquartile Range)
- 🏷️ Automatic column data type classification
- 💡 Smart recommendations for data quality improvement
- 📈 Dataset summary statistics

**Detects:**
- Columns with missing values > 10%
- Statistical outliers in numeric columns
- Small datasets that need more data
- Data type mismatches

---

### 3. **🔍 Advanced Data Filtering & Search**
Powerful tools to filter and search your data before visualization.

**Features:**
- 🔎 Global search across all columns
- 🎚️ Numeric range filters (min-max sliders)
- 🏷️ Categorical value filters
- 🎯 Multi-column filtering
- 📊 Real-time row count updates

**Supported Filter Types:**
- **Range Filters**: For numeric columns (set min/max bounds)
- **Exact Match**: For categorical data
- **Contains**: Text search within columns
- **Combined**: Apply multiple filters simultaneously

---

### 4. **📥 Export & Report Generation**
Export your visualizations and data in multiple formats.

**Features:**
- 📄 Export data to CSV (Excel compatible)
- 📋 Export data to JSON (structured format)
- 🖼️ Export charts as PNG images
- 📊 Formatted reports with metadata

**Export Options:**
1. **CSV Export**: Open in Excel, Google Sheets, etc.
2. **JSON Export**: For API integration or custom processing
3. **Chart Export**: Save visualizations as high-quality images

---

### 5. **📁 Documents Management Page**
New dedicated page for managing all your uploaded documents.

**Navigation:** Upload → Visualize → **Documents** → Profile

**Available Actions:**
- View all documents with full metadata
- Sort by creation date
- Quick rename functionality
- One-click download
- Delete with confirmation
- View statistics (total docs, rows, columns)

---

## 🏗️ Technical Implementation

### Backend Enhancements (Python/FastAPI)

**New Dependencies:**
```
python-dateutil==2.8.2
openpyxl==3.11.0
reportlab==4.0.9
```

**Database Migration:**
- Added `Document` table with relationships
- Added `get_db()` dependency injection
- User-document relationship (one-to-many)

### Frontend Enhancements (React)

**New Components:**
1. `DocumentsPage.jsx` - Document management interface
2. `DataInsights.jsx` - Analytics and recommendations
3. `DataFilters.jsx` - Advanced filtering UI
4. `ExportTools.jsx` - Export functionality

**Updated Components:**
- `App.jsx` - Added Documents route and navigation
- `UploadDataPage.jsx` - Auto-save to database integration
- `VisualizationPage.jsx` - Integrated insights, filters, and export tools

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- SQLite (included with Python)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 📖 Usage Guide

### 1. **Uploading Data**
1. Click "Upload" in the navbar
2. Drag & drop or select CSV/JSON/Excel file
3. File automatically saves to Documents
4. Select columns to preview
5. Click "Visualize My Data" when ready

### 2. **Managing Documents**
1. Click "Documents" in the navbar
2. View all your uploaded files
3. Rename files for better organization
4. Download files anytime
5. Delete files when no longer needed

### 3. **Advanced Visualization**
1. Click "Visualize" after uploading
2. **Insights Tab**: View data quality report
3. **Filters Tab**: Apply filters to subset data
4. **Chart Settings**: Select chart type and axes
5. **Export**: Download data or chart as image

### 4. **Data Analysis Workflow**
```
Upload Data → Review Insights → Apply Filters → Create Chart → Export Results
```

---

## 🎨 Features Breakdown

### Data Insights Panel
- **Missing Values**: Shows % of missing data per column
- **Outliers**: Displays count of statistical outliers
- **Data Types**: Categorizes columns (Numeric vs Categorical)
- **Recommendations**: Actionable suggestions for data quality

### Filter Panel
- Add/remove multiple filters
- Range filters for numeric data
- Dropdown selection for categories
- Global search box
- Real-time row count display

### Export Tools
- **CSV**: For spreadsheet applications
- **JSON**: For programmatic access
- **PNG**: High-resolution chart images

---

## 🔒 Security Features

- User authentication with bcrypt password hashing
- Document ownership verification
- Per-user data isolation
- CORS enabled for frontend communication

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  email VARCHAR UNIQUE,
  hashed_password VARCHAR
)
```

### Documents Table
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  filename VARCHAR,
  file_data BLOB,
  file_type VARCHAR,
  created_at DATETIME,
  updated_at DATETIME,
  row_count INTEGER,
  col_count INTEGER,
  metadata TEXT
)
```

---

## 🛠️ Future Enhancement Ideas

1. **Collaboration Features**
   - Share documents with other users
   - Set view/edit permissions
   - Audit log of changes

2. **Advanced Analytics**
   - Correlation analysis
   - Statistical hypothesis testing
   - Regression analysis

3. **Data Transformation**
   - Column mapping/transformation
   - Data normalization
   - Duplicate removal

4. **Scheduling**
   - Automatic report generation
   - Email notifications
   - Scheduled exports

5. **API Integration**
   - Connect external data sources
   - Real-time data updates
   - Webhooks

---

## 🐛 Troubleshooting

### Backend Won't Connect
- Ensure backend is running: `uvicorn main:app --reload`
- Check if port 8000 is available
- Verify CORS is enabled

### Documents Not Saving
- Check backend console for errors
- Verify database file exists (`users.db`)
- Ensure user is properly authenticated

### Charts Not Rendering
- Select both X and Y axes
- Verify data contains numeric values
- Check browser console for errors

### Export Not Working
- Ensure data is filtered/displayed
- Check browser download settings
- Verify Chrome/Firefox/Safari compatibility

---

## 📝 API Documentation

### Authentication Endpoints

#### Signup
```
POST /signup
Content-Type: multipart/form-data

name: string
email: string
password: string

Response: { success: true, message: "User created" }
```

#### Login
```
POST /login
Content-Type: multipart/form-data

email: string
password: string

Response: { 
  success: true, 
  message: "Login successful",
  name: string,
  email: string,
  user_id: int
}
```

### Document Management Endpoints

#### Save Document
```
POST /documents/save
Content-Type: multipart/form-data

email: string
filename: string
file_type: string (csv|json|xlsx)
row_count: int
col_count: int
file: binary

Response: { 
  success: true, 
  document_id: int,
  message: "Document saved successfully"
}
```

#### List Documents
```
GET /documents/list?email=user@example.com

Response: {
  documents: [
    {
      id: int,
      filename: string,
      file_type: string,
      created_at: ISO8601,
      updated_at: ISO8601,
      row_count: int,
      col_count: int
    }
  ]
}
```

#### Download Document
```
GET /documents/{document_id}/download?email=user@example.com

Response: {
  filename: string,
  file_data: string (hex encoded),
  file_type: string
}
```

#### Delete Document
```
DELETE /documents/{document_id}?email=user@example.com

Response: { success: true, message: "Document deleted" }
```

#### Rename Document
```
PUT /documents/{document_id}/rename?new_name=NewName&email=user@example.com

Response: { success: true, message: "Document renamed" }
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console errors
3. Check backend logs
4. Verify all dependencies are installed

---

## ✨ Version History

### v2.0 (Current)
- Added document storage system
- Implemented data insights
- Added advanced filtering
- Export functionality
- Professional UI improvements

### v1.0
- Basic authentication
- File upload
- Data preview
- Chart visualization

---

**Last Updated:** November 2024
**Status:** Production Ready ✅
